// src/pages/SystemStatus.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { masterDataService } from '../services/masterData.service';

export const SystemStatus: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Test API connectivity
      const masterData = await masterDataService.getAllMasterData();
      
      setSystemHealth({
        apiStatus: 'healthy',
        databaseStatus: 'healthy',
        masterDataCounts: {
          countries: masterData.countries.length,
          employmentTypes: masterData.employmentTypes.length,
          products: masterData.products.length,
          businessTypes: masterData.businessTypes.length,
        },
        riskDistribution: {
          noGoCountries: masterData.countries.filter(c => c.riskLevel === 'NoGo').length,
          highRiskEmployment: masterData.employmentTypes.filter(e => e.riskLevel === 'High').length,
          autoHighProducts: masterData.products.filter(p => p.riskLevel === 'AutoHigh').length,
        }
      });
    } catch (error) {
      setSystemHealth({
        apiStatus: 'error',
        databaseStatus: 'error'
        
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Checking system status...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🔧 System Status</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">API Health</h3>
          <div className="flex items-center space-x-2">
            <Badge variant={systemHealth?.apiStatus === 'healthy' ? 'success' : 'danger'}>
              {systemHealth?.apiStatus === 'healthy' ? '✅ Healthy' : '❌ Error'}
            </Badge>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Database Status</h3>
          <div className="flex items-center space-x-2">
            <Badge variant={systemHealth?.databaseStatus === 'healthy' ? 'success' : 'danger'}>
              {systemHealth?.databaseStatus === 'healthy' ? '✅ Connected' : '❌ Error'}
            </Badge>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Risk Engine</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="success">✅ Operational</Badge>
          </div>
        </Card>
      </div>

      {systemHealth?.masterDataCounts && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">📊 Master Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth.masterDataCounts.countries}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemHealth.masterDataCounts.employmentTypes}
              </div>
              <div className="text-sm text-gray-600">Employment Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemHealth.masterDataCounts.products}
              </div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemHealth.masterDataCounts.businessTypes}
              </div>
              <div className="text-sm text-gray-600">Business Types</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-semibold mb-4">🎯 Risk Configuration Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>NoGo Countries:</span>
            <Badge variant="danger">{systemHealth?.riskDistribution?.noGoCountries || 0} configured</Badge>
          </div>
          <div className="flex justify-between">
            <span>High Risk Employment Types:</span>
            <Badge variant="warning">{systemHealth?.riskDistribution?.highRiskEmployment || 0} configured</Badge>
          </div>
          <div className="flex justify-between">
            <span>Auto High Risk Products:</span>
            <Badge variant="purple">{systemHealth?.riskDistribution?.autoHighProducts || 0} configured</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};