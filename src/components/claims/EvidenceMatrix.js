import React, { useState, useEffect } from 'react';
import api, { evidenceAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  FileText,
  Heart,
  Link,
  Users,
  ClipboardList,
  Image,
  Stethoscope,
  User,
  File,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Tag,
  Zap,
  ChevronRight,
  Info,
  Shield,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import EvidenceVerificationBadge, { VerificationSummaryCard, QualityScoreBar } from './EvidenceVerificationBadge';

const ICON_MAP = {
  FileText: FileText,
  Heart: Heart,
  Link: Link,
  Users: Users,
  ClipboardList: ClipboardList,
  Image: Image,
  Stethoscope: Stethoscope,
  User: User,
  File: File,
};

const SUPPORT_COLORS = {
  full: 'bg-green-100 border-green-500 text-green-700',
  partial: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  none: 'bg-red-100 border-red-500 text-red-700',
};

function EvidenceMatrix({ claimId, onRefresh }) {
  const [matrix, setMatrix] = useState(null);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [taggingDoc, setTaggingDoc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [verification, setVerification] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/evidence/matrix/${claimId}`);
      setMatrix(response.data.matrix);
      setCategories(response.data.document_categories || {});
    } catch (error) {
      console.error('Failed to fetch evidence matrix:', error);
      toast.error('Failed to load evidence matrix');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerification = async () => {
    try {
      setVerificationLoading(true);
      const response = await evidenceAPI.getContentVerification(claimId);
      setVerification(response.data);
      setShowVerification(true);
    } catch (error) {
      console.error('Failed to fetch content verification:', error);
      toast.error('Failed to load content verification');
    } finally {
      setVerificationLoading(false);
    }
  };

  const getDocumentVerification = (documentId) => {
    if (!verification?.documents) return null;
    const docVerification = verification.documents.find(d => d.document_id === documentId);
    return docVerification?.verification || null;
  };

  useEffect(() => {
    if (claimId) {
      fetchMatrix();
    }
  }, [claimId]);

  const handleRunGapAnalysis = async () => {
    try {
      setRunningAnalysis(true);
      const response = await api.post(`/api/evidence/gap-analysis/${claimId}`);
      setGapAnalysis(response.data);
      toast.success('Gap analysis complete');
    } catch (error) {
      console.error('Gap analysis failed:', error);
      toast.error('Failed to run gap analysis');
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleTagDocument = async (documentId) => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    try {
      await api.post(`/api/evidence/tag/${documentId}`, {
        category: selectedCategory,
      });
      toast.success('Document tagged successfully');
      setTaggingDoc(null);
      setSelectedCategory('');
      fetchMatrix();
    } catch (error) {
      console.error('Failed to tag document:', error);
      toast.error('Failed to tag document');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading evidence matrix...</p>
        </CardContent>
      </Card>
    );
  }

  if (!matrix) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500" />
          <p className="mt-2 text-muted-foreground">Unable to load evidence matrix</p>
          <Button onClick={fetchMatrix} variant="outline" className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidence Matrix
              </CardTitle>
              <CardDescription>
                Condition-to-evidence mapping showing what's needed vs uploaded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMatrix}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchVerification}
                disabled={verificationLoading}
              >
                <Shield className={`h-4 w-4 mr-1 ${verificationLoading ? 'animate-pulse' : ''}`} />
                {verificationLoading ? 'Verifying...' : 'Verify Content'}
              </Button>
              <Button
                size="sm"
                onClick={handleRunGapAnalysis}
                disabled={runningAnalysis}
              >
                <Zap className={`h-4 w-4 mr-1 ${runningAnalysis ? 'animate-pulse' : ''}`} />
                {runningAnalysis ? 'Analyzing...' : 'Run Gap Analysis'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{matrix.summary?.total_conditions || 0}</div>
              <div className="text-xs text-muted-foreground">Total Conditions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{matrix.summary?.fully_supported || 0}</div>
              <div className="text-xs text-green-600">Fully Supported</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{matrix.summary?.partially_supported || 0}</div>
              <div className="text-xs text-yellow-600">Partially Supported</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{matrix.summary?.unsupported || 0}</div>
              <div className="text-xs text-red-600">Need Evidence</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Evidence Coverage</span>
              <span className="text-sm font-bold">{matrix.summary?.overall_coverage || 0}%</span>
            </div>
            <Progress value={matrix.summary?.overall_coverage || 0} className="h-2" />
          </div>

          {showVerification && verification?.summary && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Content Verification Summary
              </h4>
              <VerificationSummaryCard summary={verification.summary} />
              {verification.summary.average_quality_score > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground mb-1">Average Document Quality</div>
                  <QualityScoreBar score={verification.summary.average_quality_score} />
                </div>
              )}
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {(!matrix.conditions || matrix.conditions.length === 0) && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-3 text-muted-foreground">No conditions added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add conditions to this claim to see the evidence matrix
                  </p>
                </div>
              )}
              {(matrix.conditions || []).map((condition, idx) => (
                <Card key={idx} className={`border-l-4 ${SUPPORT_COLORS[condition.support_level]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{condition.name}</h4>
                        {condition.va_code && (
                          <span className="text-xs text-muted-foreground">
                            VA Code: {condition.va_code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={condition.support_level === 'full' ? 'default' : condition.support_level === 'partial' ? 'secondary' : 'destructive'}>
                          {condition.coverage_percentage}% Coverage
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {(condition.evidence_status || []).map((ev, evIdx) => {
                        const IconComponent = ICON_MAP[categories[ev.type]?.icon] || File;
                        const docId = ev.documents?.[0]?.id;
                        const docVerification = docId ? getDocumentVerification(docId) : null;
                        return (
                          <TooltipProvider key={evIdx}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`p-2 rounded border flex items-center gap-2 text-xs ${
                                  ev.present 
                                    ? 'bg-green-50 border-green-200 text-green-700' 
                                    : ev.required 
                                      ? 'bg-red-50 border-red-200 text-red-700'
                                      : 'bg-gray-50 border-gray-200 text-gray-500'
                                }`}>
                                  <IconComponent className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{ev.label.split(' ')[0]}</span>
                                  <div className="flex items-center gap-1 ml-auto">
                                    {docVerification && showVerification && (
                                      <EvidenceVerificationBadge verification={docVerification} compact />
                                    )}
                                    {ev.present ? (
                                      <Check className="h-3 w-3 flex-shrink-0" />
                                    ) : (
                                      <X className="h-3 w-3 flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-semibold">{ev.label}</div>
                                  {ev.present ? (
                                    <>
                                      <div className="text-green-600">{ev.document_count} document(s) available</div>
                                      {docVerification && (
                                        <div className="mt-1 pt-1 border-t">
                                          <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            <span>Quality: {docVerification.overall_score || 0}%</span>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-red-600">
                                      {ev.required ? 'Required - Missing' : 'Optional - Not uploaded'}
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {gapAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Gap Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered recommendations for strengthening your claim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-2 bg-muted rounded">
                <div className="text-lg font-bold">{gapAnalysis.summary.conditions_with_gaps}</div>
                <div className="text-xs text-muted-foreground">Conditions with Gaps</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-700">{gapAnalysis.summary.critical_gaps}</div>
                <div className="text-xs text-red-600">Critical Gaps</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-700">{gapAnalysis.summary.overall_readiness}%</div>
                <div className="text-xs text-green-600">Overall Readiness</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-700">{gapAnalysis.recommendations.length}</div>
                <div className="text-xs text-blue-600">Recommendations</div>
              </div>
            </div>

            {gapAnalysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Top Recommendations</h4>
                {gapAnalysis.recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {rec.priority}
                    </Badge>
                    <div>
                      <div className="font-medium">{rec.action}</div>
                      <div className="text-xs text-muted-foreground">{rec.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showVerification && verification?.documents?.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Document Content Analysis
                </h4>
                <div className="space-y-2">
                  {verification.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{doc.filename}</span>
                        <Badge variant="outline" className="text-[10px]">{doc.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <QualityScoreBar score={doc.verification?.overall_score || 0} />
                        <EvidenceVerificationBadge verification={doc.verification} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={!!taggingDoc} onOpenChange={() => setTaggingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTaggingDoc(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleTagDocument(taggingDoc)}>
                <Tag className="h-4 w-4 mr-1" />
                Save Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EvidenceMatrix;
