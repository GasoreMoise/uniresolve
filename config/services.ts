import { GraduationCap, Landmark, Settings, HelpCircle } from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
}

export interface ServiceCategory {
  title: string;
  icon: any;
  items: ServiceItem[];
}

export const servicesData: ServiceCategory[] = [
  {
    title: 'Academic Progression & Verification',
    icon: GraduationCap,
    items: [
      { id: 'SPECIAL_QUIZ', name: 'Special Quiz' },
      { id: 'SPECIAL_CAT', name: 'Special CAT' },
      { id: 'SPECIAL_EXAM', name: 'Special Exam' },
      { id: 'CAT_CLAIMS', name: 'CAT Claims' },
      { id: 'EXAM_CLAIMS', name: 'Exam Claims' },
      { id: 'DIPLOMA_EQUIVALENCE', name: 'Diploma Equivalence' },
      { id: 'TRANSCRIPT_REQUEST', name: 'Transcript Request' },
    ],
  },
  {
    title: 'Administrative & Operational Requests',
    icon: Settings,
    items: [
      { id: 'STUDENT_REGISTRATION', name: 'Student Registration' },
      { id: 'CARD_REPLACEMENT', name: 'Card Replacement' },
      { id: 'PERMISSION_REQUEST', name: 'Permission Request' },
      { id: 'GATE_MANAGEMENT', name: 'Gate Management' },
      { id: 'CLASS_ALLOCATION', name: 'Class Allocation' },
      { id: 'LETTER_OF_RECOMMENDATION', name: 'Letter of Recommendation' },
      { id: 'STUDENT_ACCOUNT', name: 'Student Account' },
    ],
  },
  {
    title: 'Financial Gateways',
    icon: Landmark,
    items: [
      { id: 'REGISTRATION_PAYMENT', name: 'Registration Payment' },
      { id: 'RETAKE_PAYMENT', name: 'Retake Payment' },
      { id: 'FINANCIAL_CLEARANCES', name: 'Financial Clearances' },
    ],
  },
  {
    title: 'Direct Support & External Compliance',
    icon: HelpCircle,
    items: [
      { id: 'EXAM_CARD_APPLICATION', name: 'Exam Card Application' },
    ],
  },
];