// src/pages/admin/RiskParameters.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RiskBadge } from '../../components/ui/Badge';
import { RiskParameter, CreateRiskParameterRequest } from '../../types';

export const RiskParameters: React.FC = () => {
  const [parameters, setParameters] = useState<RiskParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingParam, setEditingParam] = useState<RiskParameter | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateRiskParameterRequest>();

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const data = await adminService.getRiskParameters();
      setParameters(data);
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateRiskParameterRequest) => {
    try {
      if (editingParam) {
        await adminService.updateRiskParameter(editingParam.id, data);
      } else {
        await adminService.createRiskParameter(data);
      }
      
      await fetchParameters();
      setShowForm(false);
      setEditingParam(null);
      reset();
    } catch (error) {
      console.error('Failed to save parameter:', error);
      alert('Failed to save parameter. Please try again.');
    }
  };

  const handleEdit = (param: RiskParameter) => {
    setEditingParam(param);
    reset({
      category: param.category,
      parameter: param.parameter,
      riskLevel: param.riskLevel,
      scoreValue: param.scoreValue,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this parameter?')) return;
    
    try {
      await adminService.deleteRiskParameter(id);
      await fetchParameters();
    } catch (error) {
      console.error('Failed to delete parameter:', error);
      alert('Failed to delete parameter. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading parameters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Risk Parameters</h1>
        <Button onClick={() => setShowForm(true)}>➕ Add Parameter</Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            {editingParam ? 'Edit Parameter' : 'Add New Parameter'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Category"
                {...register('category', { required: 'Category is required' })}
                error={errors.category?.message}
              />

              <Input
                label="Parameter"
                {...register('parameter', { required: 'Parameter is required' })}
                error={errors.parameter?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  {...register('riskLevel', { required: 'Risk level is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select risk level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="AutoHigh">AutoHigh</option>
                  <option value="NoGo">NoGo</option>
                </select>
                {errors.riskLevel && (
                  <p className="mt-1 text-sm text-red-600">{errors.riskLevel.message}</p>
                )}
              </div>

              <Input
                label="Score Value"
                type="number"
                step="0.1"
                {...register('scoreValue', { 
                  required: 'Score value is required',
                  valueAsNumber: true 
                })}
                error={errors.scoreValue?.message}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                {editingParam ? 'Update' : 'Create'} Parameter
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setEditingParam(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Parameters List */}
      <Card>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parameters.map((param) => (
                <tr key={param.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {param.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {param.parameter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskBadge risk={param.riskLevel} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {param.scoreValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(param)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(param.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};