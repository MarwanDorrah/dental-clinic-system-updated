'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDateForDisplay, formatTimeForDisplay } from '@/utils/date.utils';
import { User, Calendar, FileText, Phone, Edit, ArrowLeft, Activity, Plus } from 'lucide-react';

interface Patient {
  patient_ID: number;
  first?: string;
  middle?: string;
  last?: string;
  name?: string;
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

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = Number(params.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ehrRecords, setEhrRecords] = useState<EHR[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with your API integration
      setPatient(null);
      setAppointments([]);
      setEhrRecords([]);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Patient not found</p>
        <Button onClick={() => router.push('/dashboard/patients')} className="mt-4">
          Back to Patients
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/patients')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
            <p className="text-gray-600 mt-1">View patient information and records</p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/patients`)}
          icon={<Edit className="w-4 h-4" />}
        >
          Edit Patient
        </Button>
      </div>

      {/* Patient Information */}
      <Card className="mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-12 h-12 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">
              {patient.first} {patient.middle} {patient.last}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Patient ID: #{patient.patient_ID}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-semibold text-gray-900">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-semibold text-gray-900">{calculateAge(patient.dob)} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-lg font-semibold text-gray-900">{formatDateForDisplay(patient.dob)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Phone
                </p>
                <p className="text-lg font-semibold text-gray-900">{patient.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Appointments ({appointments.length})
            </h3>
          </div>
          
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => {
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
              {appointments.length > 5 && (
                <p className="text-sm text-center text-gray-500 mt-4">
                  + {appointments.length - 5} more appointments
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No appointments found</p>
          )}
        </Card>

        {/* Health Records */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Health Records ({ehrRecords.length})
            </h3>
          </div>

          {ehrRecords.length > 0 ? (
            <div className="space-y-4">
              {/* Show the single EHR record for this patient */}
              {ehrRecords.slice(0, 1).map((ehr, index) => (
                <div key={ehr.ehr_ID || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-600" />
                      <Badge variant="info">EHR #{ehr.ehr_ID}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(ehr.updatedAt).toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
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
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/dashboard/ehr/edit/${ehrRecords[0]?.ehr_ID}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Health Record
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No health record found for this patient</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/dashboard/ehr/new?patientId=${patient?.patient_ID}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Health Record
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
