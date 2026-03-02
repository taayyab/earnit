import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Briefcase, Coffee, Shuffle, Check, Phone, Video, MessageSquare, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';

const ENGAGEMENT_STYLES = {
  formal: {
    icon: Briefcase,
    label: 'Focused & Formal',
    description: 'Professional communication, structured meetings with clear agendas',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  informal: {
    icon: Coffee,
    label: 'Informal & Laid Back',
    description: 'Casual conversation, flexible meetings, peer-to-peer connection',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  flexible: {
    icon: Shuffle,
    label: 'Open & Flexible',
    description: 'Adaptable approach, let the advocate adjust to your needs',
    color: 'bg-blue-50 text-[#1B3A5F] border-blue-200'
  }
};

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'in_person', label: 'In Person', icon: Users }
];

const CONTACT_TIMES = [
  { value: 'morning', label: 'Morning (8am - 12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { value: 'evening', label: 'Evening (5pm - 8pm)' },
  { value: 'flexible', label: 'Flexible / No Preference' }
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every Two Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as_needed', label: 'As Needed' }
];

export default function EngagementPreferences({ onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    engagement_style: 'flexible',
    preferred_contact_methods: [],
    preferred_times: [],
    preferred_frequency: 'weekly',
    communication_notes: ''
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.get('/engagement-preferences');
      if (response.data.preferences) {
        const prefs = response.data.preferences;
        setPreferences({
          engagement_style: prefs.engagement_style || 'flexible',
          preferred_contact_methods: prefs.contact_preferences?.preferred_methods || [],
          preferred_times: prefs.contact_preferences?.preferred_times || [],
          preferred_frequency: prefs.contact_preferences?.preferred_frequency || 'weekly',
          communication_notes: prefs.communication_notes || ''
        });
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleSelect = (style) => {
    setPreferences({ ...preferences, engagement_style: style });
  };

  const toggleContactMethod = (method) => {
    const methods = preferences.preferred_contact_methods;
    const updated = methods.includes(method)
      ? methods.filter(m => m !== method)
      : [...methods, method];
    setPreferences({ ...preferences, preferred_contact_methods: updated });
  };

  const toggleTime = (time) => {
    const times = preferences.preferred_times;
    const updated = times.includes(time)
      ? times.filter(t => t !== time)
      : [...times, time];
    setPreferences({ ...preferences, preferred_times: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/engagement-preferences', preferences);
      toast.success('Preferences saved!');
      if (onSaved) onSaved(preferences);
    } catch (err) {
      toast.error('Failed to save preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication Style</CardTitle>
          <CardDescription>
            Choose how you'd like your advocate to communicate with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(ENGAGEMENT_STYLES).map(([key, style]) => {
            const Icon = style.icon;
            const isSelected = preferences.engagement_style === key;
            
            return (
              <button
                key={key}
                onClick={() => handleStyleSelect(key)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  isSelected 
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 ring-2 ring-[hsl(var(--primary))]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-[hsl(var(--primary))]/10' : 'bg-white'}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-[hsl(var(--primary))]' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{style.label}</p>
                      {isSelected && <Check className="h-4 w-4 text-[hsl(var(--primary))]" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Preferences</CardTitle>
          <CardDescription>
            How and when would you prefer to be contacted?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Preferred Contact Methods (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = preferences.preferred_contact_methods.includes(method.value);
                
                return (
                  <button
                    key={method.value}
                    onClick={() => toggleContactMethod(method.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                      isSelected 
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {method.label}
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Preferred Times (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {CONTACT_TIMES.map((time) => {
                const isSelected = preferences.preferred_times.includes(time.value);
                
                return (
                  <button
                    key={time.value}
                    onClick={() => toggleTime(time.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{time.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-[hsl(var(--primary))]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>How often would you like check-ins?</Label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((freq) => {
                const isSelected = preferences.preferred_frequency === freq.value;
                
                return (
                  <button
                    key={freq.value}
                    onClick={() => setPreferences({ ...preferences, preferred_frequency: freq.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{freq.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-[hsl(var(--primary))]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Anything else your advocate should know about your communication preferences?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I work night shifts so mornings are best. I prefer text for quick updates and calls for detailed discussions."
            value={preferences.communication_notes}
            onChange={(e) => setPreferences({ ...preferences, communication_notes: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}

export function EngagementStyleBadge({ style }) {
  if (!style || !ENGAGEMENT_STYLES[style]) return null;
  
  const styleInfo = ENGAGEMENT_STYLES[style];
  const Icon = styleInfo.icon;
  
  return (
    <Badge className={`${styleInfo.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {styleInfo.label}
    </Badge>
  );
}
