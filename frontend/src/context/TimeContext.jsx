import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { timeService } from '../services/timeService';
import { expenseService } from '../services/expenseService';
import { billingService } from '../services/billingService';
import { useAuth } from '../hooks/useAuth';
import { INITIAL_REVIEW_SLOTS } from '../data/mockTimeReviewSchedules';

const TimeContext = createContext();

export function TimeProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [timeEntries, setTimeEntries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [cosmoLexExports, setCosmoLexExports] = useState([]);
  const [reviewSlots, setReviewSlots] = useState(INITIAL_REVIEW_SLOTS);
  const [loading, setLoading] = useState(false);

  const normalizeTimeEntry = (t) => {
    const hours = Number(t.hours) || 0;
    const rate = Number(t.rate) || 0;
    const amount = Number((hours * rate).toFixed(2));
    return {
      ...t,
      id: t.id,
      hours,
      rate,
      amount,
      matterId: t.matterId,
      matterName: t.matter?.title || t.matterName || 'Matter',
      userName: t.user?.name || t.userName || 'Staff Member',
      activityType: t.activityType || 'Legal Analysis',
      description: t.description || '',
      date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      isBillable: t.isBillable !== false,
      status: t.status || 'Submitted',
      reviewComment: t.rejectionComment || t.reviewComment || null,
      exportedToCosmoLex: Boolean(t.isExported || t.exportedToCosmoLex),
    };
  };

  const normalizeExpense = (e) => ({
    ...e,
    id: e.id,
    amount: Number(e.amount) || 0,
    matterId: e.matterId,
    matterName: e.matter?.title || e.matterName || 'Matter',
    category: e.category || 'Other',
    vendorName: e.vendorName || 'Vendor',
    date: e.date ? new Date(e.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isBillable: e.isBillable !== false,
    status: e.status || 'Unbilled',
  });

  const normalizeInvoice = (i) => ({
    ...i,
    id: i.id,
    invoiceNumber: i.invoiceNumber || i.id,
    clientId: i.clientId,
    clientName: i.client?.name || i.clientName || 'Client',
    matterId: i.matterId,
    matterName: i.matter?.title || i.matterName || 'Matter',
    totalAmount: Number(i.totalAmount) || 0,
    paidAmount: Number(i.paidAmount) || 0,
    balanceDue: Number(i.balanceDue) || 0,
    status: i.status || 'Draft',
    issueDate: i.issueDate ? new Date(i.issueDate).toISOString().split('T')[0] : '',
    dueDate: i.dueDate ? new Date(i.dueDate).toISOString().split('T')[0] : '',
  });

  const refreshTimeEntries = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await timeService.getTimeEntries({ limit: 100 });
      const raw = Array.isArray(data?.entries) ? data.entries : [];
      setTimeEntries(raw.map(normalizeTimeEntry));
    } catch (err) {
      console.warn('Failed to load time entries from API:', err?.message);
    }
  }, [isAuthenticated]);

  const refreshExpenses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await expenseService.getExpenses({ limit: 100 });
      const raw = Array.isArray(data?.expenses) ? data.expenses : [];
      setExpenses(raw.map(normalizeExpense));
    } catch (err) {
      console.warn('Failed to load expenses from API:', err?.message);
    }
  }, [isAuthenticated]);

  const refreshInvoices = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await billingService.getInvoices({ limit: 100 });
      const raw = Array.isArray(data?.invoices) ? data.invoices : [];
      setInvoices(raw.map(normalizeInvoice));
    } catch (err) {
      console.warn('Failed to load invoices from API:', err?.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.allSettled([refreshTimeEntries(), refreshExpenses(), refreshInvoices()]).finally(() => {
        setLoading(false);
      });
    } else {
      setTimeEntries([]);
      setExpenses([]);
      setInvoices([]);
    }
  }, [isAuthenticated, refreshTimeEntries, refreshExpenses, refreshInvoices]);

  const markSlotReviewed = (slotId) => {
    setReviewSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              reviewStatus: 'Completed',
              lastReviewedTime: 'Just now (Mountain Time)',
            }
          : slot
      )
    );
  };

  const addTimeEntry = async (entryData) => {
    try {
      const payload = {
        matterId: entryData.matterId,
        date: entryData.date || new Date().toISOString().split('T')[0],
        hours: Number(entryData.hours) || 1,
        rate: Number(entryData.rate) || 350,
        activityType: entryData.activityType || 'Legal Analysis',
        activityCode: entryData.activityCode || undefined,
        description: entryData.description || 'Professional legal services rendered.',
        isBillable: entryData.isBillable !== false,
      };

      const created = await timeService.createTimeEntry(payload);
      const normalized = normalizeTimeEntry(created);
      setTimeEntries((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const approveTimeEntry = async (id, comment = 'Approved by review supervisor') => {
    try {
      const updated = await timeService.approveTimeEntry(id, { status: 'Approved' });
      const normalized = normalizeTimeEntry(updated);
      setTimeEntries((prev) => prev.map((t) => (t.id === id ? normalized : t)));
    } catch (err) {
      console.warn('Failed to approve time entry on API:', err?.message);
      setTimeEntries((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'Approved', reviewComment: comment } : t))
      );
    }
  };

  const rejectTimeEntry = async (id, comment = 'Rejection noted during partner review.') => {
    try {
      const updated = await timeService.approveTimeEntry(id, { status: 'Rejected', rejectionComment: comment });
      const normalized = normalizeTimeEntry(updated);
      setTimeEntries((prev) => prev.map((t) => (t.id === id ? normalized : t)));
    } catch (err) {
      console.warn('Failed to reject time entry on API:', err?.message);
      setTimeEntries((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'Rejected', reviewComment: comment } : t))
      );
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const payload = {
        matterId: expenseData.matterId,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        category: expenseData.category || 'Court Filing Fee',
        amount: Number(expenseData.amount) || 0,
        vendorName: expenseData.vendorName || undefined,
        isBillable: expenseData.isBillable !== false,
      };

      const created = await expenseService.createExpense(payload);
      const normalized = normalizeExpense(created);
      setExpenses((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const addInvoice = async (invoiceData) => {
    try {
      const payload = {
        clientId: invoiceData.clientId,
        matterId: invoiceData.matterId,
        issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: invoiceData.notes || undefined,
        lineItems: Array.isArray(invoiceData.lineItems) && invoiceData.lineItems.length > 0
          ? invoiceData.lineItems
          : [
              {
                itemType: 'FlatFee',
                description: 'Legal representation and docket management retainer',
                quantity: 1,
                unitRate: Number(invoiceData.totalAmount) || 5000,
              },
            ],
      };

      const created = await billingService.createInvoice(payload);
      const normalized = normalizeInvoice(created);
      setInvoices((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      throw err;
    }
  };

  const recordPayment = async (invoiceId, paymentAmount, method, reference) => {
    try {
      const payload = {
        invoiceId,
        amount: Number(paymentAmount) || 0,
        paymentMethod: method || 'Check',
        destinationAccount: 'Operating Account (1000)',
        transactionReference: reference || undefined,
        receivedDate: new Date().toISOString().split('T')[0],
      };

      await billingService.recordPayment(payload);
      await refreshInvoices();
    } catch (err) {
      console.warn('Failed to record payment on API:', err?.message);
      // Optimistic fallback
      setInvoices((prev) =>
        prev.map((inv) => {
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
        })
      );
    }
  };

  const exportApprovedToCosmoLex = (entryIds, userName = 'Rachel Adams') => {
    const selectedEntries = timeEntries.filter((t) => entryIds.includes(t.id) && t.status === 'Approved');
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
        hour12: false,
      }),
      exportedBy: userName,
      entriesCount: selectedEntries.length,
      totalHours: Number(totalHours.toFixed(1)),
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'Synchronized',
      syncReference: `CX-API-${Math.floor(10000 + Math.random() * 90000)}-SYNC`,
    };

    setTimeEntries((prev) =>
      prev.map((t) => {
        if (entryIds.includes(t.id)) {
          return {
            ...t,
            status: 'Exported',
            exportedToCosmoLex: true,
            exportBatchId: batchId,
          };
        }
        return t;
      })
    );

    setCosmoLexExports((prev) => [newBatch, ...prev]);
    return newBatch;
  };

  return (
    <TimeContext.Provider
      value={{
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
        loading,
        refreshTimeEntries,
        refreshExpenses,
        refreshInvoices,
      }}
    >
      {children}
    </TimeContext.Provider>
  );
}

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) throw new Error('useTime must be used within TimeProvider');
  return context;
};
