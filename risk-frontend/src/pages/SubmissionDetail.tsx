// src/pages/SubmissionDetail.tsx (COMPLETE CORRECTED VERSION)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { submissionsService } from '../services/submissions.service';
import { Submission } from '../types'; // Use global types

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [reassessLoading, setReassessLoading] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideData, setOverrideData] = useState({
    finalRating: '',
    justification: '',
    status: 'approved'
  });

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const data = await submissionsService.getSubmissionById(id!);
      console.log('📄 Fetched submission detail:', data);
      setSubmission(data);
    } catch (error) {
      console.error('Failed to fetch submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async () => {
    try {
      setOverrideLoading(true);
await submissionsService.overrideSubmission(id!, {
  finalRating: overrideData.finalRating as any, // Type assertion
  justification: overrideData.justification,
  status: overrideData.status as any
});      await fetchSubmission(); // Refresh data
      setShowOverrideForm(false);
      setOverrideData({ finalRating: '', justification: '', status: 'approved' });
    } catch (error) {
      console.error('Failed to override submission:', error);
      alert('Failed to override submission. Please try again.');
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleReassess = async () => {
    try {
      setReassessLoading(true);
      await submissionsService.reassessRisk(id!);
      await fetchSubmission(); // Refresh data
    } catch (error) {
      console.error('Failed to reassess risk:', error);
      alert('Failed to reassess risk. Please try again.');
    } finally {
      setReassessLoading(false);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'danger';
      case 'AutoHigh': return 'purple';
      case 'NoGo': return 'danger';
      default: return 'default';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'escalated': return 'purple';
      default: return 'default';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🔴';
      case 'AutoHigh': return '🟣';
      case 'NoGo': return '🚫';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'escalated': return '⬆️';
      default: return '⚪';
    }
  };

  const extractRiskAssessmentData = (submission: Submission) => {
    try {
      const enhancedDetail = submission.details?.find(d => d.section === 'enhanced_assessment');
      if (enhancedDetail?.data) {
        return enhancedDetail.data;
      }
    } catch (error) {
      console.error('Error extracting risk assessment data:', error);
    }
    return null;
  };

  const renderCustomerDetails = (assessmentData: any, type: string) => {
    if (!assessmentData) return null;

    if (type === 'individual') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
            <div className="space-y-2 text-sm">
              {assessmentData.nationality && (
                <div><span className="font-medium">Nationality:</span> {assessmentData.nationality}</div>
              )}
              {assessmentData.countryOfResidence && (
                <div><span className="font-medium">Country of Residence:</span> {assessmentData.countryOfResidence}</div>
              )}
              {assessmentData.employmentType && (
                <div><span className="font-medium">Employment:</span> {assessmentData.employmentType}</div>
              )}
              {assessmentData.geographicalStatus && (
                <div><span className="font-medium">Geographic Status:</span> {assessmentData.geographicalStatus}</div>
              )}
              <div><span className="font-medium">PEP Status:</span> {assessmentData.isPEP ? '🚨 Yes' : '✅ No'}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
            <div className="space-y-2 text-sm">
              {assessmentData.solicitationChannel && (
                <div><span className="font-medium">Channel:</span> {assessmentData.solicitationChannel}</div>
              )}
              {assessmentData.expectedCountries && assessmentData.expectedCountries.length > 0 && (
                <div><span className="font-medium">Expected Countries:</span> {assessmentData.expectedCountries.join(', ')}</div>
              )}
              {assessmentData.productUsage && assessmentData.productUsage.length > 0 && (
                <div><span className="font-medium">Products:</span> {assessmentData.productUsage.join(', ')}</div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Entity Information</h4>
            <div className="space-y-2 text-sm">
              {assessmentData.natureOfBusiness && (
                <div><span className="font-medium">Business Nature:</span> {assessmentData.natureOfBusiness}</div>
              )}
              {assessmentData.countryOfRegistration && (
                <div><span className="font-medium">Registration Country:</span> {assessmentData.countryOfRegistration}</div>
              )}
              <div><span className="font-medium">Entity PEP:</span> {assessmentData.entityPEP ? '🚨 Yes' : '✅ No'}</div>
              {assessmentData.expectedCountriesOfTrade && assessmentData.expectedCountriesOfTrade.length > 0 && (
                <div><span className="font-medium">Trade Countries:</span> {assessmentData.expectedCountriesOfTrade.join(', ')}</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
            <div className="space-y-2 text-sm">
              {assessmentData.solicitationChannel && (
                <div><span className="font-medium">Channel:</span> {assessmentData.solicitationChannel}</div>
              )}
              {assessmentData.expectedCountries && assessmentData.expectedCountries.length > 0 && (
                <div><span className="font-medium">Expected Countries:</span> {assessmentData.expectedCountries.join(', ')}</div>
              )}
              {assessmentData.productUsage && assessmentData.productUsage.length > 0 && (
                <div><span className="font-medium">Products:</span> {assessmentData.productUsage.join(', ')}</div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderRiskAssessmentDetails = (assessmentData: any) => {
    const riskAssessment = assessmentData?.riskAssessment;
    if (!riskAssessment) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{riskAssessment.score?.toFixed(2) || '0.00'}</div>
            <div className="text-sm text-gray-600">Calculated Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold">
              <Badge variant={getRiskBadgeColor(riskAssessment.finalRisk)}>
                {getRiskIcon(riskAssessment.finalRisk)} {riskAssessment.finalRisk}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">System Rating</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">
              {riskAssessment.calculationMethod?.replace('_', ' ') || 'weighted average'}
            </div>
            <div className="text-sm text-gray-600">Calculation Method</div>
          </div>
        </div>

        {riskAssessment.stopReasons && riskAssessment.stopReasons.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">⚠️ Stop Conditions</h4>
            <ul className="list-disc list-inside space-y-1">
              {riskAssessment.stopReasons.map((reason: string, index: number) => (
                <li key={index} className="text-sm text-red-700">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {riskAssessment.reasons && riskAssessment.reasons.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Risk Factors Analysis</h4>
            <ul className="list-disc list-inside space-y-1">
              {riskAssessment.reasons.map((reason: string, index: number) => (
                <li key={index} className="text-sm text-gray-600">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {riskAssessment.parameterScores && riskAssessment.parameterScores.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Parameter Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Parameter</th>
                    <th className="px-3 py-2 text-left">Value</th>
                    <th className="px-3 py-2 text-left">Risk Level</th>
                    <th className="px-3 py-2 text-left">Score</th>
                    <th className="px-3 py-2 text-left">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {riskAssessment.parameterScores.map((param: any, index: number) => (
                    <tr key={index}>
                      <td className="px-3 py-2 font-medium">{param.parameter}</td>
                      <td className="px-3 py-2">{param.value}</td>
                      <td className="px-3 py-2">
                        <Badge variant={getRiskBadgeColor(param.riskLevel)} >
                          {getRiskIcon(param.riskLevel)} {param.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">{param.score}</td>
                      <td className="px-3 py-2">{param.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading submission details...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission Not Found</h2>
        <p className="text-gray-600 mb-4">The requested submission could not be found.</p>
        <Button onClick={() => navigate('/submissions')}>Back to Submissions</Button>
      </div>
    );
  }

  const assessmentData = extractRiskAssessmentData(submission);
  const canReview = user?.role === 'admin' || user?.role === 'approver';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {submission.type === 'individual' ? '👤' : '🏢'} Risk Assessment Details
          </h1>
          <p className="text-gray-600">
            Submitted by {submission.user?.email || 'Unknown'} on {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/submissions')}>
            ← Back to List
          </Button>
          {canReview && (
            <>
              <Button
                variant="outline"
                onClick={handleReassess}
                isLoading={reassessLoading}
              >
                🔄 Reassess Risk
              </Button>
              <Button
                onClick={() => setShowOverrideForm(!showOverrideForm)}
                variant={showOverrideForm ? 'secondary' : 'primary'}
              >
                ⚖️ {showOverrideForm ? 'Cancel' : 'Override'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {submission.calculatedScore?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-600">Risk Score</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge variant={getRiskBadgeColor(submission.systemRating)}>
              {getRiskIcon(submission.systemRating)} {submission.systemRating}
            </Badge>
            <div className="text-sm text-gray-600 mt-1">System Rating</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge variant={getRiskBadgeColor(submission.finalRating)}>
              {getRiskIcon(submission.finalRating)} {submission.finalRating}
            </Badge>
            <div className="text-sm text-gray-600 mt-1">Final Rating</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Badge variant={getStatusBadgeColor(submission.status)}>
              {getStatusIcon(submission.status)} {submission.status}
            </Badge>
            <div className="text-sm text-gray-600 mt-1">Status</div>
          </div>
        </Card>
      </div>

      {/* Override Form */}
      {showOverrideForm && canReview && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">⚖️ Manual Override</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Final Rating</label>
              <select
                value={overrideData.finalRating}
                onChange={(e) => setOverrideData({ ...overrideData, finalRating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select rating</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="AutoHigh">AutoHigh</option>
                <option value="NoGo">NoGo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={overrideData.status}
                onChange={(e) => setOverrideData({ ...overrideData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleOverride}
                isLoading={overrideLoading}
                disabled={!overrideData.finalRating}
              >
                Apply Override
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
            <textarea
              value={overrideData.justification}
              onChange={(e) => setOverrideData({ ...overrideData, justification: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Provide justification for this override..."
            />
          </div>
        </Card>
      )}

      {/* Customer Details */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">
          {submission.type === 'individual' ? '👤 Customer Information' : '🏢 Entity Information'}
        </h3>
        {renderCustomerDetails(assessmentData, submission.type)}
      </Card>

      {/* Risk Assessment Details */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">🎯 Risk Assessment Analysis</h3>
        {renderRiskAssessmentDetails(assessmentData)}
      </Card>

      {/* Justification */}
      {submission.justification && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">📝 Justification</h3>
          <p className="text-gray-700">{submission.justification}</p>
        </Card>
      )}

      {/* Raw Data (for debugging - only show to admins) */}
      {user?.role === 'admin' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">🔧 Raw Data (Admin Only)</h3>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(submission, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};