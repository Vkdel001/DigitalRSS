// src/pages/SubmissionsList.tsx (COMPLETE CORRECTED VERSION)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { submissionsService } from '../services/submissions.service';
import { Submission } from '../types'; // Use global types

export const SubmissionsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionsService.getUserSubmissions();
      console.log('📋 Fetched submissions:', data);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
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

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    if (filter !== 'all' && submission.status !== filter) return false;
    if (riskFilter !== 'all' && submission.finalRating !== riskFilter) return false;
    return true;
  });

  const getCustomerInfo = (submission: Submission) => {
    try {
      const enhancedDetail = submission.details?.find(d => d.section === 'enhanced_assessment');
      if (enhancedDetail?.data) {
        const data = enhancedDetail.data;
        if (submission.type === 'individual') {
          return data.nationality || data.countryOfResidence || 'Individual Customer';
        } else {
          return data.natureOfBusiness || data.countryOfRegistration || 'Corporate Entity';
        }
      }
    } catch (error) {
      console.error('Error extracting customer info:', error);
    }
    return submission.type === 'individual' ? 'Individual Customer' : 'Corporate Entity';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessments</h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'user' ? 'Your' : 'All'} customer risk assessments
          </p>
        </div>
        <div className="space-x-2">
          <Link to="/submissions/create">
            <Button variant="outline">➕ Basic Assessment</Button>
          </Link>
          <Link to="/submissions/create-enhanced">
            <Button>🎯 Enhanced Assessment</Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {submissions.filter(s => ['High', 'AutoHigh', 'NoGo'].includes(s.finalRating)).length}
            </div>
            <div className="text-sm text-gray-600">High Risk</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="AutoHigh">Auto High Risk</option>
              <option value="NoGo">No Go</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={fetchSubmissions}>
              🔄 Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card>
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {submissions.length === 0 
                ? 'No risk assessments found' 
                : 'No assessments match your filters'
              }
            </p>
            <Link to="/submissions/create-enhanced">
              <Button>Create Your First Assessment</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {submission.type === 'individual' ? '👤' : '🏢'} {getCustomerInfo(submission)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            by {submission.user?.email || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {submission.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">
                        {submission.calculatedScore?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRiskBadgeColor(submission.systemRating)}>
                        {getRiskIcon(submission.systemRating)} {submission.systemRating}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRiskBadgeColor(submission.finalRating)}>
                        {getRiskIcon(submission.finalRating)} {submission.finalRating}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeColor(submission.status)}>
                        {getStatusIcon(submission.status)} {submission.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/submissions/${submission.id}`}>
                        <Button variant="outline" size="sm">
                          👁️ View
                        </Button>
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'approver') && submission.status === 'pending' && (
    <>
      <Button 
        variant="success" 
        size="sm"
        onClick={async () => {
          try {
            await submissionsService.overrideSubmission(submission.id, {
              finalRating: submission.systemRating,
              justification: `Quick approved by ${user.email}`,
              status: 'approved'
            });
            fetchSubmissions(); // Refresh list
          } catch (error) {
            console.error('Quick approval failed:', error);
          }
        }}
      >
        ✅ Quick Approve
      </Button>
      
      <Button 
        variant="danger" 
        size="sm"
        onClick={async () => {
          try {
            await submissionsService.overrideSubmission(submission.id, {
              finalRating: submission.systemRating,
              justification: `Quick rejected by ${user.email}`,
              status: 'rejected'
            });
            fetchSubmissions(); // Refresh list
          } catch (error) {
            console.error('Quick rejection failed:', error);
          }
        }}
      >
        ❌ Quick Reject
      </Button>
    </>
  )}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};