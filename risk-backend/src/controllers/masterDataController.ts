// src/controllers/masterDataController.ts
import { Request, Response } from 'express';
import { masterDataService } from '../services/masterDataApi.service';

export const masterDataController = {
  // Get all countries
  async getCountries(req: Request, res: Response) {
    try {
      const countries = await masterDataService.getCountries();
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ message: 'Error fetching countries', error });
    }
  },

  // Get countries by risk level
  async getCountriesByRisk(req: Request, res: Response) {
    try {
      const { riskLevel } = req.params;
      const countries = await masterDataService.getCountriesByRisk(riskLevel);
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries by risk:', error);
      res.status(500).json({ message: 'Error fetching countries by risk', error });
    }
  },

  // Get all employment types
  async getEmploymentTypes(req: Request, res: Response) {
    try {
      const employmentTypes = await masterDataService.getEmploymentTypes();
      res.json(employmentTypes);
    } catch (error) {
      console.error('Error fetching employment types:', error);
      res.status(500).json({ message: 'Error fetching employment types', error });
    }
  },

  // Get all products
  async getProducts(req: Request, res: Response) {
    try {
      const products = await masterDataService.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products', error });
    }
  },

  // Get all business types
  async getBusinessTypes(req: Request, res: Response) {
    try {
      const businessTypes = await masterDataService.getBusinessTypes();
      res.json(businessTypes);
    } catch (error) {
      console.error('Error fetching business types:', error);
      res.status(500).json({ message: 'Error fetching business types', error });
    }
  },

  // Get all master data at once
  async getAllMasterData(req: Request, res: Response) {
    try {
      const masterData = await masterDataService.getAllMasterData();
      res.json(masterData);
    } catch (error) {
      console.error('Error fetching master data:', error);
      res.status(500).json({ message: 'Error fetching master data', error });
    }
  },

  // Get risk level for specific values
  async getRiskLevel(req: Request, res: Response) {
    try {
      const { type, value } = req.params;
      let result;

      switch (type) {
        case 'country':
          result = await masterDataService.getCountryRisk(value);
          break;
        case 'employment':
          result = await masterDataService.getEmploymentRisk(value);
          break;
        case 'product':
          result = await masterDataService.getProductRisk(value);
          break;
        case 'business':
          result = await masterDataService.getBusinessRisk(value);
          break;
        default:
          return res.status(400).json({ message: 'Invalid type parameter' });
      }

      if (!result) {
        return res.status(404).json({ message: `${type} not found` });
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching risk level:', error);
      res.status(500).json({ message: 'Error fetching risk level', error });
    }
  }
};