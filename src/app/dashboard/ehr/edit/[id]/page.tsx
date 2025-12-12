'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, X, Save, FileText, Upload, Loader } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import PatientAutocomplete from '@/components/PatientAutocomplete';
import Alert from '@/components/Alert';

interface Patient {
  patient_ID: number;
  first: string;
  middle?: string;
  last: string;
  gender: string;
  dob: string;
  phone: string;
}

interface Appointment {
  appointment_ID: number;
  date: string;
  time: string;
  type: string;
  patient_ID: number;
}

interface EHR {
  ehr_ID?: number;
  patient_ID: number;
  appointmentId?: number;
  allergies?: string;
  medicalAlerts?: string;
  history?: string;
  diagnosis?: string;
  xRayFindings?: string;
  periodontalStatus?: string;
  treatments?: string;
  clinicalNotes?: string;
  recommendations?: string;
  medications?: any[];
  procedures?: any[];
  teeth?: any[];
  xRays?: any[];
}

interface Section {
  id: number;
  title: string;
  isOpen: boolean;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate: string;
  notes: string;
}

interface Procedure {
  id: string;
  code: string;
  description: string;
  toothNumber: string;
  status: string;
  performedAt: string;
  notes: string;
}

interface ToothRecord {
  id: string;
  toothNumber: number;
  condition: string;
  treatmentPlanned: string;
  treatmentCompleted: boolean;
  completedDate: string;
  surfacesAffected: string;
  notes: string;
}

interface XRay {
  id: string;
  type: string;
  findings: string;
  takenAt: string;
  takenBy: string;
  imageUrl: string;
  notes: string;
}

export default function EditEHRPage() {
  const router = useRouter();
  const params = useParams();
  const ehrId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  
  const [sections, setSections] = useState<Section[]>([
    { id: 1, title: 'SECTION 1: GENERAL MEDICAL INFORMATION', isOpen: true },
    { id: 2, title: 'SECTION 2: DIAGNOSIS & FINDINGS', isOpen: true },
    { id: 3, title: 'SECTION 3: MEDICATIONS', isOpen: true },
    { id: 4, title: 'SECTION 4: PROCEDURES PERFORMED', isOpen: true },
    { id: 5, title: 'SECTION 5: TOOTH CHART', isOpen: true },
    { id: 6, title: 'SECTION 6: X-RAYS', isOpen: true },
    { id: 7, title: 'SECTION 7: TREATMENT & RECOMMENDATIONS', isOpen: true },
  ]);

  // Form data
  const [allergies, setAllergies] = useState('');
  const [medicalAlerts, setMedicalAlerts] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [xRayFindings, setXRayFindings] = useState('');
  const [periodontalStatus, setPeriodontalStatus] = useState('');
  const [treatmentsProvided, setTreatmentsProvided] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // Dynamic arrays
  const [medications, setMedications] = useState<Medication[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [toothRecords, setToothRecords] = useState<ToothRecord[]>([]);
  const [xrays, setXRays] = useState<XRay[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEHRData();
  }, [ehrId]);

  const loadEHRData = async () => {
    if (!ehrId) return;

    try {
      setIsLoading(true);
      console.log('Loading EHR with ID:', ehrId);
      // Mock data - replace with your API integration
      const ehr = {} as EHR;
      console.log('Loaded EHR data:', ehr);
      
      // Load patient
      if (ehr.patient_ID) {
        // Mock data - replace with your API integration
        const patient = {} as Patient;
        setSelectedPatient(patient);
      }

      // Set form data
      setAllergies(ehr.allergies || '');
      setMedicalAlerts(ehr.medicalAlerts || '');
      setMedicalHistory(ehr.history || '');
      setPrimaryDiagnosis(ehr.diagnosis || '');
      setXRayFindings(ehr.xRayFindings || '');
      setPeriodontalStatus(ehr.periodontalStatus || '');
      setTreatmentsProvided(ehr.treatments || '');
      setClinicalNotes(ehr.clinicalNotes || '');
      setRecommendations(ehr.recommendations || '');
      setSelectedAppointmentId(ehr.appointmentId?.toString() || '');

      // Load medications
      if (ehr.medications && ehr.medications.length > 0) {
        setMedications(ehr.medications.map((m, i) => ({
          id: `med-${i}`,
          name: m.name || '',
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          route: m.route || 'Oral',
          startDate: m.startDate || '',
          endDate: m.endDate || '',
          notes: m.notes || '',
        })));
      }

      // Load procedures
      if (ehr.procedures && ehr.procedures.length > 0) {
        setProcedures(ehr.procedures.map((p, i) => ({
          id: `proc-${i}`,
          code: p.code || '',
          description: p.description || '',
          toothNumber: p.toothNumber || '',
          status: p.status || 'Planned',
          performedAt: p.performedAt || '',
          notes: p.notes || '',
        })));
      }

      // Load tooth records
      if (ehr.teeth && ehr.teeth.length > 0) {
        setToothRecords(ehr.teeth.map((t, i) => ({
          id: `tooth-${i}`,
          toothNumber: t.toothNumber || 11,
          condition: t.condition || '',
          treatmentPlanned: (t as any).treatment || (t as any).treatmentPlanned || '',
          treatmentCompleted: (t as any).treatmentCompleted === 'Yes' || (t as any).treatmentCompleted === true,
          completedDate: '',
          surfacesAffected: (t as any).surfaces || (t as any).surfacesAffected || '',
          notes: t.notes || '',
        })));
      }

      // Load X-rays
      if (ehr.xRays && ehr.xRays.length > 0) {
        setXRays(ehr.xRays.map((x, i) => ({
          id: `xray-${i}`,
          type: x.type || 'Periapical',
          findings: x.findings || '',
          takenAt: x.takenAt || '',
          takenBy: (x as any).takenBy || '',
          imageUrl: (x as any).imagePath || (x as any).imageUrl || '',
          notes: x.notes || '',
        })));
      }

      // Load appointments for this patient
      if (ehr.patient_ID) {
        // Mock data - replace with your API integration
        setAppointments([]);
      }

    } catch (error) {
      console.error('Error loading EHR:', error);
      showAlert('error', 'Failed to load EHR data');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const toggleSection = (id: number) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  // Medication handlers
  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      route: 'Oral',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
    };
    setMedications([...medications, newMed]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  // Procedure handlers
  const addProcedure = () => {
    const newProc: Procedure = {
      id: Date.now().toString(),
      code: '',
      description: '',
      toothNumber: '',
      status: 'Planned',
      performedAt: new Date().toISOString().slice(0, 16),
      notes: '',
    };
    setProcedures([...procedures, newProc]);
  };

  const removeProcedure = (id: string) => {
    setProcedures(procedures.filter(p => p.id !== id));
  };

  const updateProcedure = (id: string, field: keyof Procedure, value: string) => {
    setProcedures(procedures.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Tooth record handlers
  const addToothRecord = () => {
    const newTooth: ToothRecord = {
      id: Date.now().toString(),
      toothNumber: 11,
      condition: '',
      treatmentPlanned: '',
      treatmentCompleted: false,
      completedDate: '',
      surfacesAffected: '',
      notes: '',
    };
    setToothRecords([...toothRecords, newTooth]);
  };

  const removeToothRecord = (id: string) => {
    setToothRecords(toothRecords.filter(t => t.id !== id));
  };

  const updateToothRecord = (id: string, field: keyof ToothRecord, value: any) => {
    setToothRecords(toothRecords.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  // X-Ray handlers
  const addXRay = () => {
    const newXRay: XRay = {
      id: Date.now().toString(),
      type: 'Periapical',
      findings: '',
      takenAt: new Date().toISOString().slice(0, 16),
      takenBy: '',
      imageUrl: '',
      notes: '',
    };
    setXRays([...xrays, newXRay]);
  };

  const removeXRay = (id: string) => {
    setXRays(xrays.filter(x => x.id !== id));
  };

  const updateXRay = (id: string, field: keyof XRay, value: string) => {
    setXRays(xrays.map(x => 
      x.id === id ? { ...x, [field]: value } : x
    ));
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!selectedPatient || !selectedAppointmentId) {
      showAlert('error', 'Patient and appointment are required');
      return;
    }

    if (!primaryDiagnosis && !isDraft) {
      showAlert('error', 'Primary diagnosis is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const ehrData = {
        ehr_ID: parseInt(ehrId),
        patient_ID: selectedPatient.patient_ID,
        appointmentId: parseInt(selectedAppointmentId),
        diagnosis: primaryDiagnosis || '',
        treatments: treatmentsProvided || '',
        allergies: allergies || '',
        history: medicalHistory || '',
        medicalAlerts: medicalAlerts || '',
        xRayFindings: xRayFindings || '',
        periodontalStatus: periodontalStatus || '',
        clinicalNotes: clinicalNotes || '',
        recommendations: recommendations || '',
        medications: medications.length > 0 ? medications.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          route: m.route,
          startDate: m.startDate,
          endDate: m.endDate,
          notes: m.notes,
        })) : [],
        procedures: procedures.length > 0 ? procedures.map(p => ({
          code: p.code,
          description: p.description,
          status: p.status,
          toothNumber: p.toothNumber,
          performedAt: p.performedAt,
          notes: p.notes,
        })) : [],
        xRays: xrays.length > 0 ? xrays.map(x => ({
          type: x.type,
          findings: x.findings,
          takenAt: x.takenAt,
          takenBy: x.takenBy || '',
          notes: x.notes,
        })) : [],
        teeth: toothRecords.length > 0 ? toothRecords.map(t => ({
          toothNumber: t.toothNumber,
          condition: t.condition,
          treatmentPlanned: t.treatmentPlanned,
          notes: t.notes,
        })) : [],
      };

      console.log('Updating EHR with data:', ehrData);
      await ehrService.update(parseInt(ehrId), ehrData);
      showAlert('success', isDraft ? 'EHR draft saved successfully' : 'EHR updated successfully');
      setTimeout(() => router.push('/dashboard/ehr'), 1500);
    } catch (error: any) {
      console.error('Error saving EHR:', error);
      const errorMessage = error?.error || error?.message || 'Failed to save EHR';
      showAlert('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading EHR data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Electronic Health Record</h1>
          <p className="text-gray-600 mt-1">Update patient health record documentation</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Update EHR
          </Button>
        </div>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <Card>
        <div className="space-y-6">
          {/* Patient Info - Read Only */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Patient Information</h3>
            {selectedPatient && (
              <p className="text-blue-800">
                {selectedPatient.first} {selectedPatient.last} - 
                {selectedPatient.gender} - DOB: {selectedPatient.dob}
              </p>
            )}
          </div>

          {/* Appointment Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Appointment <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an appointment...</option>
              {appointments.map((apt) => (
                <option key={apt.appointment_ID} value={apt.appointment_ID}>
                  {apt.date} - {apt.time} - {apt.type}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Include all sections from new page */}
          {/* Section 1-7 would go here - same as new page but with pre-filled values */}
          {/* For brevity, showing just the structure */}
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>EHR ID: #{ehrId}</p>
            <p>Last Updated: {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
            >
              <FileText className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Update EHR
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
