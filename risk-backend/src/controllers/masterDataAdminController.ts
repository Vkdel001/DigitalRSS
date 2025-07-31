// src/controllers/masterDataAdminController.ts (BACKEND)
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const masterDataAdminController = {
  // Countries Management
  async createCountryRisk(req: Request, res: Response) {
    try {
      const { country, riskLevel } = req.body;
      
      const countryRisk = await prisma.countryRisk.create({
        data: { country, riskLevel }
      });
      
      res.status(201).json(countryRisk);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Country already exists' });
      }
      res.status(500).json({ message: 'Error creating country risk', error });
    }
  },

  async updateCountryRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { country, riskLevel } = req.body;
      
      const countryRisk = await prisma.countryRisk.update({
        where: { id },
        data: { country, riskLevel }
      });
      
      res.json(countryRisk);
    } catch (error) {
      res.status(500).json({ message: 'Error updating country risk', error });
    }
  },

  async deleteCountryRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      await prisma.countryRisk.delete({
        where: { id }
      });
      
      res.json({ message: 'Country risk deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting country risk', error });
    }
  },

  // Employment Management
  async createEmploymentRisk(req: Request, res: Response) {
    try {
      const { occupation, riskLevel } = req.body;
      
      const employmentRisk = await prisma.employmentRisk.create({
        data: { occupation, riskLevel }
      });
      
      res.status(201).json(employmentRisk);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Occupation already exists' });
      }
      res.status(500).json({ message: 'Error creating employment risk', error });
    }
  },

  async updateEmploymentRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { occupation, riskLevel } = req.body;
      
      const employmentRisk = await prisma.employmentRisk.update({
        where: { id },
        data: { occupation, riskLevel }
      });
      
      res.json(employmentRisk);
    } catch (error) {
      res.status(500).json({ message: 'Error updating employment risk', error });
    }
  },

  async deleteEmploymentRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      await prisma.employmentRisk.delete({
        where: { id }
      });
      
      res.json({ message: 'Employment risk deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting employment risk', error });
    }
  },

  // Products Management
  async createProductRisk(req: Request, res: Response) {
    try {
      const { product, riskLevel } = req.body;
      
      const productRisk = await prisma.productRisk.create({
        data: { product, riskLevel }
      });
      
      res.status(201).json(productRisk);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Product already exists' });
      }
      res.status(500).json({ message: 'Error creating product risk', error });
    }
  },

  async updateProductRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { product, riskLevel } = req.body;
      
      const productRisk = await prisma.productRisk.update({
        where: { id },
        data: { product, riskLevel }
      });
      
      res.json(productRisk);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product risk', error });
    }
  },

  async deleteProductRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      await prisma.productRisk.delete({
        where: { id }
      });
      
      res.json({ message: 'Product risk deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product risk', error });
    }
  },

  // Business Management
  async createBusinessRisk(req: Request, res: Response) {
    try {
      const { business, riskLevel } = req.body;
      
      const businessRisk = await prisma.businessNatureRisk.create({
        data: { business, riskLevel }
      });
      
      res.status(201).json(businessRisk);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Business type already exists' });
      }
      res.status(500).json({ message: 'Error creating business risk', error });
    }
  },

  async updateBusinessRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { business, riskLevel } = req.body;
      
      const businessRisk = await prisma.businessNatureRisk.update({
        where: { id },
        data: { business, riskLevel }
      });
      
      res.json(businessRisk);
    } catch (error) {
      res.status(500).json({ message: 'Error updating business risk', error });
    }
  },

  async deleteBusinessRisk(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      await prisma.businessNatureRisk.delete({
        where: { id }
      });
      
      res.json({ message: 'Business risk deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting business risk', error });
    }
  },

  // Export functionality
  async exportCountries(req: Request, res: Response) {
    try {
      const countries = await prisma.countryRisk.findMany({
        orderBy: { country: 'asc' }
      });
      
      // Convert to CSV
      const csvHeader = 'Country,Risk Level\n';
      const csvData = countries.map(c => `"${c.country}","${c.riskLevel}"`).join('\n');
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=countries-risk.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: 'Error exporting countries', error });
    }
  },

  async exportEmployment(req: Request, res: Response) {
    try {
      const employment = await prisma.employmentRisk.findMany({
        orderBy: { occupation: 'asc' }
      });
      
      const csvHeader = 'Occupation,Risk Level\n';
      const csvData = employment.map(e => `"${e.occupation}","${e.riskLevel}"`).join('\n');
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employment-risk.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: 'Error exporting employment data', error });
    }
  },

  async exportProducts(req: Request, res: Response) {
    try {
      const products = await prisma.productRisk.findMany({
        orderBy: { product: 'asc' }
      });
      
      const csvHeader = 'Product,Risk Level\n';
      const csvData = products.map(p => `"${p.product}","${p.riskLevel}"`).join('\n');
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products-risk.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: 'Error exporting products', error });
    }
  },

  async exportBusiness(req: Request, res: Response) {
    try {
      const business = await prisma.businessNatureRisk.findMany({
        orderBy: { business: 'asc' }
      });
      
      const csvHeader = 'Business Type,Risk Level\n';
      const csvData = business.map(b => `"${b.business}","${b.riskLevel}"`).join('\n');
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=business-risk.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: 'Error exporting business data', error });
    }
  },
};