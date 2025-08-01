
// src/services/admin.service.ts
import { apiService } from './api';
import { RiskParameter, AdminSetting, CreateRiskParameterRequest, CreateAdminSettingRequest } from '../types';

export const adminService = {
  // Risk Parameters
  async getRiskParameters(): Promise<RiskParameter[]> {
    return apiService.get('/admin/risk-parameters');
  },

  async createRiskParameter(data: CreateRiskParameterRequest): Promise<RiskParameter> {
    return apiService.post('/admin/risk-parameters', data);
  },

  async updateRiskParameter(id: number, data: Partial<CreateRiskParameterRequest>): Promise<RiskParameter> {
    return apiService.patch(`/admin/risk-parameters/${id}`, data);
  },

  async deleteRiskParameter(id: number): Promise<{ message: string }> {
    return apiService.delete(`/admin/risk-parameters/${id}`);
  },

  // Admin Settings
  async getAdminSettings(): Promise<AdminSetting[]> {
    return apiService.get('/admin/settings');
  },

  async createAdminSetting(data: CreateAdminSettingRequest): Promise<AdminSetting> {
    return apiService.post('/admin/settings', data);
  },

  async updateAdminSetting(id: string, data: Partial<CreateAdminSettingRequest>): Promise<AdminSetting> {
    return apiService.patch(`/admin/settings/${id}`, data);
  },

  async deleteAdminSetting(id: string): Promise<{ message: string }> {
    return apiService.delete(`/admin/settings/${id}`);
  },
};
