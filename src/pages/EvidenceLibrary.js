import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VeteranLayout from '../components/VeteranLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  FileText,
  Upload,
  Search,
  Tag,
  Link2,
  ChevronRight,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileSearch,
  Folder,
  Eye,
  Filter,
  ArrowUpDown,
  Sparkles,
  Download,
  Wand2,
  Loader2,
  Archive,
  ExternalLink,
  ChevronDown,
  Info,
  Pill,
  Activity,
  Scale
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const LARGE_FILE_WARNING_SIZE = 5 * 1024 * 1024; // 5MB

const DOCUMENT_CATEGORIES = {
  'DD214': { label: 'DD-214', color: 'bg-blue-100 text-blue-700', icon: FileText },
  'MEDICAL_RECORDS': { label: 'Medical Records', color: 'bg-green-100 text-green-700', icon: FileText },
  'NEXUS_LETTER': { label: 'Nexus Letter', color: 'bg-blue-50 text-[#1B3A5F]', icon: FileText },
  'SERVICE_TREATMENT_RECORDS': { label: 'Service Treatment Records', color: 'bg-amber-100 text-amber-700', icon: FileText },
  'BUDDY_STATEMENT': { label: 'Buddy Statement', color: 'bg-pink-100 text-pink-700', icon: FileText },
  'DBQ': { label: 'DBQ', color: 'bg-teal-100 text-teal-700', icon: FileText },
  'PERSONAL_STATEMENT': { label: 'Personal Statement', color: 'bg-orange-100 text-orange-700', icon: FileText },
  'OTHER': { label: 'Other', color: 'bg-slate-100 text-slate-700', icon: FileText }
};

const RETENTION_POLICIES = {
  'DD214': { label: 'Permanent', years: null, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'MILITARY_RECORDS': { label: 'Permanent', years: null, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'SERVICE_TREATMENT_RECORDS': { label: 'Permanent', years: null, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'NEXUS_LETTER': { label: '10 years', years: 10, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'DBQ': { label: '10 years', years: 10, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'BUDDY_STATEMENT': { label: '10 years', years: 10, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'MEDICAL_RECORDS': { label: '7 years', years: 7, color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'PRIVATE_MEDICAL_RECORDS': { label: '7 years', years: 7, color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'VA_MEDICAL_RECORDS': { label: '7 years', years: 7, color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'PERSONAL_STATEMENT': { label: '7 years', years: 7, color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'OTHER': { label: '7 years', years: 7, color: 'bg-slate-50 text-slate-600 border-slate-200' }
};

const getRetentionInfo = (doc) => {
  const category = doc.category?.toUpperCase() || 'OTHER';
  const policy = RETENTION_POLICIES[category] || RETENTION_POLICIES.OTHER;
  
  if (!policy.years) {
    return { ...policy, isExpiring: false, daysRemaining: null };
  }
  
  const uploadDate = new Date(doc.uploaded_at);
  const expirationDate = new Date(uploadDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + policy.years);
  
  const now = new Date();
  const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
  const isExpiring = daysRemaining <= 365 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;
  
  return { ...policy, isExpiring, isExpired, daysRemaining };
};

export default function EvidenceLibrary() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [linkingDocId, setLinkingDocId] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [autoLinkingAll, setAutoLinkingAll] = useState(false);
  const [acceptingSuggestions, setAcceptingSuggestions] = useState({});
  const [downloadingDoc, setDownloadingDoc] = useState({});
  const [showClaimSelector, setShowClaimSelector] = useState(false);
  const [selectedClaimForAutoLink, setSelectedClaimForAutoLink] = useState(null);
  const [autoLinkResults, setAutoLinkResults] = useState(null);
  const [medicationAnalysis, setMedicationAnalysis] = useState(null);
  const [medicationAnalysisLoading, setMedicationAnalysisLoading] = useState(false);
  const [showMedicationSection, setShowMedicationSection] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, conditionsRes, claimsRes] = await Promise.all([
        api.get('/documents/list'),
        api.get('/conditions/dashboard/summary').catch(() => ({ data: { success: false } })),
        api.get('/claims/list').catch(() => ({ data: { success: false, claims: [] } }))
      ]);

      const docs = docsRes.data.documents || [];
      setDocuments(docs);

      if (conditionsRes.data.success && conditionsRes.data.summary?.conditions) {
        setConditions(conditionsRes.data.summary.conditions);
      }

      const loadedClaims = claimsRes.data.claims || [];
      if (loadedClaims.length > 0) {
        setClaims(loadedClaims);
        const activeClaim = loadedClaims.find(c => c.status !== 'closed' && c.status !== 'denied');
        if (activeClaim) {
          loadMedicationAnalysis(activeClaim.id);
        }
      }
    } catch (error) {
      console.error('Failed to load evidence library:', error);
      toast.error('Failed to load your evidence library');
    } finally {
      setLoading(false);
    }
  };

  const loadMedicationAnalysis = async (claimId) => {
    if (!claimId) return;
    try {
      setMedicationAnalysisLoading(true);
      const response = await api.get(`/evidence/medications/${claimId}`);
      setMedicationAnalysis(response.data);
    } catch (error) {
      console.error('Failed to load medication analysis:', error);
    } finally {
      setMedicationAnalysisLoading(false);
    }
  };

  const runMedicationAnalysis = async () => {
    const activeClaim = claims.find(c => c.status !== 'closed' && c.status !== 'denied');
    if (!activeClaim) {
      toast.error('No active claim found');
      return;
    }
    try {
      setMedicationAnalysisLoading(true);
      const response = await api.post(`/evidence/medications/${activeClaim.id}/analyze`);
      if (response.data.success) {
        toast.success(`Analyzed ${response.data.medications_analyzed} medications. Found ${response.data.opportunities_found} secondary condition opportunities.`);
        loadMedicationAnalysis(activeClaim.id);
      } else {
        toast.info(response.data.message || 'No medications found to analyze');
      }
    } catch (error) {
      console.error('Failed to run medication analysis:', error);
      toast.error('Failed to analyze medications');
    } finally {
      setMedicationAnalysisLoading(false);
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getActiveClaims = useCallback(() => {
    return claims.filter(c => c.status !== 'closed' && c.status !== 'denied');
  }, [claims]);

  const initiateAutoLink = () => {
    const activeClaims = getActiveClaims();
    if (activeClaims.length === 0) {
      toast.error('No active claim found. Create a claim first.');
      return;
    }
    if (activeClaims.length === 1) {
      handleAutoLinkAll(activeClaims[0]);
    } else {
      setShowClaimSelector(true);
    }
  };

  const handleAutoLinkAll = async (claim) => {
    if (!claim) {
      toast.error('Please select a claim first.');
      return;
    }

    setShowClaimSelector(false);
    setSelectedClaimForAutoLink(claim);
    setAutoLinkResults(null);

    try {
      setAutoLinkingAll(true);
      const response = await api.post(`/documents/claim/${claim.id}/auto-link-all`);
      const result = response.data;
      
      if (result.success) {
        const successCount = result.matches_created || 0;
        const failedCount = result.failed_documents?.length || 0;
        
        if (failedCount > 0 && successCount > 0) {
          toast.warning(`Linked ${successCount} documents. ${failedCount} documents could not be linked.`);
          setAutoLinkResults({ success: successCount, failed: failedCount, details: result.failed_documents });
        } else if (successCount > 0) {
          toast.success(`Successfully linked ${successCount} documents to conditions!`);
        } else {
          toast.info('No new document-condition matches found.');
        }
      } else {
        toast.error(result.message || 'Auto-linking failed. Please try again.');
      }
      
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      console.error('Failed to auto-link documents:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to start auto-linking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setAutoLinkingAll(false);
    }
  };

  const handleAcceptSuggestions = async (doc) => {
    const suggestedConditions = getSuggestedConditions(doc);
    if (suggestedConditions.length === 0) return;

    try {
      setAcceptingSuggestions(prev => ({ ...prev, [doc.id]: true }));
      await api.post('/documents/link-conditions', {
        document_id: doc.id,
        condition_ids: suggestedConditions.map(c => c.id)
      });
      toast.success('AI suggestions accepted! Conditions linked successfully.');
      loadData();
    } catch (error) {
      console.error('Failed to accept suggestions:', error);
      toast.error('Failed to link suggested conditions');
    } finally {
      setAcceptingSuggestions(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      if (doc.file_size > LARGE_FILE_WARNING_SIZE) {
        toast.info(`Large file (${(doc.file_size / (1024 * 1024)).toFixed(1)} MB). Download may take a moment.`);
      }
      setDownloadingDoc(prev => ({ ...prev, [doc.id]: true }));
      const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Failed to download document:', error);
      if (error.response?.status === 404) {
        toast.error('Document file not available for download');
      } else {
        toast.error('Failed to download document');
      }
    } finally {
      setDownloadingDoc(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handleViewDocument = async (doc) => {
    try {
      const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
      const contentType = response.headers['content-type'] || 'application/pdf';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to view document:', error);
      if (error.response?.status === 404) {
        toast.error('Document file not available');
      } else {
        toast.error('Failed to open document');
      }
    }
  };

  const handleLinkConditions = async (documentId) => {
    try {
      await api.post('/documents/link-conditions', {
        document_id: documentId,
        condition_ids: selectedConditions
      });
      toast.success('Conditions linked successfully');
      setLinkingDocId(null);
      setSelectedConditions([]);
      loadData();
    } catch (error) {
      console.error('Failed to link conditions:', error);
      toast.error('Failed to link conditions to document');
    }
  };

  const toggleConditionSelection = (conditionId) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const startLinking = (doc) => {
    setLinkingDocId(doc.id);
    setSelectedConditions(doc.linked_conditions || []);
  };

  const cancelLinking = () => {
    setLinkingDocId(null);
    setSelectedConditions([]);
  };

  const getSuggestedConditions = (doc) => {
    if (!doc.suggested_conditions) return [];
    return conditions.filter(c => 
      doc.suggested_conditions.includes(c.name) ||
      doc.suggested_conditions.includes(c.id)
    );
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = !searchTerm || 
        doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      }
      if (sortBy === 'name') {
        return (a.filename || '').localeCompare(b.filename || '');
      }
      if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });

  const getConditionProgress = () => {
    if (!conditions.length) return { total: 0, linked: 0, percentage: 0 };
    const linkedDocs = documents.filter(d => d.linked_conditions?.length > 0).length;
    return {
      total: documents.length,
      linked: linkedDocs,
      percentage: documents.length ? Math.round((linkedDocs / documents.length) * 100) : 0
    };
  };

  const docsWithSuggestions = documents.filter(d => 
    d.suggested_conditions?.length > 0 && (!d.linked_conditions || d.linked_conditions.length === 0)
  );

  const progress = getConditionProgress();

  if (loading) {
    return (
      <VeteranLayout>
        <div className="min-h-full bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                </div>
                <Skeleton className="h-12 w-52 rounded-lg" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-56 rounded-md" />
                <Skeleton className="h-10 w-44 rounded-md" />
              </div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
      <div className="min-h-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] rounded-xl flex items-center justify-center">
                <Folder className="w-5 h-5 text-white" />
              </div>
              Evidence Library
            </h1>
            <p className="text-slate-600 mt-1">
              Organize and link your documents to claimed conditions
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {documents.length > 0 && claims.length > 0 && (
              <Button 
                onClick={initiateAutoLink}
                disabled={autoLinkingAll}
                aria-label="Auto-link all documents to conditions using AI"
                className="bg-gradient-to-r from-[#1B3A5F] to-indigo-600 hover:from-[#1B3A5F] hover:to-indigo-700 text-white shadow-md"
              >
                {autoLinkingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {autoLinkingAll ? 'Analyzing...' : 'Auto-Link All Documents'}
              </Button>
            )}
            <Button 
              onClick={() => navigate('/document-onboarding')}
              aria-label="Upload new documents"
              className="bg-[#1B3A5F] hover:bg-[#2C5282]"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </div>

        {showClaimSelector && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-[#1B3A5F] to-indigo-50 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#1B3A5F]" />
                  <h3 className="font-semibold text-slate-900">Select a Claim for Auto-Linking</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowClaimSelector(false)}
                  aria-label="Cancel claim selection"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Choose which claim's conditions to link your documents to:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {getActiveClaims().map((claim) => (
                  <div
                    key={claim.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleAutoLinkAll(claim)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAutoLinkAll(claim);
                      }
                    }}
                    className="p-4 rounded-lg border-2 border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <div className="font-medium text-slate-900 mb-1">
                      {claim.claim_type || claim.type || 'VA Claim'}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Created {new Date(claim.created_at).toLocaleDateString()}
                    </div>
                    {claim.status && (
                      <Badge className="mt-2 bg-blue-100 text-blue-700">
                        {claim.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {documents.length > 0 && (
          <Card className="mb-8 border-2 border-[#1B3A5F]/10 bg-gradient-to-br from-slate-50 to-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1B3A5F]/10 rounded-lg flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-[#1B3A5F]" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Condition Linking Progress</span>
                    <span className="text-sm text-slate-600">
                      {progress.linked} of {progress.total} documents linked
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#1B3A5F]">{progress.percentage}%</span>
                </div>
              </div>
              <Progress value={progress.percentage} className="h-3" />
              <p className="text-sm text-slate-500 mt-3">
                Link your documents to conditions to strengthen your claim and show complete evidence coverage.
              </p>
            </CardContent>
          </Card>
        )}

        {claims.length > 0 && showMedicationSection && (
          <Card className="mb-8 border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Pill className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Medication-to-Impairment Analysis</CardTitle>
                    <p className="text-sm text-slate-600">Secondary conditions supported by your medications (38 CFR §3.310)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={runMedicationAnalysis}
                    disabled={medicationAnalysisLoading}
                    className="border-teal-300 hover:bg-teal-50"
                  >
                    {medicationAnalysisLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 mr-1" />
                    )}
                    {medicationAnalysisLoading ? 'Analyzing...' : 'Re-analyze'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowMedicationSection(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {medicationAnalysisLoading && !medicationAnalysis ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
                  <p className="text-slate-600">Analyzing your medications...</p>
                </div>
              ) : medicationAnalysis && medicationAnalysis.medications?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-teal-100/50 px-3 py-2 rounded-lg">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-medium text-teal-800">
                        {medicationAnalysis.medications.length} Medication{medicationAnalysis.medications.length !== 1 ? 's' : ''} Analyzed
                      </span>
                    </div>
                    {medicationAnalysis.high_priority_count > 0 && (
                      <div className="flex items-center gap-2 bg-red-100/50 px-3 py-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          {medicationAnalysis.high_priority_count} High-Priority Opportunit{medicationAnalysis.high_priority_count !== 1 ? 'ies' : 'y'}
                        </span>
                      </div>
                    )}
                    {medicationAnalysis.total_opportunities > 0 && (
                      <div className="flex items-center gap-2 bg-amber-100/50 px-3 py-2 rounded-lg">
                        <Scale className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          {medicationAnalysis.total_opportunities} Secondary Condition{medicationAnalysis.total_opportunities !== 1 ? 's' : ''} Possible
                        </span>
                      </div>
                    )}
                  </div>

                  {medicationAnalysis.secondary_condition_opportunities?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Potential Secondary Conditions
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {medicationAnalysis.secondary_condition_opportunities.slice(0, 6).map((opp, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-slate-900">{opp.condition}</span>
                              <Badge className={`text-xs ${getRiskBadgeColor(opp.risk_level)}`}>
                                {opp.risk_level}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">
                              From: <span className="font-medium text-slate-700">{opp.source_medication}</span>
                            </p>
                            {opp.rationale && (
                              <p className="text-xs text-slate-600 line-clamp-2">{opp.rationale}</p>
                            )}
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <span className="text-xs text-teal-600 font-medium">{opp.cfr_reference}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {medicationAnalysis.secondary_condition_opportunities.length > 6 && (
                        <p className="text-sm text-slate-500 mt-3 text-center">
                          +{medicationAnalysis.secondary_condition_opportunities.length - 6} more opportunities
                        </p>
                      )}
                    </div>
                  )}

                  {medicationAnalysis.next_steps?.length > 0 && (
                    <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <h4 className="font-medium text-teal-800 mb-2 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        Next Steps
                      </h4>
                      <ul className="space-y-1">
                        {medicationAnalysis.next_steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-teal-700 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-medium text-slate-700 mb-1">No Medication Analysis Available</h4>
                  <p className="text-sm text-slate-500 mb-4">
                    Upload medical records containing your medication information to identify secondary condition opportunities.
                  </p>
                  <Button
                    size="sm"
                    onClick={runMedicationAnalysis}
                    disabled={medicationAnalysisLoading}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Analyze Medications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search documents"
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Categories</option>
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200">
            <CardContent className="py-12 text-center">
              <FileSearch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {documents.length === 0 ? 'No Documents Yet' : 'No Matching Documents'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {documents.length === 0 
                  ? 'Upload your military and medical documents to build your evidence library. Each document can be linked to multiple conditions.'
                  : 'Try adjusting your search or category filter to find documents.'}
              </p>
              {documents.length === 0 && (
                <Button onClick={() => navigate('/document-onboarding')}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => {
              const category = DOCUMENT_CATEGORIES[doc.category] || DOCUMENT_CATEGORIES.OTHER;
              const linkedConditions = doc.linked_conditions || [];
              const suggestedConditions = getSuggestedConditions(doc);
              const isLinking = linkingDocId === doc.id;
              const retentionInfo = getRetentionInfo(doc);
              const hasSuggestionsNotLinked = suggestedConditions.length > 0 && linkedConditions.length === 0;

              return (
                <Card 
                  key={doc.id} 
                  className={`border-2 transition-all ${isLinking ? 'border-[#1B3A5F] shadow-lg' : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${category.color.split(' ')[0]}`}>
                        <FileText className={`w-7 h-7 ${category.color.split(' ')[1]}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 text-lg truncate">
                            {doc.filename}
                          </h3>
                          <Badge className={category.color}>
                            {category.label}
                          </Badge>
                          {doc.processing_status === 'completed' && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Processed
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                          {doc.file_size && (
                            <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                          )}
                          <Badge variant="outline" className={`text-xs ${retentionInfo.color}`}>
                            <Archive className="w-3 h-3 mr-1" />
                            Retained: {retentionInfo.label}
                          </Badge>
                          {retentionInfo.isExpiring && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Expires in {Math.ceil(retentionInfo.daysRemaining / 30)} months
                            </Badge>
                          )}
                        </div>

                        {!isLinking ? (
                          <>
                            {linkedConditions.length > 0 && (
                              <div className="mb-4">
                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                  <Link2 className="w-3 h-3" /> Linked to:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {linkedConditions.map((condId) => {
                                    const cond = conditions.find(c => c.id === condId || c.name === condId);
                                    return (
                                      <Badge key={condId} className="bg-[#1B3A5F] text-white">
                                        {cond?.name || condId}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {hasSuggestionsNotLinked && (
                              <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                  <div>
                                    <div className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                                      <Sparkles className="w-4 h-4" /> AI Suggested Conditions
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {suggestedConditions.map((cond) => (
                                        <Badge key={cond.id} variant="outline" className="border-amber-400 text-amber-700 bg-white">
                                          {cond.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptSuggestions(doc)}
                                    disabled={acceptingSuggestions[doc.id]}
                                    aria-label="Accept AI-suggested condition links"
                                    className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
                                  >
                                    {acceptingSuggestions[doc.id] ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                    )}
                                    Accept Suggestions
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                              <Tag className="w-4 h-4 text-[#1B3A5F]" />
                              Select conditions this document supports:
                            </div>
                            {conditions.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {conditions.map((cond) => (
                                  <button
                                    key={cond.id}
                                    onClick={() => toggleConditionSelection(cond.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleConditionSelection(cond.id);
                                      }
                                    }}
                                    aria-pressed={selectedConditions.includes(cond.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                      selectedConditions.includes(cond.id)
                                        ? 'bg-[#1B3A5F] text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    {selectedConditions.includes(cond.id) && (
                                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                    )}
                                    {cond.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-600 mb-4">
                                No conditions found. Add conditions to your claim first.
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleLinkConditions(doc.id)}
                                disabled={conditions.length === 0}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Save Links
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelLinking}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {!isLinking && (
                        <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(doc)}
                            aria-label="View document in new tab"
                            className="flex-1 lg:flex-none"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(doc)}
                            disabled={downloadingDoc[doc.id]}
                            aria-label="Download document"
                            className="flex-1 lg:flex-none"
                          >
                            {downloadingDoc[doc.id] ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-1" />
                            )}
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startLinking(doc)}
                            aria-label="Link this document to conditions"
                            className="flex-1 lg:flex-none"
                          >
                            <Link2 className="w-4 h-4 mr-1" />
                            {linkedConditions.length > 0 ? 'Edit Links' : 'Link'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {conditions.length > 0 && (
          <Card className="mt-8 border-2 border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#1B3A5F]" />
                Condition Evidence Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conditions.map((cond) => {
                  const linkedDocs = documents.filter(d => 
                    d.linked_conditions?.includes(cond.id) || 
                    d.linked_conditions?.includes(cond.name)
                  );
                  return (
                    <div 
                      key={cond.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-[#1B3A5F]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 text-sm">
                          {cond.name}
                        </h4>
                        <Badge className={linkedDocs.length > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                          {linkedDocs.length} doc{linkedDocs.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      {linkedDocs.length > 0 ? (
                        <div className="text-xs text-slate-500">
                          {linkedDocs.slice(0, 2).map(d => d.filename).join(', ')}
                          {linkedDocs.length > 2 && ` +${linkedDocs.length - 2} more`}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          No evidence linked yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </VeteranLayout>
  );
}
