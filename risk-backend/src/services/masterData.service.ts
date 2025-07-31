// src/services/masterData.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Country Risk Data (150 countries from your list)
const countryRiskData = [
  // No Go Countries
  { country: 'Afghanistan', riskLevel: 'NoGo' },
  { country: 'Myanmar', riskLevel: 'NoGo' },
  { country: 'Nigeria', riskLevel: 'NoGo' },
  { country: 'North Korea', riskLevel: 'NoGo' },
  { country: 'Pakistan', riskLevel: 'NoGo' },
  { country: 'Russia', riskLevel: 'NoGo' },
  { country: 'Cuba', riskLevel: 'NoGo' },
  { country: 'DR Congo', riskLevel: 'NoGo' },
  { country: 'Somalia', riskLevel: 'NoGo' },
  { country: 'South Sudan', riskLevel: 'NoGo' },
  { country: 'Sudan', riskLevel: 'NoGo' },
  { country: 'Syria', riskLevel: 'NoGo' },
  
  // Low Risk Countries
  { country: 'Australia', riskLevel: 'Low' },
  { country: 'Austria', riskLevel: 'Low' },
  { country: 'Belgium', riskLevel: 'Low' },
  { country: 'Canada', riskLevel: 'Low' },
  { country: 'Denmark', riskLevel: 'Low' },
  { country: 'Finland', riskLevel: 'Low' },
  { country: 'France', riskLevel: 'Low' },
  { country: 'Germany', riskLevel: 'Low' },
  { country: 'Netherlands', riskLevel: 'Low' },
  { country: 'New Zealand', riskLevel: 'Low' },
  { country: 'Norway', riskLevel: 'Low' },
  { country: 'Singapore', riskLevel: 'Low' },
  { country: 'Sweden', riskLevel: 'Low' },
  { country: 'Switzerland', riskLevel: 'Low' },
  { country: 'United Kingdom', riskLevel: 'Low' },
  { country: 'United States', riskLevel: 'Low' },
  
  // Medium Risk Countries
  { country: 'Mauritius', riskLevel: 'Medium' },
  { country: 'Argentina', riskLevel: 'Medium' },
  { country: 'Brazil', riskLevel: 'Medium' },
  { country: 'India', riskLevel: 'Medium' },
  { country: 'South Africa', riskLevel: 'Medium' },
  { country: 'Thailand', riskLevel: 'Medium' },
  
  // High Risk Countries
  { country: 'Albania', riskLevel: 'High' },
  { country: 'Bangladesh', riskLevel: 'High' },
  { country: 'China', riskLevel: 'High' },
  { country: 'Egypt', riskLevel: 'High' },
  { country: 'Iran', riskLevel: 'High' },
  { country: 'Iraq', riskLevel: 'High' },
  { country: 'Turkey', riskLevel: 'High' },
  { country: 'Venezuela', riskLevel: 'High' },
] as const;

// Employment Risk Data
const employmentRiskData = [
  // Low Risk
  { occupation: 'HomeMaker (Work from home)', riskLevel: 'Low' },
  { occupation: 'Minor', riskLevel: 'Low' },
  { occupation: 'Pension (Disable Person)', riskLevel: 'Low' },
  { occupation: 'Retired', riskLevel: 'Low' },
  { occupation: 'Salaried', riskLevel: 'Low' },
  { occupation: 'Student', riskLevel: 'Low' },
  
  // Medium Risk
  { occupation: 'Freelancer', riskLevel: 'Medium' },
  { occupation: 'Fund Managers', riskLevel: 'Medium' },
  { occupation: 'Others', riskLevel: 'Medium' },
  { occupation: 'Real Estate Agents', riskLevel: 'Medium' },
  { occupation: 'Self Employed – Freight', riskLevel: 'Medium' },
  { occupation: 'Self Employed – Health Care', riskLevel: 'Medium' },
  { occupation: 'Self Employed – Trader', riskLevel: 'Medium' },
  { occupation: 'Self Employed – Contractor', riskLevel: 'Medium' },
  
  // High Risk
  { occupation: 'Accountant', riskLevel: 'High' },
  { occupation: 'Consultant/Advisor', riskLevel: 'High' },
  { occupation: 'Lawyer', riskLevel: 'High' },
  { occupation: 'Self Employed – Jeweller', riskLevel: 'High' },
  { occupation: 'Stockbrokers', riskLevel: 'High' },
  { occupation: 'Unemployed', riskLevel: 'High' },
  
  // Auto High Risk
  { occupation: 'Self Employed – Car Dealer', riskLevel: 'AutoHigh' },
  { occupation: 'Self Employed – Home Owner/BookMaker', riskLevel: 'AutoHigh' },
] as const;

// Product Risk Data
const productRiskData = [
  // Low Risk Products
  { product: 'Emma Account', riskLevel: 'Low' },
  { product: 'First Step Account', riskLevel: 'Low' },
  { product: 'Mortgage Loans', riskLevel: 'Low' },
  { product: 'Mutual Funds', riskLevel: 'Low' },
  { product: 'Savings Account', riskLevel: 'Low' },
  { product: 'Secured Loans (Loan backed by asset)', riskLevel: 'Low' },
  { product: 'Term Deposits', riskLevel: 'Low' },
  
  // Medium Risk Products
  { product: 'Business Loan', riskLevel: 'Medium' },
  { product: 'Current Account', riskLevel: 'Medium' },
  { product: 'Debit Card', riskLevel: 'Medium' },
  { product: 'FCY account', riskLevel: 'Medium' },
  { product: 'Insurance Plan', riskLevel: 'Medium' },
  { product: 'Overdraft and Short term Loan', riskLevel: 'Medium' },
  { product: 'Treasury relationships', riskLevel: 'Medium' },
  
  // High Risk Products
  { product: 'Credit Card', riskLevel: 'High' },
  { product: 'Custodian Services', riskLevel: 'High' },
  { product: 'Investment', riskLevel: 'High' },
  { product: 'Pre-Paid Card', riskLevel: 'High' },
  { product: 'Safe Deposit Locker', riskLevel: 'High' },
  { product: 'Trade Finance Relationships', riskLevel: 'High' },
  { product: 'Unsecured Loans', riskLevel: 'High' },
  { product: 'Wealth Management products', riskLevel: 'High' },
] as const;

// Business Nature Risk Data
const businessNatureRiskData = [
  // Low Risk Businesses
  { business: 'Agriculture/Fishing', riskLevel: 'Low' },
  { business: 'Cleaning Services', riskLevel: 'Low' },
  { business: 'Construction', riskLevel: 'Low' },
  { business: 'Education', riskLevel: 'Low' },
  { business: 'Food/Drink Production', riskLevel: 'Low' },
  { business: 'Manufacturing', riskLevel: 'Low' },
  { business: 'Marine Equipment', riskLevel: 'Low' },
  { business: 'Marketing activities', riskLevel: 'Low' },
  { business: 'Supermarket/Hypermarket', riskLevel: 'Low' },
  { business: 'Transport', riskLevel: 'Low' },
  
  // Medium Risk Businesses
  { business: 'Asset Managers/Financial Advisors', riskLevel: 'Medium' },
  { business: 'Associations/Societies/Co-operative', riskLevel: 'Medium' },
  { business: 'Freight', riskLevel: 'Medium' },
  { business: 'Fund Managers', riskLevel: 'Medium' },
  { business: 'Green Energy/Alternative energy', riskLevel: 'Medium' },
  { business: 'Health Care', riskLevel: 'Medium' },
  { business: 'Insurance companies/agent', riskLevel: 'Medium' },
  { business: 'Other', riskLevel: 'Medium' },
  { business: 'Parastatal/Municipality/District/Village council', riskLevel: 'Medium' },
  { business: 'Partnership/Society/Association', riskLevel: 'Medium' },
  { business: 'Real Estate', riskLevel: 'Medium' },
  { business: 'Sport club/health club', riskLevel: 'Medium' },
  { business: 'Tourism/hotels/Restaurants', riskLevel: 'Medium' },
  { business: 'Trader – Foodstuff', riskLevel: 'Medium' },
  { business: 'Trader – Non Foodstuffs', riskLevel: 'Medium' },
  { business: 'Trader- Motor/Spare Parts', riskLevel: 'Medium' },
  { business: 'Trader- Wholesaler /Retailer', riskLevel: 'Medium' },
  
  // High Risk Businesses
  { business: 'Accountant', riskLevel: 'High' },
  { business: 'Administration Services', riskLevel: 'High' },
  { business: 'Aerospace', riskLevel: 'High' },
  { business: 'Aerospace/Aviation Leasing', riskLevel: 'High' },
  { business: 'Authorised Company', riskLevel: 'High' },
  { business: 'Banking', riskLevel: 'High' },
  { business: 'Bars/Clubs', riskLevel: 'High' },
  { business: 'Consultancy Services', riskLevel: 'High' },
  { business: 'Global Business', riskLevel: 'High' },
  { business: 'Information Communications and Technology', riskLevel: 'High' },
  { business: 'Jewellers', riskLevel: 'High' },
  { business: 'Law Firms', riskLevel: 'High' },
  { business: 'Logistics', riskLevel: 'High' },
  { business: 'Mining', riskLevel: 'High' },
  { business: 'Non banking Financial Institutions', riskLevel: 'High' },
  { business: 'Stockbrokers', riskLevel: 'High' },
  
  // Auto High Risk Businesses
  { business: 'Charities', riskLevel: 'AutoHigh' },
  { business: 'E-commerce', riskLevel: 'AutoHigh' },
  { business: 'Embassies', riskLevel: 'AutoHigh' },
  { business: 'Gambling', riskLevel: 'AutoHigh' },
  { business: 'Military', riskLevel: 'AutoHigh' },
  { business: 'Money Service Business', riskLevel: 'AutoHigh' },
  { business: 'Petroleum products', riskLevel: 'AutoHigh' },
  { business: 'Trader- car dealers', riskLevel: 'AutoHigh' },
  { business: 'Trust/Foundation/Funds', riskLevel: 'AutoHigh' },
] as const;

// Seeding functions
export const seedCountryRisk = async () => {
  console.log('🌍 Seeding country risk data...');
  
  for (const data of countryRiskData) {
    await prisma.countryRisk.upsert({
      where: { country: data.country },
      update: { riskLevel: data.riskLevel as any },
      create: { 
        country: data.country, 
        riskLevel: data.riskLevel as any 
      },
    });
  }
  
  console.log(`✅ Seeded ${countryRiskData.length} countries`);
};

export const seedEmploymentRisk = async () => {
  console.log('💼 Seeding employment risk data...');
  
  for (const data of employmentRiskData) {
    await prisma.employmentRisk.upsert({
      where: { occupation: data.occupation },
      update: { riskLevel: data.riskLevel as any },
      create: { 
        occupation: data.occupation, 
        riskLevel: data.riskLevel as any 
      },
    });
  }
  
  console.log(`✅ Seeded ${employmentRiskData.length} occupations`);
};

export const seedProductRisk = async () => {
  console.log('💳 Seeding product risk data...');
  
  for (const data of productRiskData) {
    await prisma.productRisk.upsert({
      where: { product: data.product },
      update: { riskLevel: data.riskLevel as any },
      create: { 
        product: data.product, 
        riskLevel: data.riskLevel as any 
      },
    });
  }
  
  console.log(`✅ Seeded ${productRiskData.length} products`);
};

export const seedBusinessNatureRisk = async () => {
  console.log('🏢 Seeding business nature risk data...');
  
  for (const data of businessNatureRiskData) {
    await prisma.businessNatureRisk.upsert({
      where: { business: data.business },
      update: { riskLevel: data.riskLevel as any },
      create: { 
        business: data.business, 
        riskLevel: data.riskLevel as any 
      },
    });
  }
  
  console.log(`✅ Seeded ${businessNatureRiskData.length} business types`);
};

export const seedAllMasterData = async () => {
  try {
    console.log('🌱 Starting master data seeding...');
    
    await seedCountryRisk();
    await seedEmploymentRisk();
    await seedProductRisk();
    await seedBusinessNatureRisk();
    
    console.log('🎉 All master data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding master data:', error);
  } finally {
    await prisma.$disconnect();
  }
};