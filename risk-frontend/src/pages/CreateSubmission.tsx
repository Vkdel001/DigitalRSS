// src/pages/CreateSubmission.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { submissionsService } from '../services/submissions.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CreateSubmissionRequest } from '../types';

export const CreateSubmission: React.FC = () => {
  const [step, setStep] = useState(1);
  const [submissionType, setSubmissionType] = useState<'individual' | 'entity'>('individual');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const submissionData: CreateSubmissionRequest = {
        type: submissionType,
        details: [
          {
            section: 'personal_info',
            data: {
              country: data.country,
              isPEP: data.isPEP || false,
              age: parseInt(data.age) || 0,
              occupation: data.occupation,
            },
          },
          {
            section: 'financial_info',
            data: {
              sourceOfWealth: data.sourceOfWealth,
              estimatedMonthlyInflow: parseFloat(data.estimatedMonthlyInflow) || 0,
            },
          },
        ],
      };

      const result = await submissionsService.createSubmission(submissionData);
      navigate(`/submissions/${result.submission.id}`);
    } catch (error) {
      console.error('Failed to create submission:', error);
      alert('Failed to create submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Risk Assessment</h1>
        <p className="mt-2 text-gray-600">Create a new customer risk assessment</p>
      </div>

      <Card>
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Step 1: Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Submission Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="individual"
                    checked={submissionType === 'individual'}
                    onChange={(e) => setSubmissionType(e.target.value as 'individual' | 'entity')}
                    className="mr-3"
                  />
                  👤 Individual Customer
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="entity"
                    checked={submissionType === 'entity'}
                    onChange={(e) => setSubmissionType(e.target.value as 'individual' | 'entity')}
                    className="mr-3"
                  />
                  🏢 Corporate Entity
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Country"
                  {...register('country', { required: 'Country is required' })}
                  error={errors.country?.message as string}
                />

                <Input
                  label="Age"
                  type="number"
                  {...register('age', { required: 'Age is required' })}
                  error={errors.age?.message as string}
                />
              </div>

              <Input
                label="Occupation"
                {...register('occupation', { required: 'Occupation is required' })}
                error={errors.occupation?.message as string}
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPEP"
                  {...register('isPEP')}
                  className="mr-3"
                />
                <label htmlFor="isPEP" className="text-sm font-medium text-gray-700">
                  Politically Exposed Person (PEP)
                </label>
              </div>

              <h3 className="text-md font-semibold mt-8">Financial Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source of Wealth
                </label>
                <select
                  {...register('sourceOfWealth', { required: 'Source of wealth is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select source of wealth</option>
                  <option value="Salary">Salary/Employment</option>
                  <option value="Business">Business</option>
                  <option value="Investment">Investment</option>
                  <option value="Inheritance">Inheritance</option>
                  <option value="Other">Other</option>
                </select>
                {errors.sourceOfWealth && (
                  <p className="mt-1 text-sm text-red-600">{errors.sourceOfWealth.message as string}</p>
                )}
              </div>

              <Input
                label="Estimated Monthly Income/Inflow ($)"
                type="number"
                {...register('estimatedMonthlyInflow', { required: 'Monthly inflow is required' })}
                error={errors.estimatedMonthlyInflow?.message as string}
              />

              <div className="flex space-x-4">
                <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  Create Submission
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};
