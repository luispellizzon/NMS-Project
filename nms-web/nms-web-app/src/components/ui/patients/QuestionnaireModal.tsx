// src/components/ui/patients/QuestionnaireModal.tsx
import Modal from '@/components/ui/common/Modal';
import { ClipboardList } from 'lucide-react';

interface QuestionnaireData {
  age?: number;
  gender?: string;
  alcohol_use?: string;
  chronic_health_conditions?: string;
  depression_status?: string;
  diabetic?: string;
  dominant_hand?: string;
  education_level?: string;
  family_history?: string;
  genetic?: string;
  medication_history?: string;
  nutrition_diet?: string;
  physical_activity?: string;
  sleep_quality?: string;
  smoking_status?: string;
  weight?: number;
}

interface QuestionnaireModalProps {
  questionnaireData: QuestionnaireData | null;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h4 className="text-md font-bold text-foreground mt-6 mb-3 flex items-center gap-2">
    <div className="h-1 w-8 bg-primary rounded"></div>
    {title}
  </h4>
);

export default function QuestionnaireModal({
  questionnaireData,
  patientName,
  isOpen,
  onClose
}: QuestionnaireModalProps) {
  if (!questionnaireData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Lifestyle Questionnaire">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No questionnaire data available for this patient.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lifestyle Questionnaire">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{patientName}</h3>
            <p className="text-sm text-muted-foreground">Patient Lifestyle Assessment</p>
          </div>
        </div>

        {/* Questionnaire Details */}
        <div className="w-full text-left max-h-[60vh] overflow-y-auto pr-2 
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          {/* Demographics Section */}
          <SectionHeader title="Demographics" />
          <div>
            {questionnaireData.age !== undefined && (
              <DetailRow label="Age" value={`${questionnaireData.age} years`} />
            )}
            {questionnaireData.gender && (
              <DetailRow label="Gender" value={questionnaireData.gender} />
            )}
            {questionnaireData.weight !== undefined && (
              <DetailRow label="Weight" value={`${questionnaireData.weight} lbs`} />
            )}
            {questionnaireData.dominant_hand && (
              <DetailRow label="Dominant Hand" value={questionnaireData.dominant_hand} />
            )}
            {questionnaireData.education_level && (
              <DetailRow label="Education Level" value={questionnaireData.education_level} />
            )}
          </div>

          {/* Health Conditions Section */}
          <SectionHeader title="Health Conditions" />
          <div>
            {questionnaireData.chronic_health_conditions && (
              <DetailRow label="Chronic Health Conditions" value={questionnaireData.chronic_health_conditions} />
            )}
            {questionnaireData.diabetic && (
              <DetailRow label="Diabetic" value={questionnaireData.diabetic === "1" ? "Yes" : "No"} />
            )}
            {questionnaireData.depression_status && (
              <DetailRow label="Depression Status" value={questionnaireData.depression_status} />
            )}
            {questionnaireData.medication_history && (
              <DetailRow label="Medication History" value={questionnaireData.medication_history} />
            )}
          </div>

          {/* Lifestyle Habits Section */}
          <SectionHeader title="Lifestyle Habits" />
          <div>
            {questionnaireData.smoking_status && (
              <DetailRow label="Smoking Status" value={questionnaireData.smoking_status} />
            )}
            {questionnaireData.alcohol_use && (
              <DetailRow label="Alcohol Use" value={questionnaireData.alcohol_use} />
            )}
            {questionnaireData.physical_activity && (
              <DetailRow label="Physical Activity" value={questionnaireData.physical_activity} />
            )}
            {questionnaireData.sleep_quality && (
              <DetailRow label="Sleep Quality" value={questionnaireData.sleep_quality} />
            )}
            {questionnaireData.nutrition_diet && (
              <DetailRow label="Nutrition & Diet" value={questionnaireData.nutrition_diet} />
            )}
          </div>

          {/* Family & Genetic History Section */}
          <SectionHeader title="Family & Genetic History" />
          <div>
            {questionnaireData.family_history && (
              <DetailRow label="Family History" value={questionnaireData.family_history} />
            )}
            {questionnaireData.genetic && (
              <DetailRow label="Genetic Markers" value={questionnaireData.genetic} />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}