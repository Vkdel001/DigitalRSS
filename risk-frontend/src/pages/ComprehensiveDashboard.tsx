// src/pages/ComprehensiveDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { submissionsService } from '../services/submissions.service';
import { masterDataService } from '../services/masterData.service';
import { Submission, MasterData } from '../types';

interface DashboardStats {
  totalSubmissions: number;
  byRiskLevel: {
    Low: number;
    Medium: number;
    High: number;
    AutoHigh: number;
    NoGo: number;
  };
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    escalated: number;
  };
  recentSubmissions: Submission[];
}

export const ComprehensiveDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [submissions, masterDataResponse] = await Promise.all([
        user?.role === 'admin' 
          ? submissionsService.getAllSubmissions()
          : submissionsService.getUserSubmissions(),
        masterDataService.getAllMasterData()
      ]);

      const submissionList = Array.isArray(submissions) ? submissions : submissions.submissions || [];
      
      // Calculate statistics
      const dashboardStats: DashboardStats = {
        totalSubmissions: submissionList.length,
        byRiskLevel: {
          Low: submissionList.filter(s => s.finalRating === 'Low').length,
          Medium: submissionList.filter(s => s.finalRating === 'Medium').length,
          High: submissionList.filter(s => s.finalRating === 'High').length,
          AutoHigh: submissionList.filter(s => s.finalRating === 'AutoHigh').length,
          NoGo: submissionList.filter(s => s.finalRating === 'NoGo').length,
        },
        byStatus: {
          pending: submissionList.filter(s => s.status === 'pending').length,
          approved: submissionList.filter(s => s.status === 'approved').length,
          rejected: submissionList.filter(s => s.status === 'rejected').length,
          escalated: submissionList.filter(s => s.status === 'escalated').length,
        },
        recentSubmissions: submissionList
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 10)
      };

      setStats(dashboardStats);
      setMasterData(masterDataResponse);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const getRiskPercentage = (count: number) => {
    if (!stats?.totalSubmissions) return 0;
    return Math.round((count / stats.totalSubmissions) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          🎯 Risk Assessment Portal - Welcome, {user?.email}!
        </h1>
        <p className="opacity-90">
          Comprehensive risk management system with {stats?.totalSubmissions || 0} total assessments
        </p>
        <div className="mt-4 flex space-x-4">
          <Link to="/submissions/create-enhanced">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              ➕ New Enhanced Assessment
            </Button>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin/master-data">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                🗃️ Manage Master Data
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats?.totalSubmissions || 0}</div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats?.byStatus.pending || 0}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {(stats?.byRiskLevel.High || 0) + (stats?.byRiskLevel.AutoHigh || 0)}
            </div>
            <div className="text-sm text-gray-600">High Risk Cases</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats?.byRiskLevel.NoGo || 0}</div>
            <div className="text-sm text-gray-600">NoGo Cases</div>
          </div>
        </Card>
      </div>

      {/* Risk Distribution & Master Data Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">🎯 Risk Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats?.byRiskLevel || {}).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      level === 'Low' ? 'success' :
                      level === 'Medium' ? 'warning' :
                      level === 'High' ? 'danger' :
                      'purple'
                    }
                  >
                    {level === 'NoGo' ? '🚫' : 
                     level === 'AutoHigh' ? '🟣' :
                     level === 'High' ? '🔴' :
                     level === 'Medium' ? '🟡' : '🟢'} 
                    {level}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {count} cases ({getRiskPercentage(count)}%)
                  </span>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      level === 'Low' ? 'bg-green-500' :
                      level === 'Medium' ? 'bg-yellow-500' :
                      level === 'High' ? 'bg-red-500' :
                      level === 'AutoHigh' ? 'bg-purple-500' :
                      'bg-red-700'
                    }`}
                    style={{ width: `${getRiskPercentage(count)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">🗃️ Master Data Summary</h3>
          {masterData ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{masterData.countries.length}</div>
                <div className="text-xs text-gray-600">Countries</div>
                <div className="text-xs text-red-600">
                  {masterData.countries.filter(c => c.riskLevel === 'NoGo').length} NoGo
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{masterData.employmentTypes.length}</div>
                <div className="text-xs text-gray-600">Employment Types</div>
                <div className="text-xs text-red-600">
                  {masterData.employmentTypes.filter(e => e.riskLevel === 'High').length} High Risk
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{masterData.products.length}</div>
                <div className="text-xs text-gray-600">Products</div>
                <div className="text-xs text-red-600">
                  {masterData.products.filter(p => p.riskLevel === 'High').length} High Risk
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{masterData.businessTypes.length}</div>
                <div className="text-xs text-gray-600">Business Types</div>
                <div className="text-xs text-red-600">
                  {masterData.businessTypes.filter(b => b.riskLevel === 'AutoHigh').length} Auto High
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading master data...</div>
          )}
          
          {user?.role === 'admin' && (
            <div className="mt-4 text-center">
              <Link to="/admin/master-data">
                <Button variant="outline" size="sm">Manage Master Data</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">📝 Recent Risk Assessments</h3>
          <div className="space-x-2">
            <Link to="/submissions">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
            <Link to="/submissions/create-enhanced">
              <Button size="sm">➕ New Assessment</Button>
            </Link>
          </div>
        </div>

        {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.type === 'individual' ? '👤' : '🏢'} 
                          {submission.user?.email || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {submission.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          submission.finalRating === 'Low' ? 'success' :
                          submission.finalRating === 'Medium' ? 'warning' :
                          submission.finalRating === 'High' ? 'danger' :
                          'purple'
                        }
                      >
                        {submission.finalRating === 'NoGo' ? '🚫' : 
                         submission.finalRating === 'AutoHigh' ? '🟣' :
                         submission.finalRating === 'High' ? '🔴' :
                         submission.finalRating === 'Medium' ? '🟡' : '🟢'} 
                        {submission.finalRating}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.calculatedScore || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          submission.status === 'approved' ? 'success' :
                          submission.status === 'rejected' ? 'danger' :
                          submission.status === 'escalated' ? 'purple' :
                          'warning'
                        }
                      >
                        {submission.status === 'pending' ? '⏳' :
                         submission.status === 'approved' ? '✅' :
                         submission.status === 'rejected' ? '❌' : '⬆️'} 
                        {submission.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/submissions/${submission.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No risk assessments yet</p>
            <Link to="/submissions/create-enhanced">
              <Button>Create Your First Assessment</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/submissions/create-enhanced" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-lg font-medium mb-2">🎯 Enhanced Assessment</div>
              <div className="text-sm text-gray-600">
                Create comprehensive risk assessment with real-time scoring
              </div>
            </div>
          </Link>
          
          <Link to="/submissions" className="block">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-lg font-medium mb-2">📋 View All Submissions</div>
              <div className="text-sm text-gray-600">
                Review and manage all risk assessments
              </div>
            </div>
          </Link>
          
          {user?.role === 'admin' && (
            <Link to="/admin/master-data" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium mb-2">⚙️ System Configuration</div>
                <div className="text-sm text-gray-600">
                  Manage risk parameters and system settings
                </div>
              </div>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
};