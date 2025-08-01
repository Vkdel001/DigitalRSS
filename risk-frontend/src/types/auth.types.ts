// src/types/auth.types.ts
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

// src/types/submission.types.ts
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

// src/types/admin.types.ts
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

export interface DashboardStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  highRiskSubmissions: number;
  noGoSubmissions: number;
}

// src/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  error?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FilterParams {
  status?: SubmissionStatus;
  riskLevel?: RiskBand;
  search?: string;
  startDate?: string;
  endDate?: string;
}

 