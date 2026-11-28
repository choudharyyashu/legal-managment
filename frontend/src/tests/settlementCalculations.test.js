import { describe, it, expect } from 'vitest';
import {
  calculateSettlement,
  toCents,
  centsToDollars,
  resolveApprovedLienCents,
  resolveEligibleExpenseCents,
} from '../../utils/settlementCalculations';

describe('Priority 2: PI Settlement Calculator Authoritative Rules & Scenarios', () => {
  describe('Client Required Scenario A', () => {
    // Gross: $100,000, Signed fee: 30%, Original lien: $10,000, Approved negotiated payoff: $7,000
    // Expenses: filing ($400), records ($600), expert ($2,000)
    it('accurately calculates Scenario A without deducting original lien balance', () => {
      const expenses = [
        { id: 'exp-1', label: 'Filing Fee', amount: 400, status: 'POSTED' },
        { id: 'exp-2', label: 'Records Retrieval', amount: 600, status: 'POSTED' },
        { id: 'exp-3', label: 'Expert Witness', amount: 2000, status: 'POSTED' },
      ];
      const liens = [
        {
          id: 'lien-1',
          holder: 'IHC Health Services',
          originalAmount: 10000,
          negotiatedAmount: 7000,
          status: 'APPROVED',
        },
      ];

      const result = calculateSettlement({
        grossRecovery: 100000,
        feeRate: 30,
        caseExpenses: expenses,
        medicalLiens: liens,
      });

      expect(result.numericGross).toBe(100000);
      expect(result.contingencyFeeAmount).toBe(30000); // 30% of $100,000
      expect(result.totalCaseExpenses).toBe(3000); // $400 + $600 + $2,000
      expect(result.totalMedicalLiens).toBe(7000); // $7,000 approved payoff (NOT $10,000)
      expect(result.totalNonFeeDeductions).toBe(10000); // $3,000 + $7,000
      expect(result.totalDeductions).toBe(40000); // $30,000 + $10,000
      expect(result.netClientProceeds).toBe(60000); // $100,000 - $30,000 - $3,000 - $7,000 = $60,000
    });
  });

  describe('Client Required Scenario B (Payoff renegotiation from $7,000 to $6,500)', () => {
    it('recalculates client net to $60,500 with exact $500 delta', () => {
      const expenses = [
        { id: 'exp-1', label: 'Filing Fee', amount: 400, status: 'POSTED' },
        { id: 'exp-2', label: 'Records Retrieval', amount: 600, status: 'POSTED' },
        { id: 'exp-3', label: 'Expert Witness', amount: 2000, status: 'POSTED' },
      ];
      const updatedLiens = [
        {
          id: 'lien-1',
          holder: 'IHC Health Services',
          originalAmount: 10000,
          negotiatedAmount: 6500, // Reduced from $7,000 to $6,500
          status: 'APPROVED',
        },
      ];

      const result = calculateSettlement({
        grossRecovery: 100000,
        feeRate: 30,
        caseExpenses: expenses,
        medicalLiens: updatedLiens,
      });

      expect(result.contingencyFeeAmount).toBe(30000);
      expect(result.totalCaseExpenses).toBe(3000);
      expect(result.totalMedicalLiens).toBe(6500);
      expect(result.netClientProceeds).toBe(60500); // Exactly $500 more for the client
    });
  });

  describe('Deduplication & Exactly-Once Deductions', () => {
    it('prevents duplicate deductions when identical expense or lien IDs appear multiple times', () => {
      const duplicatedExpenses = [
        { id: 'exp-1', label: 'Filing Fee', amount: 400 },
        { id: 'exp-1', label: 'Filing Fee Duplicate', amount: 400 }, // same ID
        { id: 'exp-2', label: 'Deposition', amount: 500 },
      ];
      const duplicatedLiens = [
        { id: 'lien-1', holder: 'Hospital', negotiatedAmount: 2000 },
        { id: 'lien-1', holder: 'Hospital Repost', negotiatedAmount: 2000 }, // same ID
      ];

      const result = calculateSettlement({
        grossRecovery: 10000,
        feeRate: 33.33,
        caseExpenses: duplicatedExpenses,
        medicalLiens: duplicatedLiens,
      });

      expect(result.totalCaseExpenses).toBe(900); // 400 + 500 (NOT 1300)
      expect(result.totalMedicalLiens).toBe(2000); // 2000 (NOT 4000)
    });

    it('excludes void, draft, and rejected expenses', () => {
      const mixedExpenses = [
        { id: 'exp-1', label: 'Valid Filing', amount: 150, status: 'POSTED' },
        { id: 'exp-2', label: 'Draft Expense', amount: 250, status: 'DRAFT' },
        { id: 'exp-3', label: 'Voided Expense', amount: 500, status: 'VOID' },
        { id: 'exp-4', label: 'Rejected Advance', amount: 1000, status: 'REJECTED' },
      ];

      const result = calculateSettlement({
        grossRecovery: 5000,
        feeRate: 33.33,
        caseExpenses: mixedExpenses,
      });

      expect(result.totalCaseExpenses).toBe(150);
    });

    it('excludes unapproved, rejected, or disputed liens', () => {
      const mixedLiens = [
        { id: 'lien-1', holder: 'Approved Med', negotiatedAmount: 1200, status: 'APPROVED' },
        { id: 'lien-2', holder: 'Disputed Lien', negotiatedAmount: 800, status: 'DISPUTED' },
        { id: 'lien-3', holder: 'Rejected Lien', negotiatedAmount: 600, status: 'REJECTED' },
      ];

      const result = calculateSettlement({
        grossRecovery: 10000,
        feeRate: 33.33,
        medicalLiens: mixedLiens,
      });

      expect(result.totalMedicalLiens).toBe(1200);
    });
  });

  describe('Decimal-Safe Currency & Boundary Conditions', () => {
    it('handles exact one-third fee correctly without floating-point drift', () => {
      const result = calculateSettlement({
        grossRecovery: 100000,
        feeRateOption: 'exact',
      });
      // 100,000 / 3 = 33,333.33
      expect(result.contingencyFeeAmount).toBe(33333.33);
      expect(result.netClientProceeds).toBe(66666.67);
      expect(result.contingencyFeeAmount + result.netClientProceeds).toBe(100000);
    });

    it('handles boundary conditions: zero gross, negative, empty arrays', () => {
      const resultZero = calculateSettlement({ grossRecovery: 0 });
      expect(resultZero.numericGross).toBe(0);
      expect(resultZero.contingencyFeeAmount).toBe(0);
      expect(resultZero.netClientProceeds).toBe(0);

      const resultNegative = calculateSettlement({ grossRecovery: -500 });
      expect(resultNegative.numericGross).toBe(0);
      expect(resultNegative.netClientProceeds).toBe(0);
    });
  });
});
