// src/types/riskAssessment.types.ts

export interface RiskAssessmentInput {
  // Individual Customer Fields
  solicitationChannel?: 'face_to_face' | 'non_face_to_face';
  nationality?: string;
  geographicalStatus?: 'non_resident_foreign' | 'non_resident_national' | 'resident_foreign' | 'resident_national';
  countryOfResidence?: string;
  employmentType?: string;
  isPEP?: boolean;
  pepType?: 'international_non_face' | 'international_face' | 'local_non_face' | 'local_face';
  expectedCountries?: string[]; // Multiple selection
  productUsage?: string[]; // Multiple selection
  adverseMedia?: boolean;
  
  // Entity Customer Fields
  natureOfBusiness?: string;
  countryOfRegistration?: string;
  entityGeographicalStatus?: string;
  entityPEP?: boolean;
  expectedCountriesOfTrade?: string[];
  sanctionCheck?: boolean;
  
  // Common Fields
  submissionType: 'individual' | 'entity';
}

export interface RiskAssessmentResult {
  finalRisk: 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';
  score: number;
  reasons: string[];
  stopReasons?: string[]; // For NoGo/Auto rejection
  parameterScores: ParameterScore[];
  calculationMethod: 'weighted_average' | 'immediate_stop' | 'auto_high';
}

export interface ParameterScore {
  parameter: string;
  value: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';
  score: number;
  weight: number;
}

export interface ScoringThresholds {
  lowThreshold: number;
  mediumThreshold: number;
  highThreshold: number;
}