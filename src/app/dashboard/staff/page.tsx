'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Alert from '@/components/Alert';

interface Doctor {
  doctor_ID?: number;
  id?: number;
  name: string;
  email?: string;
  phone?: string;
}

interface Nurse {
  nurse_ID: number;
  name: string;
  email?: string;
  phone?: string;
}

export default function StaffPage() {
  const isDoctor = true; // Mock - replace with your auth logic
  const [activeTab, setActiveTab] = useState<'doctors' | 'nurses'>('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Doctor | Nurse | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with your API integration
      setDoctors([]);
      setNurses([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('error', 'Failed to load staff data');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (item?: Doctor | Nurse) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        phone: item.phone,
        email: item.email,
        password: '',
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', phone: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === 'doctors') {
        if (editingItem && 'id' in editingItem) {
          const updateData = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          };
          await doctorService.update((editingItem as Doctor).id, updateData);
          showAlert('success', 'Doctor updated successfully');
        } else {
          await doctorService.create(formData);
          showAlert('success', 'Doctor created successfully');
        }
      } else {
        if (editingItem && 'nurse_ID' in editingItem) {
          const updateData = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          };
          await nurseService.update((editingItem as Nurse).nurse_ID, updateData);
          showAlert('success', 'Nurse updated successfully');
        } else {
          await nurseService.create(formData);
          showAlert('success', 'Nurse created successfully');
        }
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      showAlert('error', 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this nurse?')) {
      try {
        // Mock delete - replace with your API integration
        showAlert('success', 'Nurse deleted successfully');
        fetchData();
      } catch (error) {
        showAlert('error', 'Delete failed');
      }
    }
  };

  const doctorColumns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'name', 
      header: 'Name',
      render: (doctor: Doctor) => `Dr. ${doctor.name}`
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: 'Actions',
      render: (doctor: Doctor) => isDoctor ? (
        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(doctor)}>
          Edit
        </Button>
      ) : null,
    },
  ];

  const nurseColumns = [
    { key: 'nurse_ID', header: 'ID' },
    { 
      key: 'name', 
      header: 'Name',
      render: (nurse: Nurse) => nurse.name
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: 'Actions',
      render: (nurse: Nurse) => isDoctor ? (
        <div className="flex space-x-2">
          <Button size="sm" variant="secondary" onClick={() => handleOpenModal(nurse)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(nurse.nurse_ID)}>
            Delete
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage doctors and nurses</p>
        </div>
        {isDoctor && (
          <Button onClick={() => handleOpenModal()}>
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {activeTab === 'doctors' ? 'Doctor' : 'Nurse'}
          </Button>
        )}
      </div>

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'doctors'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab('nurses')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'nurses'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nurses
          </button>
        </div>
      </div>

      <Card>
        {activeTab === 'doctors' ? (
          <Table
            data={doctors as unknown as Record<string, unknown>[]}
            columns={doctorColumns as any}
            isLoading={isLoading}
            emptyMessage="No doctors found."
          />
        ) : (
          <Table
            data={nurses as unknown as Record<string, unknown>[]}
            columns={nurseColumns as any}
            isLoading={isLoading}
            emptyMessage="No nurses found."
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? `Edit ${activeTab === 'doctors' ? 'Doctor' : 'Nurse'}` : `Add New ${activeTab === 'doctors' ? 'Doctor' : 'Nurse'}`}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={activeTab === 'doctors' ? 'e.g., Dr. John Smith' : 'e.g., Jane Smith'}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {!editingItem && (
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
            />
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
