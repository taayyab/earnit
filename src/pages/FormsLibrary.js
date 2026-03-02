import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import VeteranLayout from '../components/VeteranLayout';

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
  mental_health: 'bg-[#1B3A5F]',
  musculoskeletal: 'bg-[#1B3A5F]',
  audio: 'bg-amber-600',
  neurological: 'bg-[#1B3A5F]',
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
  cancer: 'bg-[#1B3A5F]',
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
    color: 'bg-[#1B3A5F]',
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

  const handleDownloadTemplate = (template) => {
    const TEMPLATE_CONTENT = {
      'nexus-template': `MEDICAL NEXUS LETTER TEMPLATE
==============================
Date: _______________

To Whom It May Concern / Department of Veterans Affairs:

RE: Nexus Letter for [VETERAN NAME] – Service Connection for [CONDITION NAME]

I, [DOCTOR'S FULL NAME], [CREDENTIALS], am a licensed [SPECIALTY] currently treating
[VETERAN NAME] for [CONDITION NAME].

I. CURRENT DIAGNOSIS
--------------------
[VETERAN NAME] has been diagnosed with [CONDITION NAME] (ICD-10: [CODE]).
This condition has been present since approximately [DATE].

II. MEDICAL OPINION
-------------------
It is my medical opinion that the above-mentioned condition is at least as likely as
not (50% or greater probability) directly caused by, or aggravated by, the veteran's
active military service.

III. RATIONALE
--------------
This opinion is based on:
  1. Review of the veteran's service treatment records dated [DATE RANGE]
  2. Review of the veteran's current medical records
  3. Personal examination and treatment of the veteran
  4. The following medical literature: [CITATIONS IF APPLICABLE]

[SPECIFIC REASONING LINKING CONDITION TO SERVICE EVENT/EXPOSURE]

IV. CONCLUSION
--------------
Based on my clinical assessment and the evidence reviewed, I conclude that
[CONDITION NAME] is at least as likely as not related to [VETERAN NAME]'s military
service.

Respectfully submitted,

___________________________
[DOCTOR'S FULL NAME], [CREDENTIALS]
[PRACTICE/HOSPITAL NAME]
[ADDRESS]
[PHONE]
[LICENSE NUMBER]
[DATE]

TIPS FOR SUCCESS:
- The phrase "at least as likely as not" is the legal standard the VA requires.
- Include specific reasoning linking the condition to service.
- Have the treating physician customize and sign this letter.
`,
      'buddy-statement': `BUDDY STATEMENT / FELLOW SERVICE MEMBER STATEMENT TEMPLATE
=============================================================
VA Form 21-10210 equivalent – Lay/Witness Statement

Date: _______________

Department of Veterans Affairs
[Regional Office Address]

RE: Statement in Support of Claim for [VETERAN NAME]

I, [YOUR FULL NAME], hereby submit this statement in support of the disability claim
of [VETERAN NAME].

I. MY RELATIONSHIP TO THE VETERAN
-----------------------------------
I served with [VETERAN NAME] in [UNIT/BRANCH] from [DATE] to [DATE].
[OR: I am a friend/family member who has known the veteran since DATE.]

II. WHAT I PERSONALLY WITNESSED DURING SERVICE
------------------------------------------------
[Describe specific incidents, events, or conditions you witnessed that are related
to the veteran's disability claim. Be specific about dates, locations, and what
you saw or experienced together.]

Example: "During our deployment to [LOCATION] from [DATE] to [DATE], I personally
witnessed [VETERAN NAME] sustain [INJURY/EXPOSURE] on [DATE]. At that time,
[DESCRIBE WHAT YOU SAW]."

III. OBSERVATIONS SINCE SERVICE
---------------------------------
Since leaving the service, I have observed the following changes in [VETERAN NAME]:
[Describe behavioral changes, physical limitations, or symptoms you have personally
observed that relate to the claimed condition.]

IV. IMPACT ON DAILY LIFE
--------------------------
I have observed that [VETERAN NAME]'s condition affects their daily life in the
following ways:
  -
  -
  -

I certify that the statements on this form are true and correct to the best of my
knowledge and belief.

___________________________        _______________
[YOUR SIGNATURE]                   Date

[YOUR PRINTED NAME]
[YOUR ADDRESS]
[YOUR PHONE]
[YOUR SERVICE DATES AND BRANCH (if applicable)]

TIPS FOR SUCCESS:
- Describe only what you personally witnessed, not what you were told.
- Be specific about dates, locations, and events.
- Fellow service members' statements carry significant weight with the VA.
`,
      'personal-statement': `PERSONAL STATEMENT TEMPLATE
============================
(Statement in Support of Claim – VA Form 21-4138 equivalent)

Date: _______________

Department of Veterans Affairs

RE: Personal Statement – [YOUR NAME] – Claim for [CONDITION(S)]

I. MY IN-SERVICE EXPERIENCE
-----------------------------
During my service in [BRANCH] from [DATE] to [DATE], I was assigned to [UNIT].
While serving, I experienced / was exposed to:

[Describe the incident, event, or exposure that caused or contributed to your
condition. Include:
  - Date(s) and location(s)
  - What happened
  - Whether you sought medical attention at the time
  - Names of witnesses if applicable]

II. HOW MY CONDITION DEVELOPED
--------------------------------
After this experience, I began to notice:
[Describe when symptoms started, how they progressed, and any treatment you sought.]

III. MY CURRENT SYMPTOMS
-------------------------
Today, my condition causes the following symptoms on a regular basis:
  - [SYMPTOM 1] – Frequency: [DAILY / WEEKLY / CONSTANT]
  - [SYMPTOM 2] – Frequency:
  - [SYMPTOM 3] – Frequency:

IV. IMPACT ON DAILY LIFE
--------------------------
My condition affects my daily life in the following ways:

Work: [Describe limitations at work – missed days, inability to stand/sit/concentrate, etc.]

Family: [Describe impact on relationships and family responsibilities.]

Social: [Describe withdrawal from activities, hobbies, or social life.]

A typical day for me looks like: [Describe a realistic day highlighting how the
condition affects your routine.]

V. STATEMENT OF TRUTH
-----------------------
I certify that the information provided in this statement is true and accurate to
the best of my knowledge.

___________________________        _______________
[YOUR SIGNATURE]                   Date

[YOUR PRINTED NAME]
[YOUR CONTACT INFORMATION]

TIPS FOR SUCCESS:
- Be specific and honest – avoid exaggerating or minimizing.
- Describe how symptoms affect your ability to work and live normally.
- Use the 5 "W"s: Who, What, Where, When, Why.
`,
      'evidence-checklist': `COMPLETE VA CLAIM EVIDENCE CHECKLIST
======================================
Use this checklist to ensure your claim is fully developed before submission.

SECTION 1 – IDENTITY & SERVICE DOCUMENTS
------------------------------------------
[ ] DD-214 (Certificate of Release or Discharge from Active Duty)
[ ] NGB Form 22 (if National Guard)
[ ] All service branches listed with dates
[ ] Reserve/Guard orders (if applicable)

SECTION 2 – MEDICAL EVIDENCE
------------------------------
[ ] Service Treatment Records (STRs) – requested from National Personnel Records Center
[ ] VA Medical Records (VAMC records from all facilities treated at)
[ ] Private Medical Records for each claimed condition
[ ] Current diagnosis from a licensed physician for each condition
[ ] Disability Benefits Questionnaire (DBQ) completed by treating physician
[ ] Nexus Letter for non-presumptive conditions (connecting condition to service)

SECTION 3 – CLAIM FORMS
-------------------------
[ ] VA Form 21-0966 (Intent to File) – Submit FIRST to lock your effective date
[ ] VA Form 21-526EZ (Application for Disability Compensation) – Primary claim form
[ ] VA Form 21-4142 (Release of Medical Records) – One per private provider
[ ] VA Form 21-4138 (Statement in Support of Claim) – For personal statements
[ ] VA Form 21-0781 (PTSD Stressor Statement) – Required for PTSD claims
[ ] VA Form 21-0781a (MST Statement) – If PTSD is based on personal assault
[ ] VA Form 21-10210 (Lay/Witness Statement) – For buddy statements

SECTION 4 – SUPPORTING STATEMENTS
------------------------------------
[ ] Personal Statement (describing in-service event and current impact)
[ ] Buddy Statements from fellow service members
[ ] Family member lay statements (describing observed symptoms)
[ ] Employer statement (if condition affects work)

SECTION 5 – SPECIALTY EVIDENCE (if applicable)
------------------------------------------------
[ ] Sleep study results (for sleep apnea)
[ ] Audiometric test results (for hearing loss/tinnitus)
[ ] Mental health evaluation (for PTSD, depression, anxiety)
[ ] Imaging results (X-rays, MRI, CT scans)
[ ] Surgical records

SECTION 6 – FULLY DEVELOPED CLAIM (FDC) CHECKLIST
----------------------------------------------------
For faster processing, submit ALL of the following at once:
[ ] All private medical records obtained upfront
[ ] All DBQs completed before submission
[ ] All supporting statements gathered
[ ] Intent to File already on record
[ ] 21-526EZ complete with all conditions listed

SECTION 7 – BEFORE YOU SUBMIT
-------------------------------
[ ] All conditions listed – even those you're unsure qualify
[ ] Effective date captured (Intent to File submitted)
[ ] Each condition has at least: diagnosis + nexus + current symptoms documented
[ ] DBQs include range-of-motion measurements where applicable
[ ] All forms signed and dated

TIPS FOR SUCCESS:
- More evidence = stronger claim. Never wait for "perfect" – submit and supplement.
- The VA will request C&P exams; keep a copy of every DBQ you submit.
- Request a copy of your claim file (C-file) to see what the VA has on record.
`,
    };

    const content = TEMPLATE_CONTENT[template.id];
    if (!content) {
      toast.error('Template content not available');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`"${template.name}" downloaded`);
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
    <VeteranLayout>
      <div className="min-h-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
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
                              <Badge className="bg-blue-50 text-[#1B3A5F] text-xs">Guide</Badge>
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
            <div className="w-10 h-10 bg-gradient-to-br from-[#1B3A5F] to-[#1B3A5F] rounded-lg flex items-center justify-center">
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
                <Card key={idx} className="border-2 border-blue-200 hover:border-blue-200 transition-colors">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{template.name}</h4>
                          <Badge className="bg-blue-50 text-[#1B3A5F] text-xs capitalize">
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
                        className="bg-[#1B3A5F] hover:bg-[#1B3A5F]"
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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-[#1B3A5F]">{template.usage_tips}</p>
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
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600"
                        onClick={() => handleDownloadTemplate(template)}
                      >
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
                className={selectedPriority === 1 ? "bg-[#1B3A5F] hover:bg-[#2a4a6f]" : ""}
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
                                    className="bg-[#1B3A5F] hover:bg-[#1B3A5F]"
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
    </VeteranLayout>
  );
}
