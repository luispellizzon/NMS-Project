// src/app/admin/doctors/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building, Award, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getDoctorById, updateDoctorByAdmin } from '@/lib/firebase/services/admin-service';
import { getDoctorPatients } from '@/lib/firebase/services/doctor-service';
import { getPatientById } from '@/lib/firebase/services/patient-service';
import { Doctor } from '@/types/doctor';

interface PatientSummary {
  id: string;
  fullName: string;
  email: string;
  riskLevel?: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    hospital: '',
    bio: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const doctorData = await getDoctorById(doctorId);
        if (doctorData) {
          setDoctor(doctorData);
          setFormData({
            fullName: doctorData.fullName || '',
            email: doctorData.email || '',
            phone: (doctorData as any).phone || '',
            specialty: (doctorData as any).specialty || '',
            hospital: (doctorData as any).hospital || '',
            bio: (doctorData as any).bio || '',
          });

          // Fetch patients
          const patientIds = await getDoctorPatients(doctorId);
          const patientDetails = await Promise.all(
            patientIds.map(async (id) => {
              const patient = await getPatientById(id);
              if (patient) {
                return {
                  id,
                  fullName: patient.fullName,
                  email: patient.email,
                  riskLevel: patient.riskLevel,
                };
              }
              return null;
            })
          );
          setPatients(patientDetails.filter((p): p is PatientSummary => p !== null));
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [doctorId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoctorByAdmin(doctorId, formData);
      setDoctor({ ...doctor!, ...formData });
      setEditing(false);
      router.replace(`/admin/doctors/${doctorId}`);
    } catch (error) {
      console.error('Error updating doctor:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Doctor not found</p>
        <Link href="/admin/doctors" className="text-primary hover:underline mt-2 inline-block">
          Back to doctors list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/doctors"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {editing ? 'Edit Doctor' : doctor.fullName}
          </h1>
          <p className="text-muted-foreground">
            {editing ? 'Update doctor information' : 'Doctor details and patients'}
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Info */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-6">
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Hospital</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setEditing(false);
                    router.replace(`/admin/doctors/${doctorId}`);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={Mail} label="Email" value={doctor.email} />
                <InfoItem icon={Phone} label="Phone" value={(doctor as any).phone || 'Not provided'} />
                <InfoItem icon={Award} label="Specialty" value={(doctor as any).specialty || 'Not specified'} />
                <InfoItem icon={Building} label="Hospital" value={(doctor as any).hospital || 'Not specified'} />
                <InfoItem icon={Users} label="Patients" value={patients.length.toString()} />
                <InfoItem
                  icon={Calendar}
                  label="Joined"
                  value={doctor.createdAt.toLocaleDateString()}
                />
              </div>
              {(doctor as any).bio && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
                  <p className="text-foreground">{(doctor as any).bio}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patients List */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Assigned Patients ({patients.length})</h2>
          {patients.length === 0 ? (
            <p className="text-muted-foreground text-sm">No patients assigned</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {patients.map((patient) => (
                <div key={patient.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="font-medium text-sm">{patient.fullName}</div>
                  <div className="text-xs text-muted-foreground">{patient.email}</div>
                  {patient.riskLevel && (
                    <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${
                      patient.riskLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      patient.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {patient.riskLevel} Risk
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
