import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Bot,
  MessageSquare,
  Settings,
  Sparkles,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DrillConfigPanel() {
  const [config, setConfig] = useState(null);
  const [personaOptions, setPersonaOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [status, setStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadConfig();
    loadStatus();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/drill-config');
      if (response.data.success) {
        setConfig(response.data.config);
        setPersonaOptions(response.data.persona_options || {});
      }
    } catch (error) {
      console.error('Failed to load Drill config:', error);
      toast.error('Failed to load chatbot configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await api.get('/admin/drill-config/status');
      if (response.data.success) {
        setStatus(response.data.status);
      }
    } catch (error) {
      console.error('Failed to load Drill status:', error);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/admin/drill-config', config);
      if (response.data.success) {
        toast.success('Configuration saved successfully');
        setHasChanges(false);
        setConfig(response.data.config);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all settings to defaults? This cannot be undone.')) return;
    
    try {
      setSaving(true);
      const response = await api.post('/admin/drill-config/reset');
      if (response.data.success) {
        toast.success('Configuration reset to defaults');
        setConfig(response.data.config);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to reset config:', error);
      toast.error('Failed to reset configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const questions = [...(config.quick_questions || [])];
    questions[index] = { ...questions[index], [field]: value };
    handleConfigChange('quick_questions', questions);
  };

  const handleAddQuestion = () => {
    const questions = [...(config.quick_questions || [])];
    const newId = `custom_${Date.now()}`;
    questions.push({
      id: newId,
      question: 'New question',
      category: 'general',
      enabled: true,
      order: questions.length + 1
    });
    handleConfigChange('quick_questions', questions);
  };

  const handleRemoveQuestion = (index) => {
    const questions = (config.quick_questions || []).filter((_, i) => i !== index);
    handleConfigChange('quick_questions', questions);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load configuration</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Drill Chatbot Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Customize the AI assistant's behavior and responses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <Badge variant={status.api_configured ? 'default' : 'destructive'}>
              {status.api_configured ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> API Connected</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" /> API Not Configured</>
              )}
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="persona" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Persona
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Control chatbot availability and core features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Chatbot</p>
                  <p className="text-sm text-muted-foreground">Turn the Drill assistant on or off</p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Humor</p>
                  <p className="text-sm text-muted-foreground">Include military-style jokes and wit</p>
                </div>
                <Switch
                  checked={config.humor_enabled}
                  onCheckedChange={(checked) => handleConfigChange('humor_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable RAG</p>
                  <p className="text-sm text-muted-foreground">Use knowledge base for accurate responses</p>
                </div>
                <Switch
                  checked={config.rag_enabled}
                  onCheckedChange={(checked) => handleConfigChange('rag_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Show Citations</p>
                  <p className="text-sm text-muted-foreground">Display source references in responses</p>
                </div>
                <Switch
                  checked={config.citation_enabled}
                  onCheckedChange={(checked) => handleConfigChange('citation_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Settings</CardTitle>
              <CardDescription>Configure AI model parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Select
                    value={config.model}
                    onValueChange={(value) => handleConfigChange('model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Response Length</label>
                  <Select
                    value={config.response_length}
                    onValueChange={(value) => handleConfigChange('response_length', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature ({config.temperature})</label>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Lower = more focused, Higher = more creative</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Tokens</label>
                  <Input
                    type="number"
                    min="100"
                    max="2000"
                    value={config.max_tokens}
                    onChange={(e) => handleConfigChange('max_tokens', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="persona" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Persona Settings</CardTitle>
              <CardDescription>Customize the chatbot's personality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={config.persona_name}
                    onChange={(e) => handleConfigChange('persona_name', e.target.value)}
                    placeholder="DRILL"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={config.persona_title}
                    onChange={(e) => handleConfigChange('persona_title', e.target.value)}
                    placeholder="VA Claims Advisor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Personality Tone</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(personaOptions).map(([key, option]) => (
                    <div
                      key={key}
                      onClick={() => handleConfigChange('persona_tone', key)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        config.persona_tone === key
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <p className="font-medium">{option.name}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {option.phrases?.slice(0, 3).map((phrase, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Persona Additions</label>
                <textarea
                  value={config.custom_persona_additions || ''}
                  onChange={(e) => handleConfigChange('custom_persona_additions', e.target.value)}
                  placeholder="Add custom instructions for the chatbot persona..."
                  className="w-full min-h-[100px] p-3 border rounded-lg resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Extra instructions appended to the system prompt
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Greeting Messages</CardTitle>
              <CardDescription>Customize how Drill greets users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New User Greeting</label>
                <textarea
                  value={config.greeting_new_user || ''}
                  onChange={(e) => handleConfigChange('greeting_new_user', e.target.value)}
                  className="w-full min-h-[80px] p-3 border rounded-lg resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Returning User Greeting</label>
                <textarea
                  value={config.greeting_returning_user || ''}
                  onChange={(e) => handleConfigChange('greeting_returning_user', e.target.value)}
                  className="w-full min-h-[80px] p-3 border rounded-lg resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Messages</CardTitle>
              <CardDescription>Customize error response messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Offline Message</label>
                <Input
                  value={config.offline_message || ''}
                  onChange={(e) => handleConfigChange('offline_message', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rate Limit Message</label>
                <Input
                  value={config.rate_limit_message || ''}
                  onChange={(e) => handleConfigChange('rate_limit_message', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">General Error Message</label>
                <Input
                  value={config.error_message || ''}
                  onChange={(e) => handleConfigChange('error_message', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Questions</CardTitle>
                  <CardDescription>Manage suggested questions for users</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(config.quick_questions || []).map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    
                    <Switch
                      checked={question.enabled}
                      onCheckedChange={(checked) => handleQuestionChange(index, 'enabled', checked)}
                    />
                    
                    <Input
                      value={question.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      className="flex-1"
                    />
                    
                    <Select
                      value={question.category}
                      onValueChange={(value) => handleQuestionChange(index, 'category', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evidence">Evidence</SelectItem>
                        <SelectItem value="ratings">Ratings</SelectItem>
                        <SelectItem value="conditions">Conditions</SelectItem>
                        <SelectItem value="process">Process</SelectItem>
                        <SelectItem value="appeals">Appeals</SelectItem>
                        <SelectItem value="workflow">Workflow</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {(!config.quick_questions || config.quick_questions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No quick questions configured. Click "Add Question" to create one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <span>You have unsaved changes</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Now'}
          </Button>
        </div>
      )}
    </div>
  );
}
