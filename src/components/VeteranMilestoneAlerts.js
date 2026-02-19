import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import {
  TrendingUp,
  FileText,
  Calendar,
  CheckCircle,
  MessageSquare,
  Eye,
  Clock,
  Activity,
  RefreshCw
} from 'lucide-react';

const getEventIcon = (type) => {
  switch (type) {
    case 'claim_progress':
      return TrendingUp;
    case 'document':
      return FileText;
    case 'meeting':
      return Calendar;
    case 'qa_improvement':
      return CheckCircle;
    default:
      return Activity;
  }
};

const getEventColor = (type) => {
  switch (type) {
    case 'claim_progress':
      return { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' };
    case 'document':
      return { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' };
    case 'meeting':
      return { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' };
    case 'qa_improvement':
      return { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700' };
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getEventTypeLabel = (type) => {
  switch (type) {
    case 'claim_progress':
      return 'Claim Progress';
    case 'document':
      return 'Document';
    case 'meeting':
      return 'Meeting';
    case 'qa_improvement':
      return 'QA Score';
    default:
      return 'Activity';
  }
};

export default function VeteranMilestoneAlerts({ maxItems = 8, showHeader = true, compact = false }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const res = await api.get('/peer-support/veteran-milestones');
      setMilestones(res.data.milestones || []);
    } catch (error) {
      console.error('Failed to load veteran milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMilestones();
    setRefreshing(false);
  };

  const handleViewClaim = (claimId) => {
    if (claimId) {
      window.location.href = `/claims/${claimId}`;
    }
  };

  const handleSendMessage = (veteranId, veteranName) => {
    window.location.href = `/messages?veteran=${veteranId}&name=${encodeURIComponent(veteranName || '')}`;
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
        )}
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedMilestones = milestones.slice(0, maxItems);

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                Recent Veteran Activity
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time updates from your assigned veterans
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {displayedMilestones.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-slate-700">No recent activity</h4>
            <p className="text-xs text-muted-foreground mt-1">
              When your veterans make progress, you'll see updates here
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? 'h-[280px]' : 'h-[400px]'}>
            <div className="space-y-3">
              {displayedMilestones.map((milestone) => {
                const Icon = getEventIcon(milestone.type);
                const colors = getEventColor(milestone.type);

                return (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 truncate">
                          {milestone.title}
                        </h4>
                        <Badge variant="secondary" className={`text-xs ${colors.badge} flex-shrink-0`}>
                          {getEventTypeLabel(milestone.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {milestone.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(milestone.timestamp)}</span>
                        </div>
                        <div className="flex gap-1">
                          {milestone.claim_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleViewClaim(milestone.claim_id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleSendMessage(milestone.veteran_id, milestone.veteran_name)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        {milestones.length > maxItems && (
          <div className="mt-3 pt-3 border-t text-center">
            <Button
              variant="link"
              size="sm"
              className="text-emerald-600 hover:text-emerald-700"
              onClick={() => window.location.href = '/advocate/veterans'}
            >
              View all {milestones.length} updates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
