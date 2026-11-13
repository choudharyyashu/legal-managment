import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_TIME_ENTRIES } from '../data/mockTimeEntries';
import { MOCK_EXPENSES } from '../data/mockExpenses';
import { MOCK_INVOICES } from '../data/mockInvoices';
import { INITIAL_REVIEW_SLOTS } from '../data/mockTimeReviewSchedules';
import { mockStorage } from '../services/mockStorage';

const TimeContext = createContext();

export function TimeProvider({ children }) {
  const [timeEntries, setTimeEntries] = useState(() => {
    return mockStorage.get('time_entries', MOCK_TIME_ENTRIES);
  });

  const [expenses, setExpenses] = useState(() => {
    return mockStorage.get('expenses', MOCK_EXPENSES);
  });

  const [invoices, setInvoices] = useState(() => {
    return mockStorage.get('invoices', MOCK_INVOICES);
  });

  const [cosmoLexExports, setCosmoLexExports] = useState(() => {
    return mockStorage.get('cosmolex_exports', [
      {
        batchId: 'COSMO-2026-1101',
        exportedAt: '2026-11-04 18:30',
        exportedBy: 'Rachel Adams',
        entriesCount: 8,
        totalHours: 32.4,
        totalAmount: 14850.00,
        status: 'Synchronized',
        syncReference: 'CX-API-99812-UT',
      },
      {
        batchId: 'COSMO-2026-1025',
        exportedAt: '2026-10-25 17:00',
        exportedBy: 'Rachel Adams',
        entriesCount: 15,
        totalHours: 64.0,
        totalAmount: 29400.00,
        status: 'Synchronized',
        syncReference: 'CX-API-99430-UT',
      }
    ]);
  });

  const [reviewSlots, setReviewSlots] = useState(INITIAL_REVIEW_SLOTS);

  const markSlotReviewed = (slotId) => {
    setReviewSlots(prev => prev.map(slot => (
      slot.id === slotId
        ? {
            ...slot,
            reviewStatus: 'Completed',
            lastReviewedTime: 'Just now (Mountain Time)',
          }
        : slot
    )));
  };

  useEffect(() => {
    mockStorage.set('time_entries', timeEntries);
  }, [timeEntries]);

  useEffect(() => {
    mockStorage.set('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    mockStorage.set('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    mockStorage.set('cosmolex_exports', cosmoLexExports);
  }, [cosmoLexExports]);

  const addTimeEntry = (entryData) => {
    const id = `TIM-${500 + timeEntries.length + 1}`;
    const hours = parseFloat(entryData.hours) || 0;
    const rate = parseFloat(entryData.rate) || 0;
    const amount = hours * rate;

    const newEntry = {
      id,
      hours,
      rate,
      amount,
      isBillable: entryData.isBillable !== false,
      status: entryData.status || 'Submitted',
      reviewComment: null,
      exportedToCosmoLex: false,
      exportBatchId: null,
      createdAt: new Date().toISOString(),
      ...entryData,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const approveTimeEntry = (id, comment = 'Approved by review supervisor') => {
    setTimeEntries(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'Approved',
          reviewComment: comment,
        };
      }
      return t;
    }));
  };

  const rejectTimeEntry = (id, comment) => {
    setTimeEntries(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'Rejected',
          reviewComment: comment || 'Entry rejected during review.',
        };
      }
      return t;
    }));
  };

  const addExpense = (expenseData) => {
    const id = `EXP-${300 + expenses.length + 1}`;
    const newExpense = {
      id,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const addInvoice = (invoiceData) => {
    const id = `INV-2026-${String(invoices.length + 105).padStart(3, '0')}`;
    const invoiceNumber = `HB-2026-${1100 + invoices.length + 1}`;
    const newInvoice = {
      id,
      invoiceNumber,
      status: 'Sent',
      issueDate: new Date().toISOString().split('T')[0],
      paidAmount: 0,
      balanceDue: invoiceData.totalAmount,
      ...invoiceData,
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const recordPayment = (invoiceId, paymentAmount, method, reference) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = Number((inv.paidAmount + paymentAmount).toFixed(2));
        const newBalance = Number(Math.max(0, inv.totalAmount - newPaid).toFixed(2));
        const status = newBalance === 0 ? 'Paid' : 'Partially Paid';
        return {
          ...inv,
          paidAmount: newPaid,
          balanceDue: newBalance,
          status,
          paymentMethod: method || 'FedWire / ACH',
        };
      }
      return inv;
    }));
  };

  const exportApprovedToCosmoLex = (entryIds, userName = 'Rachel Adams') => {
    const selectedEntries = timeEntries.filter(t => entryIds.includes(t.id) && t.status === 'Approved');
    if (selectedEntries.length === 0) return null;

    const batchId = `COSMO-2026-${Date.now().toString().slice(-4)}`;
    const totalHours = selectedEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
    const totalAmount = selectedEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

    const newBatch = {
      batchId,
      exportedAt: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      exportedBy: userName,
      entriesCount: selectedEntries.length,
      totalHours: Number(totalHours.toFixed(1)),
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'Synchronized',
      syncReference: `CX-API-${Math.floor(10000 + Math.random() * 90000)}-DEMO`,
    };

    // Update time entries
    setTimeEntries(prev => prev.map(t => {
      if (entryIds.includes(t.id)) {
        return {
          ...t,
          status: 'Exported',
          exportedToCosmoLex: true,
          exportBatchId: batchId,
        };
      }
      return t;
    }));

    setCosmoLexExports(prev => [newBatch, ...prev]);
    return newBatch;
  };

  return (
    <TimeContext.Provider value={{
      timeEntries,
      addTimeEntry,
      approveTimeEntry,
      rejectTimeEntry,
      expenses,
      addExpense,
      invoices,
      addInvoice,
      recordPayment,
      cosmoLexExports,
      exportApprovedToCosmoLex,
      reviewSlots,
      markSlotReviewed,
    }}>
      {children}
    </TimeContext.Provider>
  );
}

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) throw new Error('useTime must be used within TimeProvider');
  return context;
};

