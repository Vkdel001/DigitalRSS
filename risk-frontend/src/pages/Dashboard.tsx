
// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submissionsService } from '../services/submissions.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, RiskBadge } from '../components/ui/Badge';
import { Submission } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await submissionsService.getUserSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}!</h1>
        <p className="mt-1 opacity-90">Here's your risk assessment overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Submissions</h2>
          <Link to="/submissions/create">
            <Button>➕ New Submission</Button>
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No submissions yet</p>
            <Link to="/submissions/create" className="mt-4 inline-block">
              <Button>Create your first submission</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.slice(0, 5).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">
                    {submission.type === 'individual' ? '👤' : '🏢'} {submission.type}
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <StatusBadge status={submission.status} />
                  <RiskBadge risk={submission.finalRating} />
                  <Link to={`/submissions/${submission.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};