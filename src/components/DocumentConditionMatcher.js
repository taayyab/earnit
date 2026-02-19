import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Plus,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import api from '../lib/api';

const DocumentConditionMatcher = ({ documentId, claimId, filename, onMatchingComplete }) => {
  const [matches, setMatches] = useState([]);
  const [availableConditions, setAvailableConditions] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [autoMatchLoading, setAutoMatchLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConditionToAdd, setSelectedConditionToAdd] = useState('');
  const [addingCondition, setAddingCondition] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/${documentId}/condition-matches`);
      setMatches(response.data.matches || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load condition matches');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const fetchAvailableConditions = useCallback(async () => {
    try {
      const response = await api.get(`/documents/${documentId}/available-conditions`, {
        params: { claim_id: claimId }
      });
      setAvailableConditions(response.data.available_conditions || []);
    } catch (err) {
      console.error('Error fetching available conditions:', err);
    }
  }, [documentId, claimId]);

  useEffect(() => {
    if (documentId) {
      fetchMatches();
      fetchAvailableConditions();
    }
  }, [documentId, fetchMatches, fetchAvailableConditions]);

  const handleAutoMatch = async () => {
    try {
      setAutoMatchLoading(true);
      setError(null);
      await api.post(`/documents/${documentId}/auto-match`, {
        claim_id: claimId
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchMatches();
      await fetchAvailableConditions();
    } catch (err) {
      console.error('Error triggering auto-match:', err);
      setError('Failed to run auto-matching. Please try again.');
    } finally {
      setAutoMatchLoading(false);
    }
  };

  const handleVerifyMatch = async (mappingId, verified) => {
    try {
      setVerifyLoading(true);
      await api.post(`/documents/${documentId}/verify-match`, {
        mapping_id: mappingId,
        verified
      });
      await fetchMatches();
      await fetchAvailableConditions();
    } catch (err) {
      console.error('Error verifying match:', err);
      setError('Failed to verify match');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleBulkVerify = async (verified) => {
    if (selectedMatches.size === 0) return;
    
    try {
      setVerifyLoading(true);
      await api.post(`/documents/${documentId}/bulk-verify`, {
        mapping_ids: Array.from(selectedMatches),
        verified
      });
      setSelectedMatches(new Set());
      await fetchMatches();
      await fetchAvailableConditions();
      if (onMatchingComplete) {
        onMatchingComplete();
      }
    } catch (err) {
      console.error('Error bulk verifying:', err);
      setError('Failed to verify matches');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyAll = async () => {
    const unverifiedMatches = matches.filter(m => !m.verified && !m.rejected);
    if (unverifiedMatches.length === 0) return;
    
    try {
      setVerifyLoading(true);
      await api.post(`/documents/${documentId}/bulk-verify`, {
        mapping_ids: unverifiedMatches.map(m => m.mapping_id),
        verified: true
      });
      await fetchMatches();
      await fetchAvailableConditions();
      if (onMatchingComplete) {
        onMatchingComplete();
      }
    } catch (err) {
      console.error('Error verifying all:', err);
      setError('Failed to verify all matches');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleAddCondition = async () => {
    if (!selectedConditionToAdd) return;
    
    try {
      setAddingCondition(true);
      await api.post(`/documents/${documentId}/add-condition`, {
        condition_id: selectedConditionToAdd
      });
      setSelectedConditionToAdd('');
      await fetchMatches();
      await fetchAvailableConditions();
    } catch (err) {
      console.error('Error adding condition:', err);
      setError('Failed to add condition');
    } finally {
      setAddingCondition(false);
    }
  };

  const handleRemoveMapping = async (mappingId) => {
    try {
      await api.delete(`/documents/${documentId}/condition/${mappingId}`);
      await fetchMatches();
      await fetchAvailableConditions();
    } catch (err) {
      console.error('Error removing mapping:', err);
      setError('Failed to remove condition mapping');
    }
  };

  const toggleMatchSelection = (mappingId) => {
    const newSelected = new Set(selectedMatches);
    if (newSelected.has(mappingId)) {
      newSelected.delete(mappingId);
    } else {
      newSelected.add(mappingId);
    }
    setSelectedMatches(newSelected);
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  const pendingMatches = matches.filter(m => !m.verified && !m.rejected);
  const verifiedMatches = matches.filter(m => m.verified);
  const rejectedMatches = matches.filter(m => m.rejected);

  if (!documentId) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading condition matches...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Condition Matching
            </CardTitle>
            <CardDescription>
              {filename && <span className="font-medium">{filename}</span>}
              <br />
              Link this document to the conditions it supports
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoMatch}
            disabled={autoMatchLoading}
          >
            {autoMatchLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-analyze
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {pendingMatches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">AI-Suggested Matches</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkVerify(true)}
                  disabled={selectedMatches.size === 0 || verifyLoading}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Verify Selected ({selectedMatches.size})
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerifyAll}
                  disabled={verifyLoading}
                >
                  {verifyLoading ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  )}
                  Confirm All
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {pendingMatches.map((match) => (
                <div
                  key={match.mapping_id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedMatches.has(match.mapping_id)}
                    onCheckedChange={() => toggleMatchSelection(match.mapping_id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{match.condition_name}</span>
                      {match.category && (
                        <Badge variant="secondary" className="text-xs">
                          {match.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {match.match_reason}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(match.confidence_score)}`} />
                      <span className="text-xs text-muted-foreground">
                        {getConfidenceLabel(match.confidence_score)} ({Math.round(match.confidence_score * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={match.confidence_score * 100} 
                      className="w-16 h-2"
                    />
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() => handleVerifyMatch(match.mapping_id, true)}
                      disabled={verifyLoading}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleVerifyMatch(match.mapping_id, false)}
                      disabled={verifyLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {verifiedMatches.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-green-700">Verified Matches</h3>
            <div className="space-y-2">
              {verifiedMatches.map((match) => (
                <div
                  key={match.mapping_id}
                  className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{match.condition_name}</span>
                      {match.category && (
                        <Badge variant="secondary" className="text-xs">
                          {match.category}
                        </Badge>
                      )}
                    </div>
                    {match.match_reason && (
                      <p className="text-sm text-muted-foreground">{match.match_reason}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {match.match_source === 'user_added' ? 'Manually Added' : 'Verified'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                    onClick={() => handleRemoveMapping(match.mapping_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {rejectedMatches.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Rejected Matches</h3>
            <div className="space-y-2">
              {rejectedMatches.map((match) => (
                <div
                  key={match.mapping_id}
                  className="flex items-center gap-3 p-3 border border-gray-200 bg-gray-50 rounded-lg opacity-60"
                >
                  <XCircle className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="font-medium text-muted-foreground">{match.condition_name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                    onClick={() => handleVerifyMatch(match.mapping_id, true)}
                  >
                    Undo
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && !autoMatchLoading && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No condition matches found yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleAutoMatch}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Run AI Analysis
            </Button>
          </div>
        )}

        {availableConditions.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Add Condition Manually</h3>
            <div className="flex gap-2">
              <Select
                value={selectedConditionToAdd}
                onValueChange={setSelectedConditionToAdd}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a condition to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableConditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      <div className="flex items-center gap-2">
                        <span>{condition.condition_name}</span>
                        {condition.category && (
                          <span className="text-xs text-muted-foreground">
                            ({condition.category})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddCondition}
                disabled={!selectedConditionToAdd || addingCondition}
              >
                {addingCondition ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentConditionMatcher;
