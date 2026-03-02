import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Shield,
  Calendar,
  Percent,
  Tag,
  FileText,
  X,
  Settings
} from 'lucide-react';

const PRICE_TYPES = [
  { id: 'fixed', name: 'Fixed Price', description: 'One-time flat fee' },
  { id: 'hourly', name: 'Hourly Rate', description: 'Billed per hour' },
  { id: 'per_condition', name: 'Per Condition', description: 'Price varies by condition' }
];

const COMMON_CONDITIONS = [
  'PTSD',
  'Anxiety',
  'Depression',
  'TBI',
  'Hearing Loss',
  'Tinnitus',
  'Back Pain',
  'Knee Conditions',
  'Shoulder Conditions',
  'Sleep Apnea',
  'Migraines',
  'Hypertension',
  'Diabetes',
  'Heart Conditions',
  'Respiratory Conditions',
  'Skin Conditions',
  'Eye Conditions',
  'Other'
];

export default function ProviderServices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    service_type_id: '',
    price: '',
    price_type: 'fixed',
    description: '',
    typical_turnaround_days: '',
    conditions_supported: [],
    accepts_va_community_care: false,
    va_contracted_rate: '',
    veteran_discount_percent: '0',
    max_per_week: '',
    is_available: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadServices();
    loadServiceTypes();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/providers/services');
      setServices(response.data.services || []);
    } catch (err) {
      console.error('Failed to load services:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadServiceTypes = async () => {
    setLoadingServiceTypes(true);
    try {
      const response = await api.get('/providers/service-types');
      setServiceTypes(response.data.services || []);
    } catch (err) {
      console.error('Failed to load service types:', err);
      setServiceTypes([
        { id: 'general_exam', name: 'General Physical Exam', category: 'Primary Care' },
        { id: 'mental_health', name: 'Mental Health Evaluation', category: 'Mental Health' },
        { id: 'ptsd_eval', name: 'PTSD Evaluation', category: 'Mental Health' },
        { id: 'orthopedic', name: 'Orthopedic Consultation', category: 'Specialty' },
        { id: 'audiology', name: 'Audiology Exam', category: 'Specialty' },
        { id: 'cardiology', name: 'Cardiology Consultation', category: 'Specialty' },
        { id: 'dbq_completion', name: 'DBQ Form Completion', category: 'Documentation' },
        { id: 'nexus_letter', name: 'Nexus Letter', category: 'Documentation' },
        { id: 'ime', name: 'Independent Medical Examination', category: 'Examination' },
        { id: 'c_and_p', name: 'C&P Exam Support', category: 'Examination' }
      ]);
    } finally {
      setLoadingServiceTypes(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_type_id: '',
      price: '',
      price_type: 'fixed',
      description: '',
      typical_turnaround_days: '',
      conditions_supported: [],
      accepts_va_community_care: false,
      va_contracted_rate: '',
      veteran_discount_percent: '0',
      max_per_week: '',
      is_available: true
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setFormData({
      service_type_id: service.service_type_id || '',
      price: service.price?.toString() || '',
      price_type: service.price_type || 'fixed',
      description: service.description || '',
      typical_turnaround_days: service.typical_turnaround_days?.toString() || '',
      conditions_supported: service.conditions_supported || [],
      accepts_va_community_care: service.accepts_va_community_care || false,
      va_contracted_rate: service.va_contracted_rate?.toString() || '',
      veteran_discount_percent: service.veteran_discount_percent?.toString() || '0',
      max_per_week: service.max_per_week?.toString() || '',
      is_available: service.is_available !== false
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConditionToggle = (condition) => {
    setFormData(prev => {
      const current = prev.conditions_supported;
      const updated = current.includes(condition)
        ? current.filter(c => c !== condition)
        : [...current, condition];
      return { ...prev, conditions_supported: updated };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.service_type_id) {
      errors.service_type_id = 'Please select a service type';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Please enter a valid price';
    }
    if (!formData.price_type) {
      errors.price_type = 'Please select a price type';
    }
    if (formData.accepts_va_community_care && !formData.va_contracted_rate) {
      errors.va_contracted_rate = 'VA contracted rate is required when accepting VA Community Care';
    }
    if (formData.veteran_discount_percent && (parseFloat(formData.veteran_discount_percent) < 0 || parseFloat(formData.veteran_discount_percent) > 100)) {
      errors.veteran_discount_percent = 'Discount must be between 0 and 100';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddService = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        service_type_id: formData.service_type_id,
        price: parseFloat(formData.price),
        price_type: formData.price_type,
        description: formData.description || null,
        typical_turnaround_days: formData.typical_turnaround_days ? parseInt(formData.typical_turnaround_days) : null,
        conditions_supported: formData.conditions_supported.length > 0 ? formData.conditions_supported : null,
        accepts_va_community_care: formData.accepts_va_community_care,
        va_contracted_rate: formData.va_contracted_rate ? parseFloat(formData.va_contracted_rate) : null,
        veteran_discount_percent: parseFloat(formData.veteran_discount_percent) || 0,
        max_per_week: formData.max_per_week ? parseInt(formData.max_per_week) : null
      };
      
      await api.post('/providers/services', payload);
      toast.success('Service offering added successfully');
      setShowAddModal(false);
      resetForm();
      loadServices();
    } catch (err) {
      console.error('Failed to add service:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to add service offering';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateService = async () => {
    if (!validateForm()) return;
    if (!selectedService) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        price: parseFloat(formData.price),
        price_type: formData.price_type,
        description: formData.description || null,
        typical_turnaround_days: formData.typical_turnaround_days ? parseInt(formData.typical_turnaround_days) : null,
        conditions_supported: formData.conditions_supported.length > 0 ? formData.conditions_supported : null,
        accepts_va_community_care: formData.accepts_va_community_care,
        va_contracted_rate: formData.va_contracted_rate ? parseFloat(formData.va_contracted_rate) : null,
        veteran_discount_percent: parseFloat(formData.veteran_discount_percent) || 0,
        max_per_week: formData.max_per_week ? parseInt(formData.max_per_week) : null,
        is_available: formData.is_available
      };
      
      await api.put(`/providers/services/${selectedService.id}`, payload);
      toast.success('Service offering updated successfully');
      setShowEditModal(false);
      setSelectedService(null);
      resetForm();
      loadServices();
    } catch (err) {
      console.error('Failed to update service:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to update service offering';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(`/providers/services/${selectedService.id}`);
      toast.success('Service offering removed successfully');
      setShowDeleteModal(false);
      setSelectedService(null);
      loadServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to remove service offering';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceTypeName = (serviceTypeId) => {
    const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
    return serviceType?.name || serviceTypeId;
  };

  const getServiceTypeCategory = (serviceTypeId) => {
    const serviceType = serviceTypes.find(st => st.id === serviceTypeId);
    return serviceType?.category || 'Other';
  };

  const formatPrice = (price, priceType) => {
    if (!price) return 'N/A';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
    
    switch (priceType) {
      case 'hourly':
        return `${formatted}/hr`;
      case 'per_condition':
        return `${formatted}/condition`;
      default:
        return formatted;
    }
  };

  const renderServiceForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="service_type">Service Type *</Label>
        <Select
          value={formData.service_type_id}
          onValueChange={(value) => handleInputChange('service_type_id', value)}
          disabled={showEditModal}
        >
          <SelectTrigger className={formErrors.service_type_id ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a service type" />
          </SelectTrigger>
          <SelectContent>
            {loadingServiceTypes ? (
              <div className="p-2 text-center text-slate-500">Loading...</div>
            ) : (
              serviceTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <span className="flex items-center gap-2">
                    <span>{type.name}</span>
                    <Badge variant="outline" className="text-xs">{type.category}</Badge>
                  </span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {formErrors.service_type_id && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {formErrors.service_type_id}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
              className={`pl-9 ${formErrors.price ? 'border-red-500' : ''}`}
            />
          </div>
          {formErrors.price && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {formErrors.price}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="price_type">Price Type *</Label>
          <Select
            value={formData.price_type}
            onValueChange={(value) => handleInputChange('price_type', value)}
          >
            <SelectTrigger className={formErrors.price_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select price type" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div>
                    <span>{type.name}</span>
                    <p className="text-xs text-slate-500">{type.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.price_type && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {formErrors.price_type}
            </p>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1B3A5F]" />
            <Label className="font-medium text-blue-900">VA Community Care Eligible</Label>
          </div>
          <Switch
            checked={formData.accepts_va_community_care}
            onCheckedChange={(checked) => handleInputChange('accepts_va_community_care', checked)}
          />
        </div>
        
        {formData.accepts_va_community_care && (
          <div>
            <Label htmlFor="va_contracted_rate">VA Contracted Rate *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="va_contracted_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.va_contracted_rate}
                onChange={(e) => handleInputChange('va_contracted_rate', e.target.value)}
                placeholder="VA contracted rate"
                className={`pl-9 ${formErrors.va_contracted_rate ? 'border-red-500' : ''}`}
              />
            </div>
            {formErrors.va_contracted_rate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {formErrors.va_contracted_rate}
              </p>
            )}
            <p className="text-xs text-[#1B3A5F] mt-1">
              Rate negotiated with the VA for Community Care services
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="veteran_discount_percent">Veteran Discount (%)</Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="veteran_discount_percent"
              type="number"
              min="0"
              max="100"
              value={formData.veteran_discount_percent}
              onChange={(e) => handleInputChange('veteran_discount_percent', e.target.value)}
              placeholder="0"
              className={`pl-9 ${formErrors.veteran_discount_percent ? 'border-red-500' : ''}`}
            />
          </div>
          {formErrors.veteran_discount_percent && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {formErrors.veteran_discount_percent}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="typical_turnaround_days">Typical Turnaround (Days)</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="typical_turnaround_days"
              type="number"
              min="1"
              value={formData.typical_turnaround_days}
              onChange={(e) => handleInputChange('typical_turnaround_days', e.target.value)}
              placeholder="e.g., 5"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="max_per_week">Maximum Per Week</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="max_per_week"
            type="number"
            min="1"
            value={formData.max_per_week}
            onChange={(e) => handleInputChange('max_per_week', e.target.value)}
            placeholder="Leave empty for unlimited"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Maximum number of this service type you can perform per week
        </p>
      </div>

      <div>
        <Label>Conditions Supported</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => handleConditionToggle(condition)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                formData.conditions_supported.includes(condition)
                  ? 'bg-[#1B3A5F] text-white border-[#1B3A5F]'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#1B3A5F]'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe what this service includes, any special requirements, etc."
          rows={3}
        />
      </div>

      {showEditModal && (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Label className="font-medium">Service Active</Label>
            <p className="text-xs text-slate-500">Toggle to enable/disable this service</p>
          </div>
          <Switch
            checked={formData.is_available}
            onCheckedChange={(checked) => handleInputChange('is_available', checked)}
          />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1B3A5F] mx-auto mb-4" />
          <p className="text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 mb-4">{error}</p>
          <Button onClick={loadServices} className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1B3A5F] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/provider/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Service Offerings</h1>
                <p className="text-blue-100 mt-1">
                  Manage the services you provide to veterans
                </p>
              </div>
            </div>
            <Button 
              className="bg-white text-[#1B3A5F] hover:bg-blue-50"
              onClick={openAddModal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Services Added</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                You haven't added any service offerings yet. Add services to let veterans know 
                what you can provide and at what price.
              </p>
              <Button 
                className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
                onClick={openAddModal}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id} className={!service.is_available ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {getServiceTypeName(service.service_type_id)}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {getServiceTypeCategory(service.service_type_id)}
                        </Badge>
                        {!service.is_available && (
                          <Badge className="bg-slate-100 text-slate-600">
                            Inactive
                          </Badge>
                        )}
                        {service.accepts_va_community_care && (
                          <Badge className="bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            VA Community Care
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">
                            {formatPrice(service.price, service.price_type)}
                          </span>
                          <span className="text-xs text-slate-400 capitalize">
                            ({service.price_type?.replace('_', ' ')})
                          </span>
                        </div>
                        
                        {service.va_contracted_rate && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span>VA Rate: {formatPrice(service.va_contracted_rate, 'fixed')}</span>
                          </div>
                        )}
                        
                        {service.typical_turnaround_days && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{service.typical_turnaround_days} day turnaround</span>
                          </div>
                        )}
                        
                        {service.veteran_discount_percent > 0 && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Percent className="w-4 h-4 text-amber-500" />
                            <span>{service.veteran_discount_percent}% veteran discount</span>
                          </div>
                        )}
                        
                        {service.max_per_week && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Max {service.max_per_week}/week</span>
                          </div>
                        )}
                      </div>
                      
                      {service.conditions_supported?.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1">
                            {service.conditions_supported.slice(0, 5).map((condition) => (
                              <Badge 
                                key={condition} 
                                variant="secondary"
                                className="text-xs"
                              >
                                {condition}
                              </Badge>
                            ))}
                            {service.conditions_supported.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{service.conditions_supported.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {service.description && (
                        <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(service)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDeleteModal(service)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#1B3A5F] mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Tips for Service Pricing</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Research market rates for similar services in your area</li>
                <li>• Consider offering veteran discounts to attract more patients</li>
                <li>• If accepting VA Community Care, ensure your contracted rate is competitive</li>
                <li>• Set realistic turnaround times to manage patient expectations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1B3A5F]" />
              Add Service Offering
            </DialogTitle>
            <DialogDescription>
              Add a new service that you offer to veterans. This will be visible in search results.
            </DialogDescription>
          </DialogHeader>
          
          {renderServiceForm()}
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
              onClick={handleAddService}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#1B3A5F]" />
              Edit Service Offering
            </DialogTitle>
            <DialogDescription>
              Update the details of your service offering.
            </DialogDescription>
          </DialogHeader>
          
          {renderServiceForm()}
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedService(null);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
              onClick={handleUpdateService}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Remove Service Offering
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this service offering? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="p-4 bg-slate-50 rounded-lg my-4">
              <p className="font-medium text-slate-900">
                {getServiceTypeName(selectedService.service_type_id)}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {formatPrice(selectedService.price, selectedService.price_type)}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedService(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
