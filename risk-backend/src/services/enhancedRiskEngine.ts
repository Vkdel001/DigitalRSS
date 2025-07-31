// src/services/enhancedRiskEngine.ts
import { PrismaClient } from '@prisma/client';
import { RiskAssessmentInput, RiskAssessmentResult, ParameterScore } from '../types/riskAssessment.types';
import { masterDataService } from './masterDataApi.service';

const prisma = new PrismaClient();

export class EnhancedRiskEngine {
  private scoringWeights = {
    Low: 1,
    Medium: 2,
    High: 3,
    AutoHigh: 3,
    NoGo: 3
  };

  private scoringThresholds = {
    lowThreshold: 1.5,    // Score < 1.5 = Low Risk
    mediumThreshold: 2.1, // Score >= 1.5 and < 2.1 = Medium Risk
    // Score >= 2.1 = High Risk
  };

  async assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
    console.log('🔍 Starting enhanced risk assessment...', input);

    // STEP 1: Check for immediate stop conditions
    const stopCheck = await this.checkStopConditions(input);
    if (stopCheck.shouldStop) {
      return {
        finalRisk: stopCheck.riskLevel!,
        score: 100,
        reasons: stopCheck.reasons,
        stopReasons: stopCheck.reasons,
        parameterScores: [],
        calculationMethod: 'immediate_stop'
      };
    }

    // STEP 2: Check for Auto High Risk conditions
    const autoHighCheck = await this.checkAutoHighConditions(input);
    if (autoHighCheck.shouldStop) {
      return {
        finalRisk: 'AutoHigh',
        score: 100,
        reasons: autoHighCheck.reasons,
        parameterScores: [],
        calculationMethod: 'auto_high'
      };
    }

    // STEP 3: Calculate weighted score for all parameters
    const scoringResult = await this.calculateWeightedScore(input);

    // STEP 4: Determine final risk level based on score
    const finalRisk = this.determineFinalRisk(scoringResult.totalScore);

    return {
      finalRisk,
      score: Number(scoringResult.totalScore.toFixed(2)),
      reasons: scoringResult.reasons,
      parameterScores: scoringResult.parameterScores,
      calculationMethod: 'weighted_average'
    };
  }

  // Replace the checkStopConditions method

private async checkStopConditions(input: RiskAssessmentInput): Promise<{
  shouldStop: boolean;
  riskLevel?: 'NoGo';
  reasons: string[];
}> {
  const reasons: string[] = [];

  // Build list of countries to check based on submission type
  const countriesToCheck: string[] = [];
  
  if (input.submissionType === 'individual') {
    if (input.nationality) countriesToCheck.push(input.nationality);
    if (input.countryOfResidence) countriesToCheck.push(input.countryOfResidence);
  } else if (input.submissionType === 'entity') {
    if (input.countryOfRegistration) countriesToCheck.push(input.countryOfRegistration);
    if (input.expectedCountriesOfTrade) countriesToCheck.push(...input.expectedCountriesOfTrade);
  }
  
  // Common fields for both types
  if (input.expectedCountries) countriesToCheck.push(...input.expectedCountries);

  // Check all countries for NoGo status
  for (const country of countriesToCheck) {
    const countryRisk = await masterDataService.getCountryRisk(country);
    if (countryRisk?.riskLevel === 'NoGo') {
      reasons.push(`NoGo country detected: ${country}`);
    }
  }

  return {
    shouldStop: reasons.length > 0,
    riskLevel: reasons.length > 0 ? 'NoGo' : undefined,
    reasons
  };
}
  private async checkAutoHighConditions(input: RiskAssessmentInput): Promise<{
    shouldStop: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Check 1: PEP Status (All PEP types result in Auto High Risk)
    if (input.isPEP || input.entityPEP) {
      reasons.push('Customer is a Politically Exposed Person (PEP)');
    }

    // Check 2: Employment Type - Auto High Risk
    if (input.employmentType) {
      const employmentRisk = await masterDataService.getEmploymentRisk(input.employmentType);
      if (employmentRisk?.riskLevel === 'AutoHigh') {
        reasons.push(`Auto High Risk employment: ${input.employmentType}`);
      }
    }

    // Check 3: Business Nature - Auto High Risk
    if (input.natureOfBusiness) {
      const businessRisk = await masterDataService.getBusinessRisk(input.natureOfBusiness);
      if (businessRisk?.riskLevel === 'AutoHigh') {
        reasons.push(`Auto High Risk business: ${input.natureOfBusiness}`);
      }
    }

    // Check 4: Product Usage - Auto High Risk
    if (input.productUsage) {
      for (const product of input.productUsage) {
        const productRisk = await masterDataService.getProductRisk(product);
        if (productRisk?.riskLevel === 'AutoHigh') {
          reasons.push(`Auto High Risk product: ${product}`);
        }
      }
    }

    return {
      shouldStop: reasons.length > 0,
      reasons
    };
  }

  // Replace the calculateWeightedScore method in your enhancedRiskEngine.ts

private async calculateWeightedScore(input: RiskAssessmentInput): Promise<{
  totalScore: number;
  reasons: string[];
  parameterScores: ParameterScore[];
}> {
  const parameterScores: ParameterScore[] = [];
  const reasons: string[] = [];
  let totalScore = 0;
  let totalQuestions = 0;

  // Helper function to add parameter score
  const addParameterScore = (
    parameter: string,
    value: string,
    riskLevel: 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo',
    weight: number = 1
  ) => {
    const score = this.scoringWeights[riskLevel] * weight;
    parameterScores.push({
      parameter,
      value,
      riskLevel,
      score,
      weight
    });
    totalScore += score;
    totalQuestions += weight;
    reasons.push(`${parameter}: ${value} (${riskLevel} Risk)`);
  };

  // 1. Solicitation Channel (Both types)
  if (input.solicitationChannel) {
    const riskLevel = input.solicitationChannel === 'face_to_face' ? 'Low' : 'Medium';
    addParameterScore('Solicitation Channel', input.solicitationChannel, riskLevel);
  }

  // === INDIVIDUAL CUSTOMER SPECIFIC FIELDS ===
  if (input.submissionType === 'individual') {
    // 2. Nationality
    if (input.nationality) {
      const countryRisk = await masterDataService.getCountryRisk(input.nationality);
      if (countryRisk) {
        addParameterScore('Nationality', input.nationality, countryRisk.riskLevel as any);
      }
    }

    // 3. Geographical Status
    if (input.geographicalStatus) {
      const riskLevel = this.getGeographicalRisk(input.geographicalStatus);
      addParameterScore('Geographical Status', input.geographicalStatus, riskLevel);
    }

    // 4. Country of Residence
    if (input.countryOfResidence) {
      const countryRisk = await masterDataService.getCountryRisk(input.countryOfResidence);
      if (countryRisk) {
        addParameterScore('Country of Residence', input.countryOfResidence, countryRisk.riskLevel as any);
      }
    }

    // 5. Employment Type
    if (input.employmentType) {
      const employmentRisk = await masterDataService.getEmploymentRisk(input.employmentType);
      if (employmentRisk) {
        addParameterScore('Employment Type', input.employmentType, employmentRisk.riskLevel as any);
      }
    }
  }

  // === ENTITY CUSTOMER SPECIFIC FIELDS ===
  if (input.submissionType === 'entity') {
    // 2. Nature of Business
    if (input.natureOfBusiness) {
      const businessRisk = await masterDataService.getBusinessRisk(input.natureOfBusiness);
      if (businessRisk) {
        addParameterScore('Nature of Business', input.natureOfBusiness, businessRisk.riskLevel as any);
      }
    }

    // 3. Country of Registration
    if (input.countryOfRegistration) {
      const countryRisk = await masterDataService.getCountryRisk(input.countryOfRegistration);
      if (countryRisk) {
        addParameterScore('Country of Registration', input.countryOfRegistration, countryRisk.riskLevel as any);
      }
    }

    // 4. Expected Countries of Trade (Entity specific)
    if (input.expectedCountriesOfTrade && input.expectedCountriesOfTrade.length > 0) {
      const aggregatedRisk = await this.calculateAggregatedCountryRisk(input.expectedCountriesOfTrade);
      addParameterScore('Expected Countries of Trade', input.expectedCountriesOfTrade.join(', '), aggregatedRisk);
    }
  }

  // === COMMON FIELDS FOR BOTH TYPES ===
  
  // Expected Countries (General transactions)
  if (input.expectedCountries && input.expectedCountries.length > 0) {
    const aggregatedRisk = await this.calculateAggregatedCountryRisk(input.expectedCountries);
    addParameterScore('Expected Countries', input.expectedCountries.join(', '), aggregatedRisk);
  }

  // Product Usage (Both types)
  if (input.productUsage && input.productUsage.length > 0) {
    const aggregatedRisk = await this.calculateAggregatedProductRisk(input.productUsage);
    addParameterScore('Product Usage', input.productUsage.join(', '), aggregatedRisk);
  }

  // Calculate final weighted average
  const weightedAverage = totalQuestions > 0 ? totalScore / totalQuestions : 0;

  console.log(`🎯 Risk calculation summary:`, {
    submissionType: input.submissionType,
    totalQuestions,
    totalScore,
    weightedAverage,
    parametersEvaluated: parameterScores.length
  });

  return {
    totalScore: weightedAverage,
    reasons,
    parameterScores
  };
}

  private getGeographicalRisk(status: string): 'Low' | 'Medium' | 'High' {
    switch (status) {
      case 'resident_national':
      case 'resident_foreign':
        return 'Low';
      case 'non_resident_national':
      case 'non_resident_foreign':
        return 'Medium';
      default:
        return 'Medium';
    }
  }

  private async calculateAggregatedCountryRisk(countries: string[]): Promise<'Low' | 'Medium' | 'High'> {
    let highestRiskScore = 0;
    
    for (const country of countries) {
      const countryRisk = await masterDataService.getCountryRisk(country);
      if (countryRisk) {
        const score = this.scoringWeights[countryRisk.riskLevel as keyof typeof this.scoringWeights];
        highestRiskScore = Math.max(highestRiskScore, score);
      }
    }

    // Convert back to risk level
    if (highestRiskScore >= 3) return 'High';
    if (highestRiskScore >= 2) return 'Medium';
    return 'Low';
  }

  private async calculateAggregatedProductRisk(products: string[]): Promise<'Low' | 'Medium' | 'High'> {
    let highestRiskScore = 0;
    
    for (const product of products) {
      const productRisk = await masterDataService.getProductRisk(product);
      if (productRisk) {
        const score = this.scoringWeights[productRisk.riskLevel as keyof typeof this.scoringWeights];
        highestRiskScore = Math.max(highestRiskScore, score);
      }
    }

    // Convert back to risk level
    if (highestRiskScore >= 3) return 'High';
    if (highestRiskScore >= 2) return 'Medium';
    return 'Low';
  }

  private determineFinalRisk(score: number): 'Low' | 'Medium' | 'High' {
    if (score < this.scoringThresholds.lowThreshold) {
      return 'Low';
    } else if (score < this.scoringThresholds.mediumThreshold) {
      return 'Medium';
    } else {
      return 'High';
    }
  }
}

// Export singleton instance
export const enhancedRiskEngine = new EnhancedRiskEngine();