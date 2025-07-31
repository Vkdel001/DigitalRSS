// src/services/masterDataApi.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const masterDataService = {
  // Get all countries with risk levels
  async getCountries() {
    return await prisma.countryRisk.findMany({
      orderBy: { country: 'asc' }
    });
  },

  // Get countries by risk level
  async getCountriesByRisk(riskLevel: string) {
    return await prisma.countryRisk.findMany({
      where: { riskLevel: riskLevel as any },
      orderBy: { country: 'asc' }
    });
  },

  // Get all employment types
  async getEmploymentTypes() {
    return await prisma.employmentRisk.findMany({
      orderBy: { occupation: 'asc' }
    });
  },

  // Get all products
  async getProducts() {
    return await prisma.productRisk.findMany({
      orderBy: { product: 'asc' }
    });
  },

  // Get all business types
  async getBusinessTypes() {
    return await prisma.businessNatureRisk.findMany({
      orderBy: { business: 'asc' }
    });
  },

  // Get risk level for specific country
  async getCountryRisk(country: string) {
    return await prisma.countryRisk.findUnique({
      where: { country }
    });
  },

  // Get risk level for specific occupation
  async getEmploymentRisk(occupation: string) {
    return await prisma.employmentRisk.findUnique({
      where: { occupation }
    });
  },

  // Get risk level for specific product
  async getProductRisk(product: string) {
    return await prisma.productRisk.findUnique({
      where: { product }
    });
  },

  // Get risk level for specific business
  async getBusinessRisk(business: string) {
    return await prisma.businessNatureRisk.findUnique({
      where: { business }
    });
  },

  // Get all master data in one call (for frontend dropdowns)
  async getAllMasterData() {
    const [countries, employmentTypes, products, businessTypes] = await Promise.all([
      this.getCountries(),
      this.getEmploymentTypes(),
      this.getProducts(),
      this.getBusinessTypes()
    ]);

    return {
      countries,
      employmentTypes,
      products,
      businessTypes
    };
  }
};