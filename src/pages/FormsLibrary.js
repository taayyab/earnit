import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  FileText, 
  Download, 
  Search, 
  ExternalLink,
  Folder,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle2,
  BookOpen,
  Stethoscope,
  Shield,
  Users,
  FileCheck,
  ClipboardList,
  Brain,
  Heart,
  Eye,
  Ear,
  Activity,
  AlertCircle,
  Filter,
  Wand2,
  Sparkles
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  mental_health: Brain,
  musculoskeletal: Activity,
  audio: Ear,
  neurological: Brain,
  respiratory: Activity,
  cardiovascular: Heart,
  gastrointestinal: Activity,
  genitourinary: Activity,
  skin: Activity,
  endocrine: Activity,
  eyes: Eye,
  hematologic: Activity,
  infectious: Shield,
  dental: Activity,
  cancer: Activity,
  special: Shield
};

const CATEGORY_COLORS = {
  mental_health: 'bg-purple-600',
  musculoskeletal: 'bg-blue-600',
  audio: 'bg-amber-600',
  neurological: 'bg-indigo-600',
  respiratory: 'bg-cyan-600',
  cardiovascular: 'bg-red-600',
  gastrointestinal: 'bg-orange-600',
  genitourinary: 'bg-pink-600',
  skin: 'bg-rose-600',
  endocrine: 'bg-teal-600',
  eyes: 'bg-emerald-600',
  hematologic: 'bg-fuchsia-600',
  infectious: 'bg-lime-600',
  dental: 'bg-sky-600',
  cancer: 'bg-violet-600',
  special: 'bg-slate-600'
};

const VA_FORMS = [
  {
    category: 'Primary Claim Forms',
    icon: FileText,
    color: 'bg-[#1B3A5F]',
    forms: [
      {
        id: '21-526EZ',
        name: 'VA Form 21-526EZ',
        title: 'Application for Disability Compensation',
        description: 'The primary form for filing a VA disability claim. Required for all initial claims and increases.',
        url: 'https://www.va.gov/find-forms/about-form-21-526ez/',
        required: true,
        tips: [
          'List ALL conditions, even if you think they may not qualify',
          'Include the date each condition began or worsened',
          'Describe how each condition affects your daily life and work'
        ]
      },
      {
        id: '21-4138',
        name: 'VA Form 21-4138',
        title: 'Statement in Support of Claim',
        description: 'Use this form to provide additional details, clarifications, or personal statements about your claim.',
        url: 'https://www.va.gov/find-forms/about-form-21-4138/',
        required: false,
        tips: [
          'Describe specific incidents that caused or worsened your condition',
          'Include dates, locations, and names of witnesses if applicable',
          'Be specific about how conditions affect your daily activities'
        ]
      },
      {
        id: '21-0966',
        name: 'VA Form 21-0966',
        title: 'Intent to File',
        description: 'Preserves your effective date for up to one year while you gather evidence. File this first!',
        url: 'https://www.va.gov/find-forms/about-form-21-0966/',
        required: false,
        tips: [
          'Submit this form FIRST to lock in your effective date',
          'You have 1 year from filing to submit your full claim',
          'Can be submitted online, by mail, or in person'
        ]
      }
    ]
  },
  {
    category: 'Disability Benefits Questionnaires (DBQs)',
    icon: Stethoscope,
    color: 'bg-green-600',
    forms: [
      {
        id: 'DBQ-PTSD',
        name: 'DBQ - PTSD Review',
        title: 'Initial PTSD Review',
        description: 'Required for PTSD claims. Must be completed by a licensed mental health professional.',
        url: 'https://www.va.gov/find-forms/about-form-21-0960p-3/',
        required: true,
        tips: [
          'Can be completed by any licensed psychiatrist or psychologist',
          'VA C&P exams also use this format',
          'Private DBQs are accepted and can speed up your claim'
        ]
      },
      {
        id: 'DBQ-Back',
        name: 'DBQ - Back (Thoracolumbar Spine)',
        title: 'Back Conditions',
        description: 'For lower and mid-back conditions including degenerative disc disease, herniated discs, and strains.',
        url: 'https://www.va.gov/find-forms/about-form-21-0960m-14/',
        required: true,
        tips: [
          'Range of motion measurements are critical for rating',
          'Note if there is pain on motion or after repetitive use',
          'Document any radiculopathy (nerve involvement)'
        ]
      },
      {
        id: 'DBQ-Knee',
        name: 'DBQ - Knee and Lower Leg',
        title: 'Knee Conditions',
        description: 'For knee injuries, arthritis, instability, and range of motion limitations.',
        url: 'https://www.va.gov/find-forms/about-form-21-0960m-9/',
        required: true,
        tips: [
          'Bilateral conditions should be documented separately',
          'Include any instability or locking episodes',
          'Document use of assistive devices (brace, cane)'
        ]
      },
      {
        id: 'DBQ-Hearing',
        name: 'DBQ - Hearing Loss and Tinnitus',
        title: 'Hearing Conditions',
        description: 'For hearing loss and tinnitus claims. Requires audiometric testing.',
        url: 'https://www.va.gov/find-forms/about-form-21-0960n-1/',
        required: true,
        tips: [
          'Pure tone audiometry results are required',
          'Speech discrimination scores affect your rating',
          'Tinnitus is rated separately from hearing loss'
        ]
      },
      {
        id: 'DBQ-Mental',
        name: 'DBQ - Mental Disorders (Non-PTSD)',
        title: 'Mental Health Conditions',
        description: 'For depression, anxiety, bipolar disorder, and other mental health conditions.',
        url: 'https://www.va.gov/find-forms/about-form-21-0960p-2/',
        required: true,
        tips: [
          'Describe how symptoms affect work and social functioning',
          'Document frequency and duration of symptoms',
          'Include any hospitalizations or intensive treatment'
        ]
      },
      {
        id: 'DBQ-Sleep',
        name: 'DBQ - Sleep Apnea',
        title: 'Sleep Apnea',
        description: 'For obstructive sleep apnea claims. Requires sleep study results.',
        url: 'https://www.va.gov/find-forms/about-form-21-0960c-8/',
        required: true,
        tips: [
          'Sleep study (polysomnography) is required for diagnosis',
          'Document CPAP usage and compliance',
          'Higher ratings require CPAP or other breathing assistance'
        ]
      }
    ]
  },
  {
    category: 'Supporting Evidence Forms',
    icon: ClipboardList,
    color: 'bg-amber-600',
    forms: [
      {
        id: '21-4142',
        name: 'VA Form 21-4142',
        title: 'Authorization for Release of Information',
        description: 'Authorizes the VA to obtain your private medical records on your behalf.',
        url: 'https://www.va.gov/find-forms/about-form-21-4142/',
        required: false,
        tips: [
          'Complete one form per healthcare provider',
          'Include complete address and phone number',
          'Specify date ranges for records needed'
        ]
      },
      {
        id: '21-10210',
        name: 'VA Form 21-10210',
        title: 'Lay/Witness Statement',
        description: 'For statements from family, friends, or fellow service members supporting your claim.',
        url: 'https://www.va.gov/find-forms/about-form-21-10210/',
        required: false,
        tips: [
          'Witnesses should describe what they personally observed',
          'Include how your condition affects daily activities',
          'Statements from fellow service members are especially valuable'
        ]
      },
      {
        id: '21-0781',
        name: 'VA Form 21-0781',
        title: 'Statement in Support of Claim for PTSD',
        description: 'Required for PTSD claims to document stressor events during service.',
        url: 'https://www.va.gov/find-forms/about-form-21-0781/',
        required: true,
        tips: [
          'Be as specific as possible about dates and locations',
          'Include unit designations and names of others involved',
          'Combat veterans may have easier verification'
        ]
      },
      {
        id: '21-0781a',
        name: 'VA Form 21-0781a',
        title: 'Statement for PTSD Secondary to Personal Assault',
        description: 'For PTSD claims based on military sexual trauma (MST) or personal assault.',
        url: 'https://www.va.gov/find-forms/about-form-21-0781a/',
        required: true,
        tips: [
          'Alternative evidence (behavior changes, transfers) is accepted',
          'You do not need to have reported the assault at the time',
          'Counseling records and statements from confidants help'
        ]
      }
    ]
  },
  {
    category: 'Fully Developed Claim (FDC)',
    icon: FileCheck,
    color: 'bg-purple-600',
    forms: [
      {
        id: 'FDC-Checklist',
        name: 'FDC Checklist',
        title: 'Fully Developed Claim Checklist',
        description: 'Submitting a Fully Developed Claim can reduce processing time significantly.',
        url: 'https://www.va.gov/disability/how-to-file-claim/evidence-needed/fully-developed-claims/',
        required: false,
        tips: [
          'Include ALL evidence upfront - no additional submissions',
          'Private medical records, DBQs, and lay statements ready',
          'FDC claims average 30-60 days faster than standard claims'
        ],
        isGuide: true
      }
    ]
  },
  {
    category: 'Increase & Secondary Claims',
    icon: Shield,
    color: 'bg-red-600',
    forms: [
      {
        id: '21-526EZ-Increase',
        name: 'VA Form 21-526EZ (Increase)',
        title: 'Claim for Increase',
        description: 'Use the same 526EZ form but select "increase" for worsening conditions.',
        url: 'https://www.va.gov/find-forms/about-form-21-526ez/',
        required: true,
        tips: [
          'Document how your condition has worsened since last rating',
          'New DBQ showing current severity is essential',
          'Compare current symptoms to the rating criteria for higher levels'
        ]
      },
      {
        id: 'Secondary-Guide',
        name: 'Secondary Condition Guide',
        title: 'Filing Secondary Claims',
        description: 'Conditions caused or worsened by your service-connected disabilities.',
        url: 'https://www.va.gov/resources/how-to-file-a-va-disability-claim-for-a-condition-thats-secondary-to-a-service-connected-disability/',
        required: false,
        tips: [
          'Nexus letter from doctor explaining the connection is critical',
          'Common secondary conditions: depression from chronic pain, sleep issues',
          'Can increase combined rating significantly'
        ],
        isGuide: true
      }
    ]
  }
];

const EARNEDIT_TEMPLATES = [
  {
    id: 'nexus-template',
    name: 'Nexus Letter Template',
    title: 'Medical Nexus Letter Template',
    description: 'Template for doctors to establish service connection between your condition and military service.',
    type: 'template',
    tips: [
      'Have your treating physician customize and sign',
      'Must state "at least as likely as not" (50% or greater probability)',
      'Include specific reasoning linking condition to service'
    ]
  },
  {
    id: 'buddy-statement',
    name: 'Buddy Statement Template',
    title: 'Fellow Service Member Statement',
    description: 'Template for statements from people who served with you and witnessed your condition or injury.',
    type: 'template',
    tips: [
      'Fellow service members can corroborate in-service events',
      'Should describe what they personally witnessed',
      'Include their contact information and service dates'
    ]
  },
  {
    id: 'personal-statement',
    name: 'Personal Statement Template',
    title: 'Personal Statement Guide',
    description: 'How to write an effective personal statement describing your condition and its impact.',
    type: 'template',
    tips: [
      'Describe a typical day with your condition',
      'Be specific about limitations and symptoms',
      'Include how it affects work, family, and daily activities'
    ]
  },
  {
    id: 'evidence-checklist',
    name: 'Evidence Checklist',
    title: 'Complete Evidence Checklist',
    description: 'Comprehensive checklist of all evidence types that can support your claim.',
    type: 'checklist',
    tips: [
      'Service treatment records (STRs)',
      'VA medical records',
      'Private medical records and DBQs',
      'Nexus letters',
      'Lay statements (buddy statements, family)',
      'Photos, journals, or other documentation'
    ]
  }
];

export default function FormsLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('Primary Claim Forms');
  const [backendTemplates, setBackendTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [creatingInstance, setCreatingInstance] = useState(null);
  const [dbqCatalog, setDbqCatalog] = useState([]);
  const [dbqCategories, setDbqCategories] = useState([]);
  const [loadingDbqs, setLoadingDbqs] = useState(true);
  const [expandedDbqCategory, setExpandedDbqCategory] = useState(null);
  const [dbqSearchTerm, setDbqSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
    loadDbqCatalog();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.get('/templates/');
      if (response.data.success) {
        setBackendTemplates(response.data.templates || []);
      }
    } catch (err) {
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadDbqCatalog = async () => {
    try {
      const response = await api.get('/forms/dbqs');
      if (response.data.success) {
        setDbqCatalog(response.data.dbqs || []);
        setDbqCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load DBQ catalog:', err);
    } finally {
      setLoadingDbqs(false);
    }
  };

  const filteredDbqs = dbqCatalog.filter(dbq => {
    const matchesSearch = !dbqSearchTerm || 
      dbq.name?.toLowerCase().includes(dbqSearchTerm.toLowerCase()) ||
      dbq.short_name?.toLowerCase().includes(dbqSearchTerm.toLowerCase()) ||
      dbq.conditions_covered?.some(c => c.toLowerCase().includes(dbqSearchTerm.toLowerCase()));
    const matchesPriority = !selectedPriority || dbq.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const dbqsByCategory = filteredDbqs.reduce((acc, dbq) => {
    const cat = dbq.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(dbq);
    return acc;
  }, {});

  const getCategoryInfo = (categoryId) => {
    return dbqCategories.find(c => c.id === categoryId) || { name: categoryId, description: '' };
  };

  const handleCreateFromTemplate = async (templateId, templateName) => {
    try {
      setCreatingInstance(templateId);
      const response = await api.post('/templates/instances', {
        template_id: templateId,
        auto_populate: true
      });
      if (response.data.success) {
        toast.success(`Creating ${templateName}...`);
        navigate(`/template-editor/${response.data.instance.id}`);
      }
    } catch (err) {
      toast.error('Failed to create template');
    } finally {
      setCreatingInstance(null);
    }
  };

  const filteredForms = VA_FORMS.map(category => ({
    ...category,
    forms: category.forms.filter(form => 
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.forms.length > 0);

  const filteredTemplates = EARNEDIT_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#1B3A5F] rounded-xl flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">VA Forms Library</h1>
              <p className="text-slate-600">Official VA forms, DBQs, and EarnedIT templates</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search forms, DBQs, and templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg border-2 border-slate-200 focus:border-[#1B3A5F]"
          />
        </div>

        <Card className="mb-8 bg-gradient-to-r from-[#1B3A5F] to-[#2C5282] text-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">How to Use These Forms</h3>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>1. Start with VA Form 21-0966 (Intent to File) to lock in your effective date</li>
                  <li>2. Gather all medical evidence and DBQs for your conditions</li>
                  <li>3. Complete VA Form 21-526EZ with your conditions listed</li>
                  <li>4. Include supporting statements and documentation</li>
                  <li>5. Submit as a Fully Developed Claim (FDC) for faster processing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredForms.map((category, catIdx) => (
          <div key={catIdx} className="mb-6">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors mb-2"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">{category.category}</h3>
                  <p className="text-sm text-slate-600">{category.forms.length} forms</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                expandedCategory === category.category ? 'rotate-90' : ''
              }`} />
            </button>
            
            {expandedCategory === category.category && (
              <div className="space-y-3 pl-4">
                {category.forms.map((form, formIdx) => (
                  <Card key={formIdx} className="border-2 border-slate-100 hover:border-[#1B3A5F]/30 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{form.name}</h4>
                            {form.required && (
                              <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                            )}
                            {form.isGuide && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">Guide</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#1B3A5F]">{form.title}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(form.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3">{form.description}</p>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">Tips for Success</span>
                        </div>
                        <ul className="text-xs text-amber-700 space-y-1">
                          {form.tips.map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">-</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI-Powered Templates</h2>
              <p className="text-slate-600">Editable templates that auto-populate from your records</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {backendTemplates.length > 0 ? (
              backendTemplates
                .filter(t => 
                  t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((template, idx) => (
                <Card key={idx} className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{template.name}</h4>
                          <Badge className="bg-purple-100 text-purple-700 text-xs capitalize">
                            {template.category?.replace('_', ' ')}
                          </Badge>
                          {template.va_form_number && (
                            <Badge variant="outline" className="text-xs">
                              VA {template.va_form_number}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleCreateFromTemplate(template.id, template.name)}
                        disabled={creatingInstance === template.id}
                      >
                        {creatingInstance === template.id ? (
                          <>Loading...</>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-1" />
                            Create & Edit
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                    
                    {template.usage_tips && (
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <p className="text-xs text-purple-700">{template.usage_tips}</p>
                      </div>
                    )}
                    
                    {template.compliance_requirements?.length > 0 && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">VA Requirements</span>
                        </div>
                        <ul className="text-xs text-amber-700 space-y-1">
                          {template.compliance_requirements.slice(0, 3).map((req, reqIdx) => (
                            <li key={reqIdx} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">-</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : loadingTemplates ? (
              <div className="col-span-2 text-center py-8 text-slate-500">
                Loading templates...
              </div>
            ) : (
              filteredTemplates.map((template, idx) => (
                <Card key={idx} className="border-2 border-amber-100 hover:border-amber-300 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{template.name}</h4>
                          <Badge className="bg-amber-100 text-amber-700 text-xs capitalize">
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-amber-700">{template.title}</p>
                      </div>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                        <Download className="w-4 h-4 mr-1" />
                        Get
                      </Button>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                    
                    <div className="bg-slate-50 rounded-lg p-3">
                      <ul className="text-xs text-slate-600 space-y-1">
                        {template.tips.map((tip, tipIdx) => (
                          <li key={tipIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Complete DBQ Catalog</h2>
              <p className="text-slate-600">{dbqCatalog.length} Disability Benefits Questionnaires organized by body system</p>
            </div>
          </div>

          <Card className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">About Disability Benefits Questionnaires (DBQs)</h3>
                  <ul className="text-sm text-green-100 space-y-1">
                    <li>• DBQs are standardized medical forms that document your condition's severity</li>
                    <li>• Any licensed physician can complete a DBQ for your claim</li>
                    <li>• Private DBQs can speed up your claim by providing evidence upfront</li>
                    <li>• The VA uses DBQ information to determine your disability rating</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search DBQs by condition (e.g., PTSD, back pain, tinnitus)..."
                value={dbqSearchTerm}
                onChange={(e) => setDbqSearchTerm(e.target.value)}
                className="pl-10 h-11 border-2 border-slate-200 focus:border-green-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPriority === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPriority(selectedPriority === 1 ? null : 1)}
                className={selectedPriority === 1 ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Filter className="w-4 h-4 mr-1" />
                Most Common
              </Button>
            </div>
          </div>

          {loadingDbqs ? (
            <div className="text-center py-8 text-slate-500">
              Loading DBQ catalog...
            </div>
          ) : filteredDbqs.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No DBQs match your search.</p>
              <Button variant="link" onClick={() => { setDbqSearchTerm(''); setSelectedPriority(null); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(dbqsByCategory).map(([categoryId, categoryDbqs]) => {
                const categoryInfo = getCategoryInfo(categoryId);
                const CategoryIcon = CATEGORY_ICONS[categoryId] || Activity;
                const categoryColor = CATEGORY_COLORS[categoryId] || 'bg-slate-600';
                const isExpanded = expandedDbqCategory === categoryId;

                return (
                  <div key={categoryId} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedDbqCategory(isExpanded ? null : categoryId)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${categoryColor} rounded-lg flex items-center justify-center`}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-900">{categoryInfo.name}</h3>
                          <p className="text-sm text-slate-600">{categoryDbqs.length} DBQs</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white space-y-3">
                        {categoryDbqs.map((dbq) => (
                          <Card key={dbq.id} className="border-2 border-slate-100 hover:border-green-300 transition-colors">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-slate-900">{dbq.short_name || dbq.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {dbq.form_number}
                                    </Badge>
                                    {dbq.priority === 1 && (
                                      <Badge className="bg-green-100 text-green-700 text-xs">High Priority</Badge>
                                    )}
                                    {dbq.exam_frequency_percent > 5 && (
                                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                                        {dbq.exam_frequency_percent}% of exams
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-green-700">{dbq.name}</p>
                                </div>
                                <div className="flex gap-2 ml-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/dbq/${dbq.id}`)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Wand2 className="w-4 h-4 mr-1" />
                                    Auto-fill
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(dbq.url || dbq.pdf_url, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View Form
                                  </Button>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 mb-3">{dbq.description}</p>

                              {dbq.conditions_covered && dbq.conditions_covered.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-slate-500 mb-1">Conditions covered:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {dbq.conditions_covered.slice(0, 6).map((cond, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs bg-slate-100">
                                        {cond}
                                      </Badge>
                                    ))}
                                    {dbq.conditions_covered.length > 6 && (
                                      <Badge variant="secondary" className="text-xs bg-slate-100">
                                        +{dbq.conditions_covered.length - 6} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {dbq.common_rating_percentages && dbq.common_rating_percentages.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-slate-500 mb-1">Common ratings:</p>
                                  <div className="flex gap-1">
                                    {dbq.common_rating_percentages.map((pct, idx) => (
                                      <span key={idx} className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                        {pct}%
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {dbq.tips && dbq.tips.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-800">Tips for Success</span>
                                  </div>
                                  <ul className="text-xs text-amber-700 space-y-1">
                                    {dbq.tips.map((tip, tipIdx) => (
                                      <li key={tipIdx} className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">-</span>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Card className="mt-8 bg-slate-50 border-2 border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900 mb-2">Need Help With Your Claim?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Our AI can analyze your documents and tell you exactly which forms you need.
              </p>
              <Button onClick={() => navigate('/document-onboarding')}>
                Start AI-Powered Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
