// src/pages/EnhancedCreateSubmission.tsx (COMPLETE FIXED VERSION)
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Badge } from '../components/ui/Badge';
import { masterDataService } from '../services/masterData.service';
import { submissionsService } from '../services/submissions.service';

// Local type definitions to avoid import issues
interface CountryRisk {
  id: number;
  country: string;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface EmploymentRisk {
  id: number;
  occupation: string;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductRisk {
  id: number;
  product: string;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface BusinessNatureRisk {
  id: number;
  business: string;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface MasterData {
  countries: CountryRisk[];
  employmentTypes: EmploymentRisk[];
  products: ProductRisk[];
  businessTypes: BusinessNatureRisk[];
}

interface RiskAssessmentInput {
  // Individual Customer Fields
  solicitationChannel?: 'face_to_face' | 'non_face_to_face';
  nationality?: string;
  geographicalStatus?: 'non_resident_foreign' | 'non_resident_national' | 'resident_foreign' | 'resident_national';
  countryOfResidence?: string;
  employmentType?: string;
  isPEP?: boolean;
  pepType?: 'international_non_face' | 'international_face' | 'local_non_face' | 'local_face';
  expectedCountries?: string[];
  productUsage?: string[];
  adverseMedia?: boolean;
  
  // Entity Customer Fields
  natureOfBusiness?: string;
  countryOfRegistration?: string;
  entityGeographicalStatus?: string;
  entityPEP?: boolean;
  expectedCountriesOfTrade?: string[];
  sanctionCheck?: boolean;
  
  // Common Fields
  submissionType: 'individual' | 'entity';
}

interface EnhancedRiskResult {
  finalRisk: 'Low' | 'Medium' | 'High' | 'AutoHigh' | 'NoGo';
  score: number;
  reasons: string[];
  stopReasons?: string[];
  parameterScores: any[];
  calculationMethod: 'weighted_average' | 'immediate_stop' | 'auto_high';
}

export const EnhancedCreateSubmission: React.FC = () => {
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [submissionType, setSubmissionType] = useState<'individual' | 'entity'>('individual');
  const [riskPreview, setRiskPreview] = useState<EnhancedRiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm();

  // Watch form values for real-time risk preview
  const watchedValues = watch();

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const data = await masterDataService.getAllMasterData();
        setMasterData(data);
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      }
    };

    fetchMasterData();
  }, []);

  // Real-time risk preview (debounced) - FIXED VERSION
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedValues && Object.keys(watchedValues).length > 0) {
        performRiskPreview();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues, submissionType]); // Add submissionType dependency

  // FIXED: Proper validation for both individual and entity
  const performRiskPreview = async () => {
    // Different validation for individual vs entity
    const hasRequiredFields = submissionType === 'individual' 
      ? (watchedValues.nationality || watchedValues.countryOfResidence)
      : (watchedValues.natureOfBusiness || watchedValues.countryOfRegistration);

    if (!hasRequiredFields) {
      setRiskPreview(null);
      return;
    }

    setPreviewLoading(true);
    try {
      // FIXED: Build proper risk input based on submission type
      const riskInput: RiskAssessmentInput = {
        submissionType,
        solicitationChannel: watchedValues.solicitationChannel || 'face_to_face',
        
        // Individual fields - only send if individual
        ...(submissionType === 'individual' && {
          nationality: watchedValues.nationality,
          countryOfResidence: watchedValues.countryOfResidence,
          employmentType: watchedValues.employmentType,
          isPEP: watchedValues.isPEP || false,
          geographicalStatus: watchedValues.geographicalStatus,
        }),
        
        // Entity fields - only send if entity
        ...(submissionType === 'entity' && {
          natureOfBusiness: watchedValues.natureOfBusiness,
          countryOfRegistration: watchedValues.countryOfRegistration,
          entityPEP: watchedValues.entityPEP || false,
          expectedCountriesOfTrade: watchedValues.expectedCountriesOfTrade || [],
        }),
        
        // Common fields
        expectedCountries: watchedValues.expectedCountries || [],
        productUsage: watchedValues.productUsage || [],
      };

      console.log('🔍 Risk preview input:', riskInput);

      const result = await masterDataService.testRiskAssessment(riskInput);
      console.log('🎯 Risk preview result:', result);
      setRiskPreview(result.result);
    } catch (error) {
      console.error('Risk preview failed:', error);
      setRiskPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // FIXED: Handle submission type changes properly
  const handleSubmissionTypeChange = (newType: 'individual' | 'entity') => {
    setSubmissionType(newType);
    setRiskPreview(null); // Clear risk preview when changing type
    
    // Clear form fields that don't apply to the new type
    if (newType === 'individual') {
      setValue('natureOfBusiness', '');
      setValue('countryOfRegistration', '');
      setValue('entityPEP', false);
      setValue('expectedCountriesOfTrade', []);
    } else {
      setValue('nationality', '');
      setValue('countryOfResidence', '');
      setValue('employmentType', '');
      setValue('isPEP', false);
      setValue('geographicalStatus', '');
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Create submission using enhanced data
      const submissionData = {
        type: submissionType,
        details: [
          {
            section: 'enhanced_assessment',
            data: {
              ...data,
              submissionType,
              riskAssessment: riskPreview
            }
          }
        ]
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

  if (!masterData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading master data...</div>
      </div>
    );
  }

  const countryOptions = masterData.countries.map(c => ({
    value: c.country,
    label: c.country,
    riskLevel: c.riskLevel
  }));

  const employmentOptions = masterData.employmentTypes.map(e => ({
    value: e.occupation,
    label: e.occupation,
    riskLevel: e.riskLevel
  }));

  const productOptions = masterData.products.map(p => ({
    value: p.product,
    label: p.product,
    riskLevel: p.riskLevel
  }));

  const businessOptions = masterData.businessTypes.map(b => ({
    value: b.business,
    label: b.business,
    riskLevel: b.riskLevel
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enhanced Risk Assessment</h1>
        <p className="mt-2 text-gray-600">Create a comprehensive customer risk assessment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Submission Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Customer Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="individual"
                      checked={submissionType === 'individual'}
                      onChange={(e) => handleSubmissionTypeChange(e.target.value as 'individual')}
                      className="mr-3"
                    />
                    👤 Individual Customer
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="entity"
                      checked={submissionType === 'entity'}
                      onChange={(e) => handleSubmissionTypeChange(e.target.value as 'entity')}
                      className="mr-3"
                    />
                    🏢 Corporate Entity
                  </label>
                </div>
              </div>

              {/* Solicitation Channel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solicitation Channel
                </label>
                <select
                  {...register('solicitationChannel')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="face_to_face">Face to Face</option>
                  <option value="non_face_to_face">Non Face to Face</option>
                </select>
              </div>

              {submissionType === 'individual' ? (
                <>
                  {/* Individual Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <select
                        {...register('nationality', { required: 'Nationality is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select nationality</option>
                        {masterData.countries.map(country => (
                          <option key={country.id} value={country.country}>
                            {country.country} ({country.riskLevel})
                          </option>
                        ))}
                      </select>
                      {errors.nationality && (
                        <p className="mt-1 text-sm text-red-600">{errors.nationality.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country of Residence</label>
                      <select
                        {...register('countryOfResidence', { required: 'Country of residence is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select country</option>
                        {masterData.countries.map(country => (
                          <option key={country.id} value={country.country}>
                            {country.country} ({country.riskLevel})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Geographical Status</label>
                    <select
                      {...register('geographicalStatus')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="resident_national">Resident - National</option>
                      <option value="resident_foreign">Resident - Foreign National</option>
                      <option value="non_resident_national">Non-Resident - National</option>
                      <option value="non_resident_foreign">Non-Resident - Foreign National</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                    <select
                      {...register('employmentType')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select employment type</option>
                      {masterData.employmentTypes.map(employment => (
                        <option key={employment.id} value={employment.occupation}>
                          {employment.occupation} ({employment.riskLevel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPEP"
                      {...register('isPEP')}
                      className="mr-3"
                    />
                    <label htmlFor="isPEP" className="text-sm font-medium text-gray-700">
                      Politically Exposed Person (PEP) - Results in Auto High Risk
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Entity Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nature of Business <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('natureOfBusiness', { required: 'Nature of business is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select business type</option>
                        {masterData.businessTypes.map(business => (
                          <option key={business.id} value={business.business}>
                            {business.business} ({business.riskLevel})
                          </option>
                        ))}
                      </select>
                      {errors.natureOfBusiness && (
                        <p className="mt-1 text-sm text-red-600">{errors.natureOfBusiness.message as string}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country of Registration <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('countryOfRegistration', { required: 'Country of registration is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select country</option>
                        {masterData.countries.map(country => (
                          <option key={country.id} value={country.country}>
                            {country.country} ({country.riskLevel})
                          </option>
                        ))}
                      </select>
                      {errors.countryOfRegistration && (
                        <p className="mt-1 text-sm text-red-600">{errors.countryOfRegistration.message as string}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="entityPEP"
                      {...register('entityPEP')}
                      className="mr-3"
                    />
                    <label htmlFor="entityPEP" className="text-sm font-medium text-gray-700">
                      Entity is Politically Exposed (PEP) - Results in Auto High Risk
                    </label>
                  </div>

                  <MultiSelect
                    label="Expected Countries of Trade (Entity Specific)"
                    options={countryOptions}
                    value={watchedValues.expectedCountriesOfTrade || []}
                    onChange={(value) => setValue('expectedCountriesOfTrade', value)}
                    placeholder="Select countries where entity will conduct business..."
                  />
                </>
              )}

              {/* Common Fields for Both Types */}
              <MultiSelect
                label="Expected Countries (General Transactions)"
                options={countryOptions}
                value={watchedValues.expectedCountries || []}
                onChange={(value) => setValue('expectedCountries', value)}
                placeholder="Select countries for general transactions..."
              />

              <MultiSelect
                label="Product Usage (Multiple Selection)"
                options={productOptions}
                value={watchedValues.productUsage || []}
                onChange={(value) => setValue('productUsage', value)}
                placeholder="Select products/services..."
              />

              <div className="flex space-x-4">
                <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  Create {submissionType === 'individual' ? 'Individual' : 'Entity'} Assessment
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Risk Preview Sidebar - ENHANCED */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold mb-4">
              🎯 Risk Preview - {submissionType === 'individual' ? '👤 Individual' : '🏢 Entity'}
            </h3>
            
            {previewLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-sm text-gray-600">Calculating {submissionType} risk...</div>
              </div>
            ) : riskPreview ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {riskPreview.score}
                  </div>
                  <Badge 
                    variant={
                      riskPreview.finalRisk === 'Low' ? 'success' :
                      riskPreview.finalRisk === 'Medium' ? 'warning' :
                      riskPreview.finalRisk === 'High' ? 'danger' :
                      'purple'
                    }
                  >
                    {riskPreview.finalRisk === 'NoGo' ? '🚫' : 
                     riskPreview.finalRisk === 'AutoHigh' ? '🟣' :
                     riskPreview.finalRisk === 'High' ? '🔴' :
                     riskPreview.finalRisk === 'Medium' ? '🟡' : '🟢'} 
                    {riskPreview.finalRisk} Risk
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {riskPreview.reasons.slice(0, 5).map((reason, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {reason}
                      </div>
                    ))}
                    {riskPreview.reasons.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        ... and {riskPreview.reasons.length - 5} more factors
                      </div>
                    )}
                  </div>
                </div>

                {riskPreview.stopReasons && riskPreview.stopReasons.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-md">
                    <h4 className="font-medium text-sm text-red-800 mb-1">⚠️ Stop Conditions:</h4>
                    {riskPreview.stopReasons.map((reason, index) => (
                      <div key={index} className="text-xs text-red-700">
                        • {reason}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Method: {riskPreview.calculationMethod.replace('_', ' ')}
                  <br />
                  Parameters: {riskPreview.parameterScores?.length || 0} evaluated
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <div className="text-sm">
                  {submissionType === 'individual' 
                    ? 'Fill out nationality or residence to see risk preview' 
                    : 'Fill out business nature or registration country to see risk preview'
                  }
                </div>
              </div>
            )}
          </Card>

          {/* Quick Info Card */}
          <Card className="mt-4">
            <h4 className="font-medium text-sm mb-2">
              {submissionType === 'individual' ? '👤 Individual Assessment' : '🏢 Entity Assessment'}
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {submissionType === 'individual' ? (
                <>
                  <div>• Nationality & residence risk</div>
                  <div>• Employment classification</div>
                  <div>• PEP status verification</div>
                  <div>• Geographic risk assessment</div>
                </>
              ) : (
                <>
                  <div>• Business nature classification</div>
                  <div>• Registration jurisdiction risk</div>
                  <div>• Entity PEP status</div>
                  <div>• Trade countries assessment</div>
                </>
              )}
              <div>• Product usage analysis</div>
              <div>• Transaction countries review</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};