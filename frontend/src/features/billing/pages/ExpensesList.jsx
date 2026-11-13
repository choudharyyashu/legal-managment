import React, { useState } from 'react';
import { Receipt, Plus, Search, Filter, DollarSign, Calendar } from 'lucide-react';
import { useTime } from '../../../context/TimeContext';
import { useMatters } from '../../../context/MatterContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/ui/Toast';
import { PageHeader } from '../../../components/shared/PageHeader';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { SearchBar } from '../../../components/shared/SearchBar';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { formatDate } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';

export function ExpensesList() {
  const { expenses, addExpense } = useTime();
  const { matters } = useMatters();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New expense form
  const [category, setCategory] = useState('Court Filing Fees');
  const [matterId, setMatterId] = useState(matters[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const filteredExpenses = expenses.filter(e =>
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.matterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !matterId) {
      addToast('Please provide an amount and select a matter.', 'error');
      return;
    }

    const matter = matters.find(m => m.id === matterId);
    addExpense({
      category,
      matterId,
      matterTitle: matter?.title || 'Matter',
      clientId: matter?.clientId || 'CLI-1001',
      clientName: matter?.clientName || 'Client',
      amount: parseFloat(amount),
      date,
      description,
      enteredByName: currentUser.name,
      status: 'Approved',
    });

    addToast(`Expense disbursement of ${formatCurrency(amount)} recorded.`, 'success');
    setIsAddModalOpen(false);
    setAmount('');
    setDescription('');
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-[#06244B]">{formatDate(val, { short: true })}</span>,
    },
    {
      key: 'category',
      label: 'Disbursement Category',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F0E5] text-[#06244B] border border-[#D9D6CF]">
          {val}
        </span>
      ),
    },
    {
      key: 'matterTitle',
      label: 'Matter & Client',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-xs text-[#06244B] block max-w-xs truncate">{val}</span>
          <span className="text-[11px] text-[#667085]">{row.clientName}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Expense Purpose & Payee',
      render: (val) => <span className="text-xs text-[#202A35] max-w-md block line-clamp-2">{val}</span>,
    },
    {
      key: 'amount',
      label: 'Amount ($)',
      sortable: true,
      align: 'right',
      render: (val) => <span className="text-xs font-bold text-[#B42318]">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matter Expenses &amp; Disbursements"
        subtitle="Record out-of-pocket litigation expenses, filing fees, expert witness retainers, and deposition costs."
        breadcrumbs={[{ label: 'Billing & Accounting', to: '/billing' }, { label: 'Expenses' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Expense
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-md w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search expenses by category or case..."
          />
        </div>

        <div className="p-3 bg-white rounded border border-[#D9D6CF] text-xs flex items-center gap-3">
          <span className="text-[#667085]">Total Disbursements:</span>
          <span className="font-serif font-bold text-base text-[#B42318]">{formatCurrency(totalExpenseAmount)}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredExpenses}
        pageSize={8}
      />

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Matter Expense"
        subtitle="Log advanced disbursement to be billed to the client."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Select
                label="Expense Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Court Filing Fees', label: 'Court Filing Fees' },
                  { value: 'Expert Witness Retainer', label: 'Expert Witness Retainer' },
                  { value: 'Deposition Transcript', label: 'Deposition Transcript / Video' },
                  { value: 'Service of Process', label: 'Service of Process / Constable' },
                  { value: 'Travel & Mileage', label: 'Travel & Mileage' },
                  { value: 'Document Investigation', label: 'Document & Public Records Search' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Related Matter"
                required
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
                options={matters.map(m => ({ value: m.id, label: `${m.matterNumber} - ${m.title}` }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Amount ($)"
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <DatePicker
                label="Disbursement Date"
                required
                value={date}
                onChange={setDate}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A35] uppercase mb-1">
              Description &amp; Payee Vendor Details
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Paid to Intermountain Court Reporters for expedited deposition transcript..."
              className="w-full text-sm p-3 rounded border border-[#D9D6CF] focus:outline-none focus:border-[#06244B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9D6CF]">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Save Expense Disbursement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

