import React, { useState } from 'react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  method: string;
  description: string;
  date: string;
  reference: string;
}

interface TransactionFilters {
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  method: string;
}

const TransactionHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  
  const [filters, setFilters] = useState<TransactionFilters>({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    method: ''
  });

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 100.00,
      status: 'completed',
      method: 'Credit Card',
      description: 'Deposit via Visa ****1234',
      date: '2024-01-15T10:30:00Z',
      reference: 'DEP001234'
    },
    {
      id: '2',
      type: 'bet',
      amount: -25.00,
      status: 'completed',
      method: 'Account Balance',
      description: 'Lakers vs Warriors - Lakers Win',
      date: '2024-01-15T14:45:00Z',
      reference: 'BET001235'
    },
    {
      id: '3',
      type: 'win',
      amount: 45.50,
      status: 'completed',
      method: 'Account Balance',
      description: 'Lakers vs Warriors - Payout',
      date: '2024-01-15T16:20:00Z',
      reference: 'WIN001236'
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: -50.00,
      status: 'pending',
      method: 'Bank Transfer',
      description: 'Withdrawal to Chase Bank ****5678',
      date: '2024-01-14T09:15:00Z',
      reference: 'WTH001237'
    },
    {
      id: '5',
      type: 'bonus',
      amount: 20.00,
      status: 'completed',
      method: 'Account Balance',
      description: 'Welcome Bonus',
      date: '2024-01-13T12:00:00Z',
      reference: 'BON001238'
    },
    {
      id: '6',
      type: 'deposit',
      amount: 200.00,
      status: 'completed',
      method: 'PayPal',
      description: 'Deposit via PayPal',
      date: '2024-01-12T18:30:00Z',
      reference: 'DEP001239'
    },
    {
      id: '7',
      type: 'bet',
      amount: -15.00,
      status: 'completed',
      method: 'Account Balance',
      description: 'Chiefs vs Bills - Under 45.5',
      date: '2024-01-12T20:15:00Z',
      reference: 'BET001240'
    },
    {
      id: '8',
      type: 'withdrawal',
      amount: -100.00,
      status: 'failed',
      method: 'Credit Card',
      description: 'Withdrawal to Visa ****1234 (Failed)',
      date: '2024-01-11T11:45:00Z',
      reference: 'WTH001241'
    }
  ]);

  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'bet', label: 'Bets' },
    { value: 'win', label: 'Wins' },
    { value: 'bonus', label: 'Bonuses' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentMethods = [
    { value: '', label: 'All Methods' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'PayPal', label: 'PayPal' },
    { value: 'Account Balance', label: 'Account Balance' }
  ];

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesStatus = !filters.status || transaction.status === filters.status;
    const matchesMethod = !filters.method || transaction.method === filters.method;
    
    const transactionDate = new Date(transaction.date);
    const matchesDateFrom = !filters.dateFrom || transactionDate >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || transactionDate <= new Date(filters.dateTo);
    
    return matchesType && matchesStatus && matchesMethod && matchesDateFrom && matchesDateTo;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      method: ''
    });
    setCurrentPage(1);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (format === 'csv') {
        // Generate CSV content
        const csvContent = [
          ['Date', 'Type', 'Description', 'Amount', 'Status', 'Method', 'Reference'].join(','),
          ...filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            `"${t.description}"`,
            t.amount,
            t.status,
            t.method,
            t.reference
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      // Show success notification
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100';
      case 'pending': return 'text-warning-600 bg-warning-100';
      case 'failed': return 'text-error-600 bg-error-100';
      case 'cancelled': return 'text-neutral-600 bg-neutral-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'bet': return '🎯';
      case 'win': return '🏆';
      case 'bonus': return '🎁';
      default: return '📋';
    }
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Transaction History</h2>
          <p className="text-secondary text-sm mt-1">
            View and manage your account transactions
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="btn btn-secondary btn-sm"
          >
            {isExporting ? (
              <>
                <span className="loading-spinner mr-2"></span>
                Exporting...
              </>
            ) : (
              '📊 Export CSV'
            )}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="btn btn-secondary btn-sm"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="font-semibold text-primary">Filters</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="form-select"
              >
                {transactionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Method</label>
              <select
                name="method"
                value={filters.method}
                onChange={handleFilterChange}
                className="form-select"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-primary">
            <button
              onClick={handleClearFilters}
              className="btn btn-ghost btn-sm"
            >
              🗑️ Clear Filters
            </button>
            <div className="text-sm text-secondary">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary">
                  <th className="text-left p-4 font-medium text-secondary">Date</th>
                  <th className="text-left p-4 font-medium text-secondary">Type</th>
                  <th className="text-left p-4 font-medium text-secondary">Description</th>
                  <th className="text-right p-4 font-medium text-secondary">Amount</th>
                  <th className="text-center p-4 font-medium text-secondary">Status</th>
                  <th className="text-left p-4 font-medium text-secondary">Method</th>
                  <th className="text-left p-4 font-medium text-secondary">Reference</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-secondary">
                      No transactions found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-primary hover:bg-secondary">
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(transaction.date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                          <span className="text-sm font-medium capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{transaction.description}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`text-sm font-medium font-mono ${
                          transaction.amount >= 0 ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {formatAmount(transaction.amount)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          getStatusColor(transaction.status)
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{transaction.method}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-mono text-tertiary">
                          {transaction.reference}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-secondary">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-ghost btn-sm"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn btn-sm ${
                    currentPage === page ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-ghost btn-sm"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 