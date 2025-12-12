'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import Tabs from '@/components/Tabs';
import Modal from '@/components/Modal';
import Badge from '@/components/Badge';
import EHRTimeline from '@/components/EHRTimeline';
import { FileText, Activity, Eye, History, Clock, Edit, Plus, Download } from 'lucide-react';

interface Patient {
  patient_ID: number;
  first: string;
  middle?: string;
  last: string;
  gender: string;
  dob: string;
  phone: string;
}

interface EHR {
  ehr_ID: number;
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
  changeLogs?: any[];
  updatedAt: string;
}

export default function EHRPage() {
  const router = useRouter();
  const [ehrs, setEhrs] = useState<EHR[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedEHR, setSelectedEHR] = useState<EHR | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'timeline'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with your API integration
      setEhrs([]);
      setPatients([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('error', 'Failed to load EHR data');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleOpenHistoryModal = (ehr: EHR) => {
    setSelectedEHR(ehr);
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedEHR(null);
  };

  const handleExportHistory = () => {
    if (!selectedEHR) return;
    
    // Create a simple text export of the change history
    const changes = selectedEHR.changeLogs || [];
    const exportText = `Change History - EHR #${selectedEHR.ehr_ID}\n` +
      `Total Changes: ${changes.length}\n` +
      `Last Updated: ${new Date(selectedEHR.updatedAt).toLocaleString()}\n\n` +
      changes.map(log => 
        `${new Date((log as any).timestamp).toLocaleString()}\n` +
        `User: ${(log as any).changedBy}\n` +
        `Action: ${log.changeType}\n` +
        `Field: ${log.fieldName}\n` +
        (log.oldValue ? `Old Value: ${log.oldValue}\n` : '') +
        (log.newValue ? `New Value: ${log.newValue}\n` : '') +
        `\n---\n`
      ).join('\n');
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EHR_${selectedEHR.ehr_ID}_History.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePatientChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    setSelectedPatient(patientId);

    if (patientId) {
      try {
        // Mock data - replace with your API integration
        setEhrs([]);
      } catch (error) {
        showAlert('error', 'Failed to load patient EHRs');
      }
    } else {
      fetchData();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Electronic Health Records</h1>
        <p className="text-gray-600 mt-1">View and manage patient health records (one EHR per patient)</p>
      </div>

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="mb-6">
        <Card>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Patient:</label>
            <select
              value={selectedPatient}
              onChange={handlePatientChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.patient_ID} value={patient.patient_ID}>
                  {patient.first} {patient.last}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Patient Records', count: ehrs.length },
            { id: 'details', label: 'Details' },
            { id: 'timeline', label: 'Timeline' },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'overview' | 'details' | 'timeline')}
        />
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : ehrs.length > 0 ? (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ehrs.slice(0, 6).map((ehr, index) => (
                <Card key={ehr.ehr_ID || `ehr-${index}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {ehr.patient?.first} {ehr.patient?.last}
                        </h3>
                        <p className="text-xs text-gray-500">EHR #{ehr.ehr_ID}</p>
                      </div>
                      <FileText className="w-5 h-5 text-primary-500" />
                    </div>
                    
                    {ehr.diagnosis && (
                      <p className="text-sm text-gray-700 line-clamp-2">{ehr.diagnosis}</p>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200 space-y-3">
                      <p className="text-xs text-gray-500">
                        Last update: {Math.floor((new Date().getTime() - new Date(ehr.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                      
                      {/* Stats Row */}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>💊 {ehr.medications?.length || 0} Medications</span>
                        <span>🦷 {ehr.procedures?.length || 0} Procedures</span>
                        <span>📸 {ehr.xRays?.length || 0} X-Rays</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('details')}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/dashboard/ehr/edit/${ehr.ehr_ID}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenHistoryModal(ehr)}
                        >
                          History
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {ehrs.map((ehr, index) => (
                <Card key={ehr.ehr_ID || `ehr-${index}`}>
                  <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Patient: {ehr.patient?.first} {ehr.patient?.last}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Last Updated: {new Date(ehr.updatedAt).toLocaleString()} by {ehr.updatedBy}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                    EHR #{ehr.ehr_ID}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ehr.allergies && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Allergies</p>
                      <p className="text-gray-900">{ehr.allergies}</p>
                    </div>
                  )}
                  {ehr.medicalAlerts && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Medical Alerts</p>
                      <p className="text-gray-900">{ehr.medicalAlerts}</p>
                    </div>
                  )}
                  {ehr.diagnosis && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                      <p className="text-gray-900">{ehr.diagnosis}</p>
                    </div>
                  )}
                  {ehr.periodontalStatus && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Periodontal Status</p>
                      <p className="text-gray-900">{ehr.periodontalStatus}</p>
                    </div>
                  )}
                </div>

                {ehr.clinicalNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Clinical Notes</p>
                    <p className="text-gray-900 mt-1">{ehr.clinicalNotes}</p>
                  </div>
                )}

                {ehr.recommendations && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Recommendations</p>
                    <p className="text-gray-900 mt-1">{ehr.recommendations}</p>
                  </div>
                )}

                {ehr.medications && ehr.medications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Medications</p>
                    <div className="space-y-2">
                      {ehr.medications.map((med, index) => (
                        <div key={med.medication_ID || `med-${ehr.ehr_ID}-${index}`} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">{med.name} - {med.dosage}</p>
                          <p className="text-sm text-gray-600">
                            {med.frequency} ({med.route}) | {med.startDate} to {med.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ehr.procedures && ehr.procedures.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Procedures</p>
                    <div className="space-y-2">
                      {ehr.procedures.map((proc, index) => (
                        <div key={proc.procedure_ID || `proc-${ehr.ehr_ID}-${index}`} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">
                            {proc.description} (Code: {proc.code})
                          </p>
                          <p className="text-sm text-gray-600">
                            Tooth #{proc.toothNumber} | Status: {proc.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <Card>
              <EHRTimeline
                changeLogs={ehrs.flatMap(ehr => ehr.changeLogs || [])}
                ehrRecords={ehrs}
              />
            </Card>
          )}
        </>
      ) : (
        <Card>
          <p className="text-center text-gray-500 py-12">No EHR records found</p>
        </Card>
      )}

      {/* Change History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseHistoryModal}
        title={`Change History - EHR #${selectedEHR?.ehr_ID || ''}`}
        size="xl"
      >
        {selectedEHR && (
          <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">📊 Total Changes: {selectedEHR.changeLogs?.length || 0}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Last Updated: {new Date(selectedEHR.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Change Log List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {selectedEHR.changeLogs && selectedEHR.changeLogs.length > 0 ? (
                selectedEHR.changeLogs.map((log, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                    {/* Timestamp and User */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date((log as any).timestamp || selectedEHR.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      {(log as any).changedBy || selectedEHR.updatedBy || 'System'}
                    </p>

                    {/* Change Type */}
                    <div className="space-y-2">
                      {log.changeType === 'Added' && (
                        <div className="flex items-start gap-2">
                          <Plus className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">ADDED: {log.fieldName}</p>
                            {log.newValue && (
                              <p className="text-sm text-gray-700 mt-1">"{log.newValue}"</p>
                            )}
                          </div>
                        </div>
                      )}

                      {log.changeType === 'Modified' && (
                        <div className="flex items-start gap-2">
                          <Edit className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">UPDATED: {log.fieldName}</p>
                            {log.oldValue && (
                              <p className="text-sm text-gray-600 mt-1">
                                Old: "{log.oldValue}"
                              </p>
                            )}
                            {log.newValue && (
                              <p className="text-sm text-gray-700 mt-1">
                                New: "{log.newValue}"
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {log.changeType === 'Deleted' && (
                        <div className="flex items-start gap-2">
                          <Badge variant="danger">DELETED: {log.fieldName}</Badge>
                          {log.oldValue && (
                            <p className="text-sm text-gray-600 mt-1">
                              Removed: "{log.oldValue}"
                            </p>
                          )}
                        </div>
                      )}

                      {log.changeType === 'Created' && (
                        <div className="flex items-start gap-2">
                          <Plus className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-primary-900">CREATED: EHR Record</p>
                            <p className="text-sm text-gray-700 mt-1">
                              Initial creation for appointment {(log as any).appointmentRef || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No change history available</p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-between">
              <Button
                variant="outline"
                onClick={handleExportHistory}
                icon={<Download className="w-4 h-4" />}
              >
                Export History
              </Button>
              <Button onClick={handleCloseHistoryModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
