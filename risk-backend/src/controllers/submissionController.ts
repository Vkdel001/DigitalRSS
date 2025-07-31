// src/controllers/submissionController.ts (UPDATED VERSION)
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enhancedRiskEngine } from '../services/enhancedRiskEngine';

const prisma = new PrismaClient();

type RiskBand = 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';

export const createSubmission = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const { type, details } = req.body;

  try {
    console.log('🔍 Creating submission with details:', { type, details, userId });

    // Extract risk assessment data from details
    let riskAssessmentData = null;
    let calculatedScore = 0;
    let systemRating: RiskBand = 'Low';

    // Check if we have enhanced assessment data
    const enhancedDetail = details.find((d: any) => d.section === 'enhanced_assessment');
    
    if (enhancedDetail && enhancedDetail.data) {
      const assessmentData = enhancedDetail.data;
      
      // If we already have a risk assessment result, use it
      if (assessmentData.riskAssessment) {
        calculatedScore = assessmentData.riskAssessment.score || 0;
        systemRating = assessmentData.riskAssessment.finalRisk || 'Low';
        riskAssessmentData = assessmentData.riskAssessment;
      } else {
        // Otherwise, run the risk assessment
        const riskInput = {
          submissionType: assessmentData.submissionType || type,
          solicitationChannel: assessmentData.solicitationChannel,
          nationality: assessmentData.nationality,
          countryOfResidence: assessmentData.countryOfResidence,
          employmentType: assessmentData.employmentType,
          isPEP: assessmentData.isPEP,
          geographicalStatus: assessmentData.geographicalStatus,
          expectedCountries: assessmentData.expectedCountries,
          productUsage: assessmentData.productUsage,
          natureOfBusiness: assessmentData.natureOfBusiness,
          countryOfRegistration: assessmentData.countryOfRegistration,
          entityPEP: assessmentData.entityPEP,
          expectedCountriesOfTrade: assessmentData.expectedCountriesOfTrade,
        };

        console.log('🎯 Running risk assessment for submission:', riskInput);
        
        const riskResult = await enhancedRiskEngine.assessRisk(riskInput);
        calculatedScore = riskResult.score;
        systemRating = riskResult.finalRisk;
        riskAssessmentData = riskResult;
      }
    }

    // Create submission with proper risk data
    const submission = await prisma.submission.create({
      data: {
        submittedBy: userId,
        type,
        calculatedScore,
        systemRating: systemRating as RiskBand,
        finalRating: systemRating as RiskBand,
        justification: riskAssessmentData?.reasons?.join('; ') || 'Risk assessment completed',
        details: {
          create: details.map((item: any) => ({
            section: item.section,
            data: {
              ...item.data,
              riskAssessment: riskAssessmentData // Store complete risk assessment
            }
          }))
        }
      },
      include: {
        details: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    console.log('✅ Submission created successfully:', {
      id: submission.id,
      score: submission.calculatedScore,
      rating: submission.systemRating
    });

    res.status(201).json({
      submission,
      riskAssessment: riskAssessmentData
    });
  } catch (error) {
    console.error('❌ Submission creation error:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

export async function getUserSubmissions(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;

    let whereClause = {};
    
    // If user role is 'user', only show their submissions
    // If admin/approver, show all submissions
    if (userRole === 'user') {
      whereClause = { submittedBy: userId };
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: { 
        details: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    console.log(`📋 Retrieved ${submissions.length} submissions for user ${userId} (role: ${userRole})`);

    res.json(submissions);
  } catch (error) {
    console.error('Error getting user submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getSubmissionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { 
        details: true, 
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check authorization - users can only see their own submissions
    if (userRole === 'user' && submission.submittedBy !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error getting submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function overrideSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { finalRating, justification, status } = req.body;
    const userId = (req.user as any)?.id;

    console.log('🔧 Overriding submission:', { id, finalRating, justification, status, userId });

    // Validate finalRating
    const validRatings: RiskBand[] = ['Low', 'Medium', 'High', 'AutoHigh', 'NoGo'];
    if (finalRating && !validRatings.includes(finalRating)) {
      return res.status(400).json({ 
        message: 'Invalid final rating. Must be one of: ' + validRatings.join(', ')
      });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        finalRating: finalRating,
        justification: justification ? 
          `Manual override by approver (${userId}): ${justification}` : 
          'Manual override applied',
        status: status || 'approved'
      },
      include: {
        details: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error overriding submission:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function reassessRisk(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Get the submission with details
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { details: true }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Extract risk assessment data from submission details
    const enhancedDetail = submission.details.find(d => d.section === 'enhanced_assessment');
    
    if (!enhancedDetail) {
      return res.status(400).json({ message: 'No enhanced assessment data found for reassessment' });
    }

    const assessmentData = enhancedDetail.data as any;
    
    const riskInput = {
      submissionType: assessmentData.submissionType || submission.type,
      solicitationChannel: assessmentData.solicitationChannel,
      nationality: assessmentData.nationality,
      countryOfResidence: assessmentData.countryOfResidence,
      employmentType: assessmentData.employmentType,
      isPEP: assessmentData.isPEP,
      geographicalStatus: assessmentData.geographicalStatus,
      expectedCountries: assessmentData.expectedCountries,
      productUsage: assessmentData.productUsage,
      natureOfBusiness: assessmentData.natureOfBusiness,
      countryOfRegistration: assessmentData.countryOfRegistration,
      entityPEP: assessmentData.entityPEP,
      expectedCountriesOfTrade: assessmentData.expectedCountriesOfTrade,
    };

    console.log('🔄 Reassessing risk for submission:', id, riskInput);

    const riskResult = await enhancedRiskEngine.assessRisk(riskInput);

    // Update submission with new risk assessment
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        calculatedScore: riskResult.score,
        systemRating: riskResult.finalRisk,
        finalRating: riskResult.finalRisk,
        justification: `Reassessed: ${riskResult.reasons.join('; ')}`
      },
      include: {
        details: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      message: 'Risk reassessment completed',
      submission: updatedSubmission,
      riskAssessment: riskResult
    });
  } catch (error) {
    console.error('Error reassessing risk:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}

// Keep the existing testRiskAssessment function as is
export const testRiskAssessment = async (req: Request, res: Response) => {
  try {
    const riskInput = req.body;
    console.log('Testing risk assessment with input:', riskInput);
    
    const result = await enhancedRiskEngine.assessRisk(riskInput);
    
    res.json({
      message: 'Risk assessment completed',
      result
    });
  } catch (error) {
    console.error('Error in risk assessment:', error);
    res.status(500).json({ message: 'Error assessing risk', error });
  }
};