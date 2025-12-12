'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Alert from '@/components/Alert';
import { Heart, Plus, Eye, Edit, ChevronRight } from 'lucide-react';

interface Nurse {
  nurse_ID: number;
  name: string;
  email?: string;
  phone?: string;
}

export default function NursesPage() {
  const router = useRouter();
  const isDoctor = true; // Mock - replace with your auth logic
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!isDoctor) {
      router.push('/dashboard');
      return;
    }
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with your API integration
      setNurses([]);
    } catch (error) {
      console.error('Error fetching nurses:', error);
      showAlert('error', 'Failed to load nurses');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (nurse?: Nurse) => {
    if (nurse) {
      setEditingNurse(nurse);
      setFormData({
        name: nurse.name,
        phone: nurse.phone,
        email: nurse.email,
        password: '',
      });
    } else {
      setEditingNurse(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNurse(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNurse) {
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        };
        // Mock update - replace with your API integration
        showAlert('success', 'Nurse updated successfully');
      } else {
        // Mock create - replace with your API integration
        showAlert('success', 'Nurse created successfully');
      }
      handleCloseModal();
      fetchNurses();
    } catch (error) {
      showAlert('error', 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'nurse_ID',
      header: 'ID',
    },
    {
      key: 'name',
      header: 'Name',
      render: (nurse: Nurse) => (
        <p className="font-semibold text-gray-900">
          {nurse.name}
        </p>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (nurse: Nurse) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/dashboard/nurses/${nurse.nurse_ID}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenModal(nurse)}
          >
            Edit
          </Button>
        </div>
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
          <span className="text-gray-900 font-medium">Nurses</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Add
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary-600" />
          NURSES
        </h1>
        <p className="text-gray-600 mt-2">Manage nurse information and profiles</p>
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

      {/* Nurses Table */}
      <Card>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>
            Add Nurse
          </Button>
        </div>

        <Table
          data={nurses as unknown as Record<string, unknown>[]}
          columns={columns as any}
          isLoading={isLoading}
          emptyMessage="No nurses found. Add your first nurse to get started."
        />
      </Card>

      {/* Add/Edit Nurse Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingNurse ? 'Edit Nurse' : 'Add New Nurse'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Jane Smith"
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 123-456-7890"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g., nurse@clinic.com"
            required
          />
          {!editingNurse && (
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
            />
          )}

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingNurse ? 'Update Nurse' : 'Create Nurse'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
