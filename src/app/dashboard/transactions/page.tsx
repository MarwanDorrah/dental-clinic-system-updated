'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Alert from '@/components/Alert';
import Badge from '@/components/Badge';
import { formatDateForDisplay } from '@/utils/date.utils';

interface StockTransaction {
  transaction_ID: number;
  supply_ID: number;
  quantity: number;
  type: string;
  date: string;
  notes?: string;
}
import { TrendingUp, TrendingDown, Plus, ChevronRight } from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    supply_ID: '',
    quantity: '',
    type: 'in',
    notes: '',
  });

  const isDoctor = true; // Mock - replace with your auth logic

  useEffect(() => {
    if (!isDoctor) {
      router.push('/dashboard');
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with your API integration
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showAlert('error', 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = () => {
    setFormData({
      supply_ID: '',
      quantity: '',
      type: 'in',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mock create - replace with your API integration
      showAlert('success', 'Transaction recorded successfully');
      handleCloseModal();
      fetchTransactions();
    } catch (error: any) {
      showAlert('error', error.message || 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'transaction_ID',
      header: 'Transaction ID',
    },
    {
      key: 'supply_ID',
      header: 'Supply ID',
    },
    {
      key: 'type',
      header: 'Type',
      render: (transaction: StockTransaction) => (
        <div className="flex items-center gap-2">
          {transaction.type === 'in' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <Badge variant={transaction.type === 'in' ? 'success' : 'danger'}>
            {transaction.type.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (transaction: StockTransaction) => (
        <span className={`font-semibold ${
          transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (transaction: StockTransaction) => formatDateForDisplay(transaction.date),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (transaction: StockTransaction) => (
        <span className="text-sm text-gray-600">
          {transaction.notes || '-'}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <span className="hover:text-primary-600 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Transactions</span>
        </div>
        <Button 
          size="sm" 
          onClick={handleOpenModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary-600" />
          STOCK TRANSACTIONS
        </h1>
        <p className="text-gray-600 mt-2">Track inventory movements and stock changes</p>
      </div>

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <div className="mb-4 flex justify-end">
          <Button onClick={handleOpenModal} icon={<Plus className="w-4 h-4" />}>
            Record Transaction
          </Button>
        </div>

        <Table
          data={transactions as unknown as Record<string, unknown>[]}
          columns={columns as any}
          isLoading={isLoading}
          emptyMessage="No transactions found. Record your first transaction to get started."
        />
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Record Stock Transaction"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Supply ID"
            type="number"
            name="supply_ID"
            value={formData.supply_ID}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="in">Stock In (Received)</option>
              <option value="out">Stock Out (Used)</option>
            </select>
          </div>

          <Input
            label="Quantity"
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Optional notes about this transaction..."
            />
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              Record Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
