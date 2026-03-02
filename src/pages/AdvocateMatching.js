import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { Users, Star, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import VeteranLayout from '../components/VeteranLayout';

export default function AdvocateMatching() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const normalizeAdvocate = (advocate) => ({
    ...advocate,
    displayName: advocate.first_name || advocate.firstName || advocate.name || 'Unknown Advocate',
    matchPercent: advocate.match_score || advocate.matchScore || null,
    tier: advocate.default_tier || advocate.tier || 'community_support',
    rating: advocate.average_rating || advocate.rating || null,
    veteransHelped: advocate.total_veterans_helped || advocate.reviewCount || 0,
    serviceBranch: advocate.service_branch || advocate.branch || null,
    serviceEra: advocate.service_era || advocate.era || null,
    specializations: advocate.specializations || advocate.specialties || [],
  });

  const loadMatches = async () => {
    try {
      setLoading(true);

      try {
        await api.get('/vet-advocate/matching-preferences');
      } catch {
      }

      try {
        const res = await api.get('/vet-advocate/available-advocates');
        setMatches((res.data.advocates || []).map(normalizeAdvocate));
      } catch {
        const res = await api.get('/advocates');
        setMatches((res.data.advocates || []).map(normalizeAdvocate));
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast.error('Failed to load veteran advocate matches');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectRequest = async () => {
    if (!selectedAdvocate?.id) {
      toast.error('Please select an advocate');
      return;
    }
    if (!currentUserId) {
      toast.error('Unable to identify your account. Please log in again.');
      return;
    }
    
    try {
      let res;
      try {
        res = await api.post(`/vet-advocate/request-connection/${selectedAdvocate.id}`, {
          reason: connectionMessage || 'Seeking veteran advocate support for VA claims'
        });
      } catch {
        res = await api.post('/advocates/assign', {
          veteranId: currentUserId,
          advocateId: selectedAdvocate.id,
          matchScore: selectedAdvocate.matchPercent,
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || 'Request sent! The advocate will be notified.');
        setShowConnectDialog(false);
        setConnectionMessage('');
        navigate('/dashboard');
      } else {
        toast.error(res.data.message || 'Failed to send request');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send connection request';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <VeteranLayout>
        <div className="min-h-full bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-9 w-96" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </VeteranLayout>
    );
  }

  return (
    <VeteranLayout>
      <div className="min-h-full bg-white" data-testid="advocate-matching-page">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Meet Your Veteran Advocates
          </h1>
          <p className="text-slate-600 mt-1">
            Fellow veterans ready to support your journey
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-8 bg-gradient-to-br from-[#E8C9A1]/20 to-[#B5C4AE]/20 border-[#D4A574]/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-[#D4A574]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">These advocates are matched based on your background</h3>
                <p className="text-sm text-muted-foreground">
                  Each has successfully navigated their own VA claims and is dedicated to helping fellow veterans.
                  Choose the advocate you feel most comfortable with for regular touchpoints.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advocate Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {matches.map((supporter) => (
            <Card
              key={supporter.id}
              className="hover:shadow-lg transition-all duration-300 border-2 hover:border-[#D4A574]/50"
              data-testid="advocate-card"
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 bg-[hsl(var(--primary))] text-white flex items-center justify-center border-4 border-white shadow-md">
                      <Users className="h-10 w-10" />
                    </Avatar>
                    {supporter.is_veteran && (
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[hsl(var(--success))] border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-bold text-foreground">
                        {supporter.displayName}
                      </h3>
                      {supporter.matchPercent ? (
                        <Badge className="bg-gradient-to-r from-[#D4A574] to-[#B8895E] text-white">
                          {supporter.matchPercent}% Match
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-[#D4A574] to-[#B8895E] text-white">
                          Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{supporter.tier?.replace('_', ' ')}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{supporter.rating || 'New'}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-[#8B9D83]" />
                        <span>{supporter.veteransHelped || 0} veterans helped</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {supporter.bio || 'Ready to help fellow veterans navigate the VA claims process.'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Service</p>
                  <div className="flex flex-wrap gap-2">
                    {supporter.serviceBranch && <Badge variant="outline">{supporter.serviceBranch}</Badge>}
                    {supporter.serviceEra && <Badge variant="outline">{supporter.serviceEra}</Badge>}
                  </div>
                </div>
                {supporter.specializations?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Experience With</p>
                    <div className="flex flex-wrap gap-2">
                      {supporter.specializations.slice(0, 4).map((specialization, i) => (
                        <Badge key={i} className="bg-[#B5C4AE]/30 text-[#6B7D63] border-[#8B9D83]/20">
                          {specialization}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setSelectedAdvocate(supporter);
                    setShowConnectDialog(true);
                  }}
                  className="w-full bg-gradient-to-r from-[#D4A574] to-[#C97B63] hover:from-[#B8895E] hover:to-[#A85F4A] text-white"
                  data-testid="connect-advocate-button"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Request to Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>

        {/* Connection Request Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect with {selectedAdvocate?.displayName}?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send a brief message to introduce yourself (optional):
              </p>
              <Textarea
                rows={4}
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Hi, I'm looking for support with my disability claim..."
                data-testid="connection-message-input"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConnectRequest}
                className="bg-[#D4A574] hover:bg-[#B8895E]"
                data-testid="send-connection-request-button"
              >
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </VeteranLayout>
  );
}
