export type EyeSide = 'OD' | 'OS' | 'OU'; // OD: Right Eye, OS: Left Eye, OU: Both

export type RiskLevel = 
  | 'Normal Screening' 
  | 'Review Recommended' 
  | 'Elevated Risk' 
  | 'Further Clinical Assessment Recommended';

export type QualityStatus = 'GOOD' | 'ACCEPTABLE' | 'POOR';

export interface QualityMetrics {
  overallScore: number;
  focus: number;
  brightness: number;
  contrast: number;
  retinalVisibility: number;
  fieldOfView: string; // e.g. '45° Macula-Centered'
  resolution: string; // e.g. '3840 × 2160'
  status: QualityStatus;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  email: string;
  riskFactors: {
    bmi: number;
    familyHistoryDiabetes: boolean;
    hypertension: boolean;
    smokingStatus: 'Never' | 'Former' | 'Current';
    recentHbA1c?: number;
    fastingGlucose?: number;
  };
  lastScreeningDate?: string;
  lastScreeningResult?: RiskLevel;
  status: 'Active' | 'Under Review' | 'Follow-up Scheduled';
  notes: string;
  avatarSeed: string;
}

export interface RetinalImage {
  id: string;
  patientId: string;
  patientName: string;
  eye: EyeSide;
  date: string;
  quality: QualityStatus;
  qualityScore: number;
  resolution: string;
  cameraModel: string;
  pupilDilation: 'Dilated' | 'Non-mydriatic';
  imageUrl: string;
  thumbnailUrl: string;
  sampleType: 'normal' | 'microaneurysms' | 'arteriolar_narrowing' | 'borderline';
}

export interface DetectedFeature {
  id: string;
  name: string;
  count: number;
  location: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  confidence: number;
  coordinates?: { x: number; y: number; radius?: number };
}

export interface ScreeningRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  date: string;
  eye: EyeSide;
  riskLevel: RiskLevel;
  confidenceScore: number;
  preDiabetesProbability: number;
  estimatedHbA1cRange: string;
  detectedFeatures: DetectedFeature[];
  aiObservations: string[];
  recommendedAction: string;
  imageQuality: QualityMetrics;
  reviewer: string;
  status: 'Completed' | 'Pending Review' | 'Approved' | 'Flagged';
  retinalImage: RetinalImage;
  previousScreeningComparison?: {
    previousDate: string;
    previousRisk: RiskLevel;
    vesselChangeRate: string;
    progressionSummary: string;
  };
}

export interface NotificationItem {
  id: string;
  type: 
    | 'analysis_completed' 
    | 'review_required' 
    | 'poor_quality' 
    | 'report_generated' 
    | 'new_patient' 
    | 'system_update' 
    | 'warning'
    | 'alert'
    | 'review'
    | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedScreeningId?: string;
  relatedPatientId?: string;
  patientId?: string;
}

export interface ReportItem {
  id: string;
  screeningId: string;
  patientId: string;
  patientName: string;
  screeningDate: string;
  generatedDate: string;
  doctorName: string;
  status: 'Signed & Finalized' | 'Draft' | 'Exported' | 'Finalized';
  riskLevel: RiskLevel;
}

export type AppView = 
  | 'login'
  | 'dashboard'
  | 'new-screening'
  | 'patients'
  | 'patient-profile'
  | 'retinal-images'
  | 'image-viewer'
  | 'ai-analysis'
  | 'screening-history'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'help'
  | 'help-support';
