// src/services/riskEngine.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define types based on Prisma models
type RiskParameter = {
  id: number;
  category: string;
  parameter: string;
  riskLevel: RiskBand;
  scoreValue: number;
};

type AdminSetting = {
  id: string;
  key: string;
  description: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
};

type RiskBand = 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';

type InputItem = {
  category: string;
  parameter: string;
};

type RiskResult = {
  calculatedScore: number;
  systemRating: RiskBand;
  reasons: string[];
};

// Extended submission data for comprehensive risk assessment
type SubmissionRiskData = {
  country?: string;
  blacklisted?: boolean;
  isPEP?: boolean;
  sourceOfWealth?: string;
  estimatedMonthlyInflow?: number;
  age?: number;
  occupation?: string;
  // Add other fields as needed
};

// Legacy function for backward compatibility
export async function calculateRisk(inputs: InputItem[]): Promise<{
  calculatedScore: number;
  systemRating: RiskBand;
}> {
  let scoreSum = 0;
  let count = 0;
  let hasAutoHigh = false;
  let hasNoGo = false;

  for (const input of inputs) {
    const param = await prisma.riskParameter.findFirst({
      where: {
        category: input.category,
        parameter: input.parameter
      }
    });

    if (!param) continue;

    if (param.riskLevel === 'AutoHigh') hasAutoHigh = true;
    if (param.riskLevel === 'NoGo') hasNoGo = true;

    scoreSum += param.scoreValue;
    count++;
  }

  if (hasNoGo) {
    return { calculatedScore: 100, systemRating: 'NoGo' };
  }

  if (hasAutoHigh) {
    return { calculatedScore: 100, systemRating: 'AutoHigh' };
  }

  const avgScore = count > 0 ? scoreSum / count : 0;

  let band: RiskBand = 'Low';
  if (avgScore >= 70) band = 'High';
  else if (avgScore >= 40) band = 'Medium';

  return {
    calculatedScore: avgScore,
    systemRating: band
  };
}

// Advanced risk assessment function
export async function assessRisk(submissionData: SubmissionRiskData): Promise<RiskResult> {
  const parameters = await prisma.riskParameter.findMany();
  const settings = await prisma.adminSetting.findMany();

  const paramMap = Object.fromEntries(
    parameters.map((p: RiskParameter) => [p.parameter, p])
  );
  const settingMap = Object.fromEntries(
    settings.map((s: AdminSetting) => [s.key, s.value])
  );

  let score = 0;
  const reasons: string[] = [];

  // === RULE 1: No-Go Countries ===
  const noGoCountries = (settingMap["no_go_countries"] || "")
    .split(",")
    .map((c: string) => c.trim().toLowerCase())
    .filter((c: string) => c.length > 0);
    
  if (submissionData.country && noGoCountries.includes(submissionData.country.toLowerCase())) {
    return {
      calculatedScore: 100,
      systemRating: "NoGo",
      reasons: ["Country is in No-Go list — auto NoGo Risk"]
    };
  }

  // === RULE 2: Blacklisted Customers ===
  if (submissionData.blacklisted) {
    return {
      calculatedScore: 100,
      systemRating: "High",
      reasons: ["Customer is blacklisted — auto High Risk"]
    };
  }

  // === RULE 3: PEP (Politically Exposed Person) ===
  if (submissionData.isPEP) {
    const pepParam = paramMap["PEP"] || paramMap["isPEP"] || paramMap["Politically_Exposed_Person"];
    if (pepParam) {
      score += pepParam.scoreValue;
      reasons.push("Customer is a Politically Exposed Person");
    } else {
      // Default PEP scoring if no parameter found
      score += 30;
      reasons.push("Customer is a Politically Exposed Person (default scoring)");
    }
  }

  // === RULE 4: Country Risk Level ===
  if (submissionData.country) {
    const countryParam = paramMap[submissionData.country];
    if (countryParam) {
      score += countryParam.scoreValue;
      reasons.push(`Country risk: ${submissionData.country} (${countryParam.riskLevel})`);
    }
  }

  // === RULE 5: Source of Wealth ===
  if (submissionData.sourceOfWealth) {
    const sowParam = paramMap[`source_${submissionData.sourceOfWealth}`] || 
                    paramMap[submissionData.sourceOfWealth];
    if (sowParam) {
      score += sowParam.scoreValue;
      reasons.push(`Source of Wealth: ${submissionData.sourceOfWealth}`);
    }
  }

  // === RULE 6: High Transaction Volume ===
  if (submissionData.estimatedMonthlyInflow && submissionData.estimatedMonthlyInflow > 100000) {
    const highVolumeParam = paramMap["high_transaction_volume"] || paramMap["high_txn_volume"];
    if (highVolumeParam) {
      score += highVolumeParam.scoreValue;
      reasons.push("High estimated monthly transaction volume");
    } else {
      // Default high volume scoring
      score += 20;
      reasons.push("High estimated monthly transaction volume (default scoring)");
    }
  }

  // === RULE 7: Age-based Risk ===
  if (submissionData.age) {
    if (submissionData.age < 18) {
      score += 50;
      reasons.push("Minor - high compliance risk");
    } else if (submissionData.age > 80) {
      const elderlyParam = paramMap["elderly_customer"];
      if (elderlyParam) {
        score += elderlyParam.scoreValue;
        reasons.push("Elderly customer - enhanced due diligence required");
      }
    }
  }

  // === RULE 8: High-Risk Occupations ===
  if (submissionData.occupation) {
    const occupationParam = paramMap[`occupation_${submissionData.occupation}`] ||
                           paramMap[submissionData.occupation];
    if (occupationParam) {
      score += occupationParam.scoreValue;
      reasons.push(`Occupation: ${submissionData.occupation}`);
    }
  }

  // === DETERMINE FINAL RATING BASED ON THRESHOLDS ===
  const thresholds = {
    low: Number(settingMap["score_threshold_low"] || 20),
    medium: Number(settingMap["score_threshold_medium"] || 50),
    high: Number(settingMap["score_threshold_high"] || 75),
    autoHigh: Number(settingMap["score_threshold_auto_high"] || 90)
  };

  let systemRating: RiskBand = "Low";
  if (score >= thresholds.autoHigh) {
    systemRating = "AutoHigh";
  } else if (score >= thresholds.high) {
    systemRating = "High";
  } else if (score >= thresholds.medium) {
    systemRating = "Medium";
  }

  return {
    calculatedScore: score,
    systemRating,
    reasons: reasons.length > 0 ? reasons : ["Standard risk assessment completed"]
  };
}

// Extract risk data from submission details
// Extract risk data from submission details
export async function extractRiskDataFromSubmission(submissionId: string): Promise<SubmissionRiskData> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      details: true
    }
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  const riskData: SubmissionRiskData = {};
  
  submission.details.forEach((detail: any) => {
    const data = detail.data as any;
    
    switch (detail.section) {
      case 'personal_info':
      case 'personal':
        riskData.country = data.country || data.nationality;
        riskData.isPEP = data.isPEP || data.politicallyExposed || data.pep;
        riskData.age = data.age || (data.dateOfBirth ? 
          new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() : undefined);
        riskData.occupation = data.occupation || data.profession;
        break;
        
      case 'financial_info':
      case 'financial':
        riskData.sourceOfWealth = data.sourceOfWealth || data.incomeSource;
        riskData.estimatedMonthlyInflow = data.estimatedMonthlyInflow || 
          data.monthlyIncome || data.expectedMonthlyTurnover;
        break;
        
      case 'compliance':
      case 'kyc':
        riskData.blacklisted = data.blacklisted || data.sanctioned;
        break;
        
      default:
        // Handle other sections or custom fields
        Object.keys(data).forEach((key: string) => {
          if (key in riskData) {
            (riskData as any)[key] = data[key];
          }
        });
    }
  });

  return riskData;
}

// Main function to assess submission risk
export async function assessSubmissionRisk(submissionId: string): Promise<RiskResult> {
  const riskData = await extractRiskDataFromSubmission(submissionId);
  return assessRisk(riskData);
}

// Update submission with risk assessment
export async function updateSubmissionRisk(submissionId: string): Promise<any> {
  const riskResult = await assessSubmissionRisk(submissionId);
  
  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      calculatedScore: riskResult.calculatedScore,
      systemRating: riskResult.systemRating,
      finalRating: riskResult.systemRating,
      justification: riskResult.reasons.join('; ')
    }
  });

  return {
    submission: updatedSubmission,
    riskAssessment: riskResult
  };
}