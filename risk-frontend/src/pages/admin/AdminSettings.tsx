
// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AdminSetting, CreateAdminSettingRequest } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAdminSettingRequest>();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await adminService.getAdminSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateAdminSettingRequest) => {
    try {
      await adminService.createAdminSetting(data);
      await fetchSettings();
      setShowForm(false);
      reset();
    } catch (error) {
      console.error('Failed to save setting:', error);
      alert('Failed to save setting. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) return;
    
    try {
      await adminService.deleteAdminSetting(id);
      await fetchSettings();
    } catch (error) {
      console.error('Failed to delete setting:', error);
      alert('Failed to delete setting. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <Button onClick={() => setShowForm(true)}>➕ Add Setting</Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Add New Setting</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Key"
              {...register('key', { required: 'Key is required' })}
              error={errors.key?.message}
            />

            <Input
              label="Description"
              {...register('description', { required: 'Description is required' })}
              error={errors.description?.message}
            />

            <Input
              label="Value"
              {...register('value', { required: 'Value is required' })}
              error={errors.value?.message}
            />

            <div className="flex space-x-4">
              <Button type="submit">Create Setting</Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Settings List */}
      <div className="grid gap-6">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{setting.key}</h3>
                <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  {setting.value}
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDelete(setting.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
