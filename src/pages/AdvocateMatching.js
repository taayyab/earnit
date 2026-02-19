import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import api from '../lib/api';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Users, Star, Award, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvocateMatching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      // First check if veteran has preferences
      try {
        await api.get('/vet-advocate/matching-preferences');
      } catch (prefsError) {
      }
      
      // Then load matches (preferences will be used for scoring on backend)
      const res = await api.get('/vet-advocate/available-advocates');
      setMatches(res.data.advocates || []);
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
    
    try {
      const res = await api.post(`/vet-advocate/request-connection/${selectedAdvocate.id}`, {
        reason: connectionMessage || 'Seeking veteran advocate support for VA claims'
      });
      
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
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#D4A574] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Finding your perfect advocate match...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="advocate-matching-page">
      <PageHeader 
        title="Meet Your Veteran Advocates"
        subtitle="Fellow veterans ready to support your journey"
        showBackButton={true}
        backTo="/dashboard"
        showHomeButton={true}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
                        {supporter.first_name}
                      </h3>
                      <Badge className="bg-gradient-to-r from-[#D4A574] to-[#B8895E] text-white">
                        {supporter.match_score || 0}% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{supporter.default_tier?.replace('_', ' ')}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{supporter.average_rating || 'New'}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-[#8B9D83]" />
                        <span>{supporter.total_veterans_helped || 0} veterans helped</span>
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
                    {supporter.service_branch && <Badge variant="outline">{supporter.service_branch}</Badge>}
                    {supporter.service_era && <Badge variant="outline">{supporter.service_era}</Badge>}
                  </div>
                </div>
                {supporter.specializations && supporter.specializations.length > 0 && (
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
            <DialogTitle>Connect with {selectedAdvocate?.first_name}?</DialogTitle>
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
  );
}
