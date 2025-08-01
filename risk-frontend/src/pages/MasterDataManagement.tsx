// src/pages/admin/MasterDataManagement.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { masterDataService } from '../services/masterData.service';
// ✅ Correct import
import { MasterData, CountryRisk, EmploymentRisk, ProductRisk, BusinessNatureRisk } from '../types/index';
type DataType = 'countries' | 'employment' | 'products' | 'business';

export const MasterDataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DataType>('countries');
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const data = await masterDataService.getAllMasterData();
      setMasterData(data);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    if (!masterData) return [];
    switch (activeTab) {
      case 'countries': return masterData.countries;
      case 'employment': return masterData.employmentTypes;
      case 'products': return masterData.products;
      case 'business': return masterData.businessTypes;
    }
  };

  const getFieldNames = () => {
    switch (activeTab) {
      case 'countries': return { name: 'country', label: 'Country Name' };
      case 'employment': return { name: 'occupation', label: 'Occupation' };
      case 'products': return { name: 'product', label: 'Product Name' };
      case 'business': return { name: 'business', label: 'Business Type' };
    }
  };

  // Replace the onSubmit function with this fixed version:

const onSubmit = async (data: any) => {
  try {
    const { name, riskLevel } = data;

    if (editingItem) {
      // Update - with explicit typing for each case
      switch (activeTab) {
        case 'countries':
          await masterDataService.updateCountryRisk(editingItem.id, {
            country: name,
            riskLevel: riskLevel
          });
          break;
        case 'employment':
          await masterDataService.updateEmploymentRisk(editingItem.id, {
            occupation: name,
            riskLevel: riskLevel
          });
          break;
        case 'products':
          await masterDataService.updateProductRisk(editingItem.id, {
            product: name,
            riskLevel: riskLevel
          });
          break;
        case 'business':
          await masterDataService.updateBusinessRisk(editingItem.id, {
            business: name,
            riskLevel: riskLevel
          });
          break;
      }
    } else {
      // Create - with explicit typing for each case
      switch (activeTab) {
        case 'countries':
          await masterDataService.createCountryRisk({
            country: name,
            riskLevel: riskLevel
          });
          break;
        case 'employment':
          await masterDataService.createEmploymentRisk({
            occupation: name,
            riskLevel: riskLevel
          });
          break;
        case 'products':
          await masterDataService.createProductRisk({
            product: name,
            riskLevel: riskLevel
          });
          break;
        case 'business':
          await masterDataService.createBusinessRisk({
            business: name,
            riskLevel: riskLevel
          });
          break;
      }
    }

    await fetchMasterData();
    setShowForm(false);
    setEditingItem(null);
    reset();
  } catch (error) {
    console.error('Failed to save item:', error);
    alert('Failed to save item. Please try again.');
  }
};

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const fields = getFieldNames();
    reset({
      name: item[fields.name],
      riskLevel: item.riskLevel,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'countries':
          await masterDataService.deleteCountryRisk(id);
          break;
        case 'employment':
          await masterDataService.deleteEmploymentRisk(id);
          break;
        case 'products':
          await masterDataService.deleteProductRisk(id);
          break;
        case 'business':
          await masterDataService.deleteBusinessRisk(id);
          break;
      }

      await fetchMasterData();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await masterDataService.exportMasterData(activeTab);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${activeTab}-risk-data.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading master data...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'countries', label: '🌍 Countries', count: masterData?.countries.length || 0 },
    { id: 'employment', label: '💼 Employment', count: masterData?.employmentTypes.length || 0 },
    { id: 'products', label: '💳 Products', count: masterData?.products.length || 0 },
    { id: 'business', label: '🏢 Business', count: masterData?.businessTypes.length || 0 },
  ];

  const data = getCurrentData();
  const fields = getFieldNames();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Master Data Management</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleExport}>
            📥 Export {activeTab}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            ➕ Add {fields.label}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DataType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit' : 'Add New'} {fields.label}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={fields.label}
              {...register('name', { required: `${fields.label} is required` })}
              error={errors.name?.message as string}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                {...register('riskLevel', { required: 'Risk level is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select risk level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="AutoHigh">AutoHigh</option>
                <option value="NoGo">NoGo</option>
              </select>
              {errors.riskLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.riskLevel.message as string}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                {editingItem ? 'Update' : 'Create'} {fields.label}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            {tabs.find(t => t.id === activeTab)?.label} Data ({data.length} items)
          </h3>
        </div>

        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {fields.label}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item[fields.name]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={
                        item.riskLevel === 'Low' ? 'success' :
                        item.riskLevel === 'Medium' ? 'warning' :
                        item.riskLevel === 'High' ? 'danger' :
                        'purple'
                      }
                    >
                      {item.riskLevel === 'NoGo' ? '🚫' : 
                       item.riskLevel === 'AutoHigh' ? '🟣' :
                       item.riskLevel === 'High' ? '🔴' :
                       item.riskLevel === 'Medium' ? '🟡' : '🟢'} 
                      {item.riskLevel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)}
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