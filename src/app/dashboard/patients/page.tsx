'use client';

import { useEffect, useState, useMemo } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Alert from '@/components/Alert';
import Badge from '@/components/Badge';
import Tabs from '@/components/Tabs';
import { dateAPIToInput, dateInputToAPI, formatDateForDisplay, formatTimeForDisplay } from '@/utils/date.utils';
import { User, Calendar, FileText, Phone, Mail, Eye, Edit, Search, Plus, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';

interface Patient {
  patient_ID: number;
  first?: string;
  middle?: string;
  last?: string;
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
}

interface Appointment {
  appointment_ID?: number;
  patient_ID: number;
  date: string;
  time: string;
  type: string;
}

interface EHR {
  eHR_ID?: number;
  patient_ID: number;
  date: string;
  diagnosis?: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientEHR, setPatientEHR] = useState<EHR[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'age'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [formData, setFormData] = useState({
    first: '',
    middle: '',
    last: '',
    gender: 'Male',
    dob: '',
    phone: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with your API integration
      setPatients([]);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showAlert('error', 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        first: patient.first,
        middle: patient.middle || '',
        last: patient.last,
        gender: patient.gender,
        dob: dateAPIToInput(patient.dob),
        phone: patient.phone,
      });
    } else {
      setEditingPatient(null);
      setFormData({
        first: '',
        middle: '',
        last: '',
        gender: 'Male',
        dob: '',
        phone: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleViewPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
    setDetailsLoading(true);
    
    try {
      // Fetch appointments for this patient
      const allAppointments = await appointmentService.getAll() as Appointment[];
      const patientAppts = allAppointments.filter(apt => apt.patient_ID === patient.patient_ID);
      setPatientAppointments(patientAppts);

      // Fetch EHR for this patient
      const ehrData = await ehrService.getByPatient(patient.patient_ID) as EHR[];
      setPatientEHR(ehrData);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatient(null);
    setPatientAppointments([]);
    setPatientEHR([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        await patientService.update(editingPatient.patient_ID, {
          patient_ID: editingPatient.patient_ID,
          ...formData,
        });
        showAlert('success', 'Patient updated successfully');
      } else {
        await patientService.create(formData);
        showAlert('success', 'Patient created successfully');
      }
      handleCloseModal();
      fetchPatients();
    } catch (error) {
      showAlert('error', 'Operation failed');
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(patient => {
        const fullName = `${patient.first} ${patient.middle || ''} ${patient.last}`.toLowerCase();
        const phone = patient.phone.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || phone.includes(query);
      });
    }

    // Apply gender filter
    if (genderFilter !== 'All') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.first} ${a.last}`.toLowerCase();
        const nameB = `${b.first} ${b.last}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else {
        return calculateAge(a.dob) - calculateAge(b.dob);
      }
    });

    return filtered;
  }, [patients, searchQuery, genderFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'patient_ID',
      header: 'ID',
    },
    {
      key: 'name',
      header: 'Name',
      render: (patient: Patient) => (
        <div>
          <p className="font-semibold text-gray-900">
            {patient.first} {patient.middle ? patient.middle + ' ' : ''}{patient.last}
          </p>
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
    },
    {
      key: 'age',
      header: 'Age',
      render: (patient: Patient) => calculateAge(patient.dob),
    },
    {
      key: 'phone',
      header: 'Phone',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (patient: Patient) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewPatient(patient)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenModal(patient)}
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
      <div className="mb-4 flex items-center text-sm text-gray-600">
        <span className="hover:text-primary-600 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Patients</span>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <User className="w-8 h-8 text-primary-600" />
          PATIENTS
        </h1>
        <p className="text-gray-600 mt-2">Manage patient records and information</p>
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

      {/* Search and Actions */}
      <Card className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder=" Search by name or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Add Patient Button */}
          <Button onClick={() => handleOpenModal()} icon={<Plus className="w-4 h-4" />}>
            Add Patient
          </Button>
        </div>

        {/* Filters and Sort */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <div className="flex gap-2">
              {(['All', 'Male', 'Female'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setGenderFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    genderFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'age')}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="age">Age</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Patients Table */}
      <Card>
        <Table
          data={paginatedPatients as unknown as Record<string, unknown>[]}
          columns={columns as any}
          isLoading={isLoading}
          emptyMessage="No patients found. Add your first patient to get started."
        />

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of{' '}
              {filteredPatients.length} patients
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first"
              value={formData.first}
              onChange={handleChange}
              placeholder="Ahmed"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Middle Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Middle Name
            </label>
            <input
              type="text"
              name="middle"
              value={formData.middle}
              onChange={handleChange}
              placeholder="Hassan"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last"
              value={formData.last}
              onChange={handleChange}
              placeholder="Ali"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Gender & Date of Birth - 2 Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white cursor-pointer"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              {/* Auto-calculated Age */}
              {formData.dob && (
                <p className="mt-2 text-sm text-gray-600">
                  Age: {calculateAge(formData.dob)} years
                </p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+20 123 456 7890"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={handleCloseModal} size="lg">
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {editingPatient ? 'Update Patient' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Patient Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title="Patient Details"
        size="xl"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Information */}
            <Card title="Patient Information" noPadding>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedPatient.first} {selectedPatient.middle} {selectedPatient.last}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Patient ID: #{selectedPatient.patient_ID}</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Gender</p>
                        <p className="font-semibold text-gray-900">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-semibold text-gray-900">{formatDateForDisplay(selectedPatient.dob)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-4 h-4" /> Phone
                        </p>
                        <p className="font-semibold text-gray-900">{selectedPatient.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Appointments */}
            <Card title={`Appointments (${patientAppointments.length})`} noPadding>
              <div className="p-6">
                {detailsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : patientAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {patientAppointments.slice(0, 5).map((apt) => {
                      const isUpcoming = new Date(apt.date) >= new Date();
                      return (
                        <div 
                          key={apt.appointment_ID} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isUpcoming ? 'bg-blue-100' : 'bg-gray-200'
                            }`}>
                              <Calendar className={`w-6 h-6 ${
                                isUpcoming ? 'text-blue-600' : 'text-gray-500'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{apt.type}</p>
                              <p className="text-sm text-gray-600">
                                {formatDateForDisplay(apt.date)} at {formatTimeForDisplay(apt.time)}
                              </p>
                              <p className="text-xs text-gray-500">Ref: {apt.ref_Num}</p>
                            </div>
                          </div>
                          <Badge variant={isUpcoming ? 'info' : 'default'}>
                            {isUpcoming ? 'Upcoming' : 'Past'}
                          </Badge>
                        </div>
                      );
                    })}
                    {patientAppointments.length > 5 && (
                      <p className="text-sm text-center text-gray-500 mt-4">
                        + {patientAppointments.length - 5} more appointments
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No appointments found</p>
                )}
              </div>
            </Card>

            {/* EHR Records */}
            <Card title={`Health Records (${patientEHR.length})`} noPadding>
              <div className="p-6">
                {detailsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : patientEHR.length > 0 ? (
                  <div className="space-y-4">
                    {patientEHR.slice(0, 3).map((ehr, index) => (
                      <div key={ehr.ehr_ID || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-600" />
                            <Badge variant="info">EHR #{ehr.ehr_ID}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(ehr.updatedAt).toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {ehr.allergies && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Allergies</p>
                              <p className="text-sm text-red-600">{ehr.allergies}</p>
                            </div>
                          )}
                          {ehr.diagnosis && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                              <p className="text-sm text-gray-900">{ehr.diagnosis}</p>
                            </div>
                          )}
                          {ehr.periodontalStatus && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Periodontal Status</p>
                              <p className="text-sm text-gray-900">{ehr.periodontalStatus}</p>
                            </div>
                          )}
                          {ehr.medications && ehr.medications.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Medications</p>
                              <p className="text-sm text-gray-900">{ehr.medications.length} active</p>
                            </div>
                          )}
                        </div>

                        {ehr.clinicalNotes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">Clinical Notes</p>
                            <p className="text-sm text-gray-900 line-clamp-2">{ehr.clinicalNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {patientEHR.length > 3 && (
                      <p className="text-sm text-center text-gray-500 mt-4">
                        + {patientEHR.length - 3} more records
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No health records found</p>
                )}
              </div>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleCloseDetailModal}>
                Close
              </Button>
              <Button onClick={() => {
                handleCloseDetailModal();
                handleOpenModal(selectedPatient);
              }}>
                Edit Patient
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
