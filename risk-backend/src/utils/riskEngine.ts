import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Submission = Awaited<ReturnType<typeof prisma.submission.findFirst>>;
type RiskParameter = Awaited<ReturnType<typeof prisma.riskParameter.findFirst>>;
type AdminSetting = Awaited<ReturnType<typeof prisma.adminSetting.findFirst>>;
type SubmissionDetail = Awaited<ReturnType<typeof prisma.submissionDetail.findFirst>>;



type RiskBand = 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';

type RiskResult = {
  systemRating: RiskBand;
  score: number;
  reasons: string[];
};

// Extended submission type with additional fields for risk assessment
type SubmissionWithRiskData = Submission & {
  // Add fields that might come from submission details or form data
  country?: string;
  blacklisted?: boolean;
  isPEP?: boolean;
  sourceOfWealth?: string;
  estimatedMonthlyInflow?: number;
  // Add other risk-related fields as needed
};

export const assessRisk = async (submission: SubmissionWithRiskData): Promise<RiskResult> => {
  const parameters = await prisma.riskParameter.findMany();
  const settings = await prisma.adminSetting.findMany();

  // ✅ Fixed: Added proper type annotations
  const paramMap = Object.fromEntries(
    parameters.map((p: RiskParameter) => [p.parameter, p])
  );
  const settingMap = Object.fromEntries(
    settings.map((s: AdminSetting) => [s.key, s.value])
  );

  let score = 0;
  const reasons: string[] = [];

  // === RULE 1: No-Go country ===
  const noGoCountries = (settingMap["no_go_countries"] || "")
    .split(",")
    .map((c: string) => c.trim().toLowerCase());
    
  if (submission.country && noGoCountries.includes(submission.country.toLowerCase())) {
    return {
      systemRating: "NoGo", // ✅ Changed to NoGo for no-go countries
      score: 100,
      reasons: ["NO GO country — auto NoGo Risk"]
    };
  }

  // === RULE 2: Blacklist ===
  if (submission.blacklisted) {
    return {
      systemRating: "High",
      score: 100,
      reasons: ["Customer is blacklisted — auto High Risk"]
    };
  }

  // === RULE 3: PEP (Politically Exposed Person) ===
  if (submission.isPEP && paramMap["isPEP"]) {
    score += paramMap["isPEP"].scoreValue;
    reasons.push("Customer is a Politically Exposed Person");
  }

  // === RULE 4: Country Risk Level ===
  if (submission.country && paramMap[submission.country]) {
    const countryParam = paramMap[submission.country];
    score += countryParam.scoreValue;
    reasons.push(`Country risk level: ${countryParam.riskLevel}`);
  }

  // === RULE 5: Source of Wealth ===
  if (submission.sourceOfWealth && paramMap[`source_${submission.sourceOfWealth}`]) {
    const sowParam = paramMap[`source_${submission.sourceOfWealth}`];
    score += sowParam.scoreValue;
    reasons.push(`Source of Wealth: ${submission.sourceOfWealth}`);
  }

  // === RULE 6: Transaction Volume ===
  if (submission.estimatedMonthlyInflow && submission.estimatedMonthlyInflow > 100000) {
    const highVolumeParam = paramMap["high_txn_volume"];
    if (highVolumeParam) {
      score += highVolumeParam.scoreValue;
      reasons.push("High estimated transaction volume");
    }
  }

  // === RULE 7: Age-based scoring (example) ===
  // You can add more rules based on your business logic

  // === THRESHOLDS ===
  const low = Number(settingMap["score_threshold_low"] || 20);
  const medium = Number(settingMap["score_threshold_medium"] || 50);
  const high = Number(settingMap["score_threshold_high"] || 75);
  const autoHigh = Number(settingMap["score_threshold_auto_high"] || 90);

  let systemRating: RiskBand = "Low";
  if (score >= autoHigh) systemRating = "AutoHigh";
  else if (score >= high) systemRating = "High";
  else if (score >= medium) systemRating = "Medium";

  return {
    systemRating,
    score,
    reasons
  };
};

// Helper function to extract risk-relevant data from submission details
export const extractRiskDataFromSubmission = async (submissionId: string): Promise<SubmissionWithRiskData | null> => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      details: true,
      user: true
    }
  });

  if (!submission) return null;

  // Extract data from JSON details
  const riskData: any = {};
  
  submission.details.forEach((detail: SubmissionDetail) => {
  const data = detail.data as any;
  
    
    // Extract relevant fields based on section
    switch (detail.section) {
      case 'personal_info':
        riskData.country = data.country;
        riskData.isPEP = data.isPEP || data.politicallyExposed;
        break;
      case 'financial_info':
        riskData.sourceOfWealth = data.sourceOfWealth;
        riskData.estimatedMonthlyInflow = data.estimatedMonthlyInflow;
        break;
      case 'compliance':
        riskData.blacklisted = data.blacklisted;
        break;
      // Add more sections as needed
    }
  });

  return {
    ...submission,
    ...riskData
  };
};

// Main function to assess risk for a submission
export const assessSubmissionRisk = async (submissionId: string): Promise<RiskResult> => {
  const submissionWithRiskData = await extractRiskDataFromSubmission(submissionId);
  
  if (!submissionWithRiskData) {
    throw new Error('Submission not found');
  }

  return assessRisk(submissionWithRiskData);
};