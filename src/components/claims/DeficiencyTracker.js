import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileX,
  RefreshCw,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'destructive',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'secondary',
  },
};

const STAGE_LABELS = {
  1: 'Document Completeness',
  2: 'Evidence Mapping',
  3: 'Rating Criteria Alignment',
  4: 'Nexus Validation',
  5: 'Compliance Check',
};

function DeficiencyTracker({ claimId, onRequestEvidence }) {
  const [deficiencies, setDeficiencies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvedItems, setResolvedItems] = useState(new Set());

  const fetchDeficiencies = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/evidence/deficiencies/${claimId}`);
      setDeficiencies(response.data.deficiencies || []);
      setSummary(response.data.summary || {});
    } catch (error) {
      console.error('Failed to fetch deficiencies:', error);
      toast.error('Failed to load deficiencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) {
      fetchDeficiencies();
    }
  }, [claimId]);

  const toggleResolved = (deficiencyId) => {
    setResolvedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deficiencyId)) {
        newSet.delete(deficiencyId);
      } else {
        newSet.add(deficiencyId);
      }
      return newSet;
    });
  };

  const groupedByStage = deficiencies.reduce((acc, def) => {
    const stage = def.stage || 0;
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(def);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading deficiencies...</p>
        </CardContent>
      </Card>
    );
  }

  const activeDeficiencies = deficiencies.filter(d => !resolvedItems.has(d.id));
  const resolvedDeficiencies = deficiencies.filter(d => resolvedItems.has(d.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileX className="h-5 w-5" />
              Deficiency Tracker
            </CardTitle>
            <CardDescription>
              Actionable items from QA that need to be addressed
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDeficiencies}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-xs text-muted-foreground">Total Issues</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{summary.critical}</div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{summary.warning}</div>
              <div className="text-xs text-yellow-600">Warnings</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{resolvedItems.size}</div>
              <div className="text-xs text-green-600">Resolved</div>
            </div>
          </div>
        )}

        {deficiencies.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold text-green-700">No Deficiencies Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All QA checks passed. The claim is ready for review.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Accordion type="multiple" defaultValue={Object.keys(groupedByStage)} className="space-y-2">
              {Object.entries(groupedByStage)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([stage, items]) => (
                  <AccordionItem key={stage} value={stage} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Stage {stage}</Badge>
                        <span className="font-medium">
                          {STAGE_LABELS[stage] || `Stage ${stage} Issues`}
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          {items.filter(i => !resolvedItems.has(i.id)).length} active
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {items.map((def) => {
                          const config = SEVERITY_CONFIG[def.severity] || SEVERITY_CONFIG.warning;
                          const Icon = config.icon;
                          const isResolved = resolvedItems.has(def.id);
                          
                          return (
                            <div
                              key={def.id}
                              className={`p-3 rounded-lg border ${isResolved ? 'bg-gray-50 border-gray-200 opacity-60' : config.bg + ' ' + config.border}`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isResolved}
                                  onCheckedChange={() => toggleResolved(def.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`h-4 w-4 flex-shrink-0 ${isResolved ? 'text-gray-400' : config.color}`} />
                                    <span className={`font-medium text-sm ${isResolved ? 'line-through text-gray-400' : ''}`}>
                                      {def.name}
                                    </span>
                                    <Badge variant={isResolved ? 'outline' : config.badge} className="text-xs">
                                      {def.severity}
                                    </Badge>
                                  </div>
                                  <p className={`text-sm ${isResolved ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                    {def.message}
                                  </p>
                                  {def.action_required && !isResolved && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <ChevronRight className="h-3 w-3 text-primary" />
                                      <span className="text-xs font-medium text-primary">
                                        {def.action_required}
                                      </span>
                                      {def.details?.document_type && onRequestEvidence && (
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="h-auto p-0 text-xs"
                                          onClick={() => onRequestEvidence(def.details)}
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          Request
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>

            {resolvedDeficiencies.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  {resolvedDeficiencies.length} item(s) marked as resolved locally
                </p>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default DeficiencyTracker;
