// src/services/masterData.service.ts (FRONTEND)
import { apiService } from './api';
import { MasterData, CountryRisk, EmploymentRisk, ProductRisk, BusinessNatureRisk } from '../types';

export const masterDataService = {
  async getAllMasterData(): Promise<MasterData> {
    return apiService.get('/master-data');
  },

  async getCountries(): Promise<CountryRisk[]> {
    return apiService.get('/master-data/countries');
  },

  async getEmploymentTypes(): Promise<EmploymentRisk[]> {
    return apiService.get('/master-data/employment');
  },

  async getProducts(): Promise<ProductRisk[]> {
    return apiService.get('/master-data/products');
  },

  async getBusinessTypes(): Promise<BusinessNatureRisk[]> {
    return apiService.get('/master-data/business');
  },

  async testRiskAssessment(riskInput: any): Promise<any> {
    return apiService.post('/submissions/test-risk', riskInput);
  },
    async createCountryRisk(data: { country: string; riskLevel: string }): Promise<CountryRisk> {
    return apiService.post('/admin/master-data/countries', data);
  },

  async updateCountryRisk(id: number, data: { country: string; riskLevel: string }): Promise<CountryRisk> {
    return apiService.patch(`/admin/master-data/countries/${id}`, data);
  },

  async deleteCountryRisk(id: number): Promise<{ message: string }> {
    return apiService.delete(`/admin/master-data/countries/${id}`);
  },

  async createEmploymentRisk(data: { occupation: string; riskLevel: string }): Promise<EmploymentRisk> {
    return apiService.post('/admin/master-data/employment', data);
  },

  async updateEmploymentRisk(id: number, data: { occupation: string; riskLevel: string }): Promise<EmploymentRisk> {
    return apiService.patch(`/admin/master-data/employment/${id}`, data);
  },

  async deleteEmploymentRisk(id: number): Promise<{ message: string }> {
    return apiService.delete(`/admin/master-data/employment/${id}`);
  },

  async createProductRisk(data: { product: string; riskLevel: string }): Promise<ProductRisk> {
    return apiService.post('/admin/master-data/products', data);
  },

  async updateProductRisk(id: number, data: { product: string; riskLevel: string }): Promise<ProductRisk> {
    return apiService.patch(`/admin/master-data/products/${id}`, data);
  },

  async deleteProductRisk(id: number): Promise<{ message: string }> {
    return apiService.delete(`/admin/master-data/products/${id}`);
  },

  async createBusinessRisk(data: { business: string; riskLevel: string }): Promise<BusinessNatureRisk> {
    return apiService.post('/admin/master-data/business', data);
  },

  async updateBusinessRisk(id: number, data: { business: string; riskLevel: string }): Promise<BusinessNatureRisk> {
    return apiService.patch(`/admin/master-data/business/${id}`, data);
  },

  async deleteBusinessRisk(id: number): Promise<{ message: string }> {
    return apiService.delete(`/admin/master-data/business/${id}`);
  },

   async bulkImportCountries(file: File): Promise<{ message: string; imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/admin/master-data/countries/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async exportMasterData(type: 'countries' | 'employment' | 'products' | 'business'): Promise<Blob> {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/master-data/${type}/export`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    return response.blob();
  },
};


