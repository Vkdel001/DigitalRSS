// src/services/submissions.service.ts
import { apiService } from './api';
import { Submission, CreateSubmissionRequest, RiskAssessment, OverrideSubmissionRequest } from '../types';

export const submissionsService = {
  async createSubmission(data: CreateSubmissionRequest): Promise<{
    submission: Submission;
    riskAssessment: RiskAssessment;
  }> {
    return apiService.post('/submissions', data);
  },

  async getUserSubmissions(): Promise<Submission[]> {
    return apiService.get('/submissions');
  },

  async getAllSubmissions(): Promise<{ submissions: Submission[] }> {
    return apiService.get('/submissions/all');
  },

  async getSubmissionById(id: string): Promise<Submission> {
    return apiService.get(`/submissions/${id}`);
  },

  async overrideSubmission(id: string, data: OverrideSubmissionRequest): Promise<Submission> {
    return apiService.patch(`/submissions/${id}`, data);
  },

  async reassessRisk(id: string): Promise<{
    message: string;
    submission: Submission;
    riskAssessment: RiskAssessment;
  }> {
    return apiService.post(`/submissions/${id}/reassess`);
  },

   async testRiskAssessment(riskInput: any): Promise<any> {
    return apiService.post('/submissions/test-risk', riskInput);
  },
};