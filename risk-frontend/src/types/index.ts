// src/types/index.ts

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'user' | 'approver' | 'admin';
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  role: 'user' | 'approver' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: {
    email: string;
    role: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Submission Types
export type RiskBand = 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';
export type SubmissionType = 'individual' | 'entity';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface SubmissionDetail {
  id: string;
  submissionId: string;
  section: string;
  data: Record<string, any>;
}

export interface Submission {
  id: string;
  submittedBy: string;
  type: SubmissionType;
  status: SubmissionStatus;
  calculatedScore: number | null;
  systemRating: RiskBand;
  finalRating: RiskBand;
  justification: string | null;
  submittedAt: string;
  details: SubmissionDetail[];
  user?: {
    email: string;
    role: string;
  };
}

export interface CreateSubmissionRequest {
  type: SubmissionType;
  details: {
    section: string;
    data: Record<string, any>;
  }[];
}

export interface RiskAssessment {
  calculatedScore: number;
  systemRating: RiskBand;
  reasons: string[];
}

export interface OverrideSubmissionRequest {
  finalRating?: RiskBand;
  justification?: string;
  status?: SubmissionStatus;
}

// Admin Types
export interface RiskParameter {
  id: number;
  category: string;
  parameter: string;
  riskLevel: RiskBand;
  scoreValue: number;
}

export interface AdminSetting {
  id: string;
  key: string;
  description: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskParameterRequest {
  category: string;
  parameter: string;
  riskLevel: RiskBand;
  scoreValue: number;
}

export interface CreateAdminSettingRequest {
  key: string;
  description: string;
  value: string;
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  error?: any;
}

export interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  highRiskSubmissions: number;
  noGoSubmissions: number;
}

// src/types/index.ts (FRONTEND) - Add these new types

// Enhanced Risk Assessment Types
export interface RiskAssessmentInput {
  // Individual Customer Fields
  solicitationChannel?: 'face_to_face' | 'non_face_to_face';
  nationality?: string;
  geographicalStatus?: 'non_resident_foreign' | 'non_resident_national' | 'resident_foreign' | 'resident_national';
  countryOfResidence?: string;
  employmentType?: string;
  isPEP?: boolean;
  pepType?: 'international_non_face' | 'international_face' | 'local_non_face' | 'local_face';
  expectedCountries?: string[];
  productUsage?: string[];
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

export interface EnhancedRiskResult {
  finalRisk: 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';
  score: number;
  reasons: string[];
  stopReasons?: string[];
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

// Master Data Types
export interface CountryRisk {
  id: number;
  country: string;
  riskLevel: RiskBand;
  createdAt: string;
  updatedAt: string;
}

export interface EmploymentRisk {
  id: number;
  occupation: string;
  riskLevel: RiskBand;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRisk {
  id: number;
  product: string;
  riskLevel: RiskBand;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessNatureRisk {
  id: number;
  business: string;
  riskLevel: RiskBand;
  createdAt: string;
  updatedAt: string;
}

export interface MasterData {
  countries: CountryRisk[];
  employmentTypes: EmploymentRisk[];
  products: ProductRisk[];
  businessTypes: BusinessNatureRisk[];
}