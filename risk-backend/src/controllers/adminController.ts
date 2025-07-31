// src/controllers/adminController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========== RISK PARAMETERS ==========
export const getRiskParameters = async (req: Request, res: Response) => {
  try {
    const params = await prisma.riskParameter.findMany();
    res.json(params);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching risk parameters', error });
  }
};

export const addRiskParameter = async (req: Request, res: Response) => {
  try {
    // ✅ Fixed: Using correct field names from schema
    const { category, parameter, riskLevel, scoreValue } = req.body;
    
    const param = await prisma.riskParameter.create({
      data: { 
        category, 
        parameter, 
        riskLevel, 
        scoreValue 
      },
    });
    
    res.status(201).json(param);
  } catch (error) {
    res.status(500).json({ message: 'Error adding risk parameter', error });
  }
};

export const updateRiskParameter = async (req: Request, res: Response) => {
  try {
    // ✅ Fixed: Converting string ID to number
    const id = parseInt(req.params.id);
    const { category, parameter, riskLevel, scoreValue } = req.body;
    
    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    const param = await prisma.riskParameter.update({
      where: { id },
      data: { category, parameter, riskLevel, scoreValue },
    });
    
    res.json(param);
  } catch (error) {
    res.status(500).json({ message: 'Error updating risk parameter', error });
  }
};

export const deleteRiskParameter = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    await prisma.riskParameter.delete({
      where: { id },
    });
    
    res.json({ message: 'Risk parameter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting risk parameter', error });
  }
};

// ========== ADMIN SETTINGS ==========
export const getAdminSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.adminSetting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin settings', error });
  }
};

export const addAdminSetting = async (req: Request, res: Response) => {
  try {
    // ✅ These fields match the AdminSetting schema
    const { key, description, value } = req.body;
    
    const setting = await prisma.adminSetting.create({
      data: { key, description, value },
    });
    
    res.status(201).json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error adding admin setting', error });
  }
};

export const updateAdminSetting = async (req: Request, res: Response) => {
  try {
    // ✅ AdminSetting uses String ID (UUID), so no conversion needed
    const { id } = req.params;
    const { key, description, value } = req.body;
    
    const setting = await prisma.adminSetting.update({
      where: { id },
      data: { key, description, value },
    });
    
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin setting', error });
  }
};

export const deleteAdminSetting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.adminSetting.delete({
      where: { id },
    });
    
    res.json({ message: 'Admin setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin setting', error });
  }
};

// ========== SCORING CONFIG ==========
export const getScoringConfig = async (req: Request, res: Response) => {
  try {
    const config = await prisma.scoringConfig.findMany();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scoring config', error });
  }
};

export const updateScoringConfig = async (req: Request, res: Response) => {
  try {
    // ScoringConfig uses 'name' as primary key (String)
    const { name } = req.params;
    const { value, description } = req.body;
    
    const config = await prisma.scoringConfig.upsert({
      where: { name },
      update: { value, description },
      create: { name, value, description },
    });
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error updating scoring config', error });
  }
};