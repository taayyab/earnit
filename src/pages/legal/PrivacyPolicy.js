import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  Shield, 
  Database, 
  Lock, 
  Share2, 
  UserCheck, 
  Clock, 
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Eye,
  Trash2,
  Download,
  Bell,
  Server,
  ExternalLink,
  AlertTriangle,
  Building2,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const PRIVACY_SECTIONS = [
  {
    id: 'collection',
    title: 'Information We Collect',
    icon: Database,
    summary: 'What data we gather and why',
    content: [
      {
        heading: 'Personal Information',
        plainEnglish: 'Basic info to identify you and your military service.',
        list: [
          { text: 'Name, email address, and contact information', icon: UserCheck },
          { text: 'Military service history and veteran status', icon: Shield },
          { text: 'Account credentials (always encrypted)', icon: Lock }
        ]
      },
      {
        heading: 'Protected Health Information (PHI)',
        plainEnglish: 'Medical data we handle with extra care under HIPAA.',
        list: [
          { text: 'Medical records and diagnoses', icon: Database },
          { text: 'VA health records (imported with your consent)', icon: CheckCircle },
          { text: 'Disability conditions and symptoms', icon: Eye },
          { text: 'Treatment history and medications', icon: Clock }
        ]
      },
      {
        heading: 'Documents You Upload',
        plainEnglish: 'Files you share to support your claim.',
        list: [
          { text: 'DD-214 and service records', icon: Shield },
          { text: 'Medical evidence and doctor\'s statements', icon: Database },
          { text: 'Supporting documentation for claims', icon: CheckCircle }
        ]
      }
    ]
  },
  {
    id: 'usage',
    title: 'How We Use Your Data',
    icon: Eye,
    summary: 'The purposes behind data processing',
    content: [
      {
        heading: 'Data Usage Purposes',
        plainEnglish: 'We only use your data to help with your VA claim.',
        list: [
          { text: 'Provide AI-powered claim analysis and assistance', icon: CheckCircle },
          { text: 'Generate evidence roadmaps and form auto-population', icon: CheckCircle },
          { text: 'Connect you with peer mentors and support services', icon: CheckCircle },
          { text: 'Import your VA health records (with explicit consent)', icon: CheckCircle },
          { text: 'Improve our services through anonymized analytics', icon: CheckCircle },
          { text: 'Communicate service updates and support', icon: CheckCircle }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'How We Protect Your Data',
    icon: Lock,
    summary: 'Military-grade security measures we employ',
    content: [
      {
        heading: 'Security Measures',
        plainEnglish: 'Enterprise-level protection for your sensitive information.',
        securityFeatures: [
          { 
            title: 'AES-256-GCM Encryption', 
            description: 'All PHI is encrypted at rest using military-grade encryption',
            level: 'critical'
          },
          { 
            title: 'TLS 1.3 in Transit', 
            description: 'All data moving between you and our servers is encrypted',
            level: 'critical'
          },
          { 
            title: 'Multi-Factor Authentication', 
            description: 'Optional MFA adds an extra layer of account security',
            level: 'high'
          },
          { 
            title: 'Session Management', 
            description: '30-minute timeout with IP tracking for security',
            level: 'high'
          },
          { 
            title: 'Immutable Audit Logs', 
            description: 'Every access to PHI is permanently logged',
            level: 'critical'
          },
          { 
            title: 'Role-Based Access', 
            description: 'Strict access controls limit who can see what',
            level: 'high'
          }
        ]
      },
      {
        heading: 'VA Health Records Integration',
        plainEnglish: 'Secure connection to your VA medical data.',
        text: 'When you choose to import your VA health records:',
        list: [
          { text: 'We access only the record types you explicitly select', icon: CheckCircle },
          { text: 'Data is retrieved via secure VA FHIR APIs', icon: Server },
          { text: 'You can revoke access at any time', icon: Trash2 },
          { text: 'Imported records are encrypted and stored securely', icon: Lock }
        ]
      }
    ]
  },
  {
    id: 'sharing',
    title: 'Information Sharing',
    icon: Share2,
    summary: 'Who we share data with and how third parties are bound',
    content: [
      {
        heading: 'Our Sharing Policy',
        plainEnglish: 'We NEVER sell your data. Period.',
        highlight: true,
        text: 'We do NOT sell your personal information to anyone, ever. We only share information in these specific situations:',
        shareCategories: [
          {
            title: 'Service Partners',
            description: 'Only with your explicit consent for referrals',
            icon: UserCheck,
            consent: 'Required'
          },
          {
            title: 'VA Systems',
            description: 'When you submit claims through our platform',
            icon: Shield,
            consent: 'You initiate'
          },
          {
            title: 'Legal Requirements',
            description: 'When required by law or court order',
            icon: Lock,
            consent: 'Legal mandate'
          }
        ]
      },
      {
        heading: 'Third-Party Data Protection Commitments',
        plainEnglish: 'Any organization that touches your data must follow the same strict rules we do.',
        text: 'All third parties who access, process, or store your information through our platform are contractually bound to equivalent privacy and security protections:',
        thirdPartyCommitments: [
          {
            title: 'Business Associate Agreements',
            description: 'VSOs, accredited agents, and partner organizations sign legally binding HIPAA Business Associate Agreements before accessing any veteran data',
            icon: FileText
          },
          {
            title: 'Same Privacy Standards',
            description: 'Third parties must implement the same security safeguards, breach notification procedures, and data handling practices required of EarnedIT',
            icon: Shield
          },
          {
            title: 'Subcontractor Chain',
            description: 'Any subcontractors used by our partners must also be bound by equivalent protections - this chain of protection never breaks',
            icon: Lock
          },
          {
            title: 'Audit Rights',
            description: 'We retain the right to audit third-party compliance and terminate access for violations',
            icon: Eye
          }
        ]
      },
      {
        heading: 'External Links Notice',
        plainEnglish: 'When you leave our site, our rules no longer apply.',
        text: 'Our platform may contain links to external websites (such as VA.gov, partner organizations, or support resources). When you click a link that takes you outside of EarnedIT:',
        externalLinkNotice: true,
        list: [
          { text: 'You will see a clear notification before leaving our platform', icon: ExternalLink },
          { text: 'Our Terms of Service and Privacy Policy no longer apply once you leave', icon: AlertTriangle },
          { text: 'The external site\'s own privacy policy and terms will govern your use', icon: FileText },
          { text: 'We are not responsible for the privacy practices of external sites', icon: Shield }
        ]
      },
      {
        heading: 'Service Providers & Subprocessors',
        plainEnglish: 'Here are the trusted companies that help us serve you.',
        text: 'We use the following service providers to operate our platform. Each is contractually bound to protect your data under strict confidentiality and security requirements:',
        isServiceProviders: true,
        serviceProviders: [
          {
            name: 'OpenAI',
            purpose: 'AI-powered document analysis and claims assistance',
            dataAccessed: 'Document text (de-identified where possible)',
            location: 'United States'
          },
          {
            name: 'Neon (PostgreSQL)',
            purpose: 'Secure database hosting with encryption at rest',
            dataAccessed: 'Account data, claims data (encrypted)',
            location: 'United States'
          },
          {
            name: 'Replit',
            purpose: 'Application hosting and infrastructure',
            dataAccessed: 'Application logs, performance metrics',
            location: 'United States'
          },
          {
            name: 'Resend',
            purpose: 'Email notifications and communications',
            dataAccessed: 'Email addresses, notification content',
            location: 'United States'
          },
          {
            name: 'ID.me',
            purpose: 'Veteran identity verification and authentication',
            dataAccessed: 'Identity verification status (no PHI stored)',
            location: 'United States'
          }
        ]
      }
    ]
  },
  {
    id: 'rights',
    title: 'Your Data Rights',
    icon: UserCheck,
    summary: 'Control you have over your information',
    content: [
      {
        heading: 'Rights You Have',
        plainEnglish: 'You\'re in control of your data at all times.',
        rights: [
          { 
            title: 'Access', 
            description: 'View all personal information and PHI we have',
            icon: Eye
          },
          { 
            title: 'Correct', 
            description: 'Request correction of any inaccurate data',
            icon: CheckCircle
          },
          { 
            title: 'Delete', 
            description: 'Request complete deletion of your account and data',
            icon: Trash2
          },
          { 
            title: 'Export', 
            description: 'Get a copy of your data in portable format',
            icon: Download
          },
          { 
            title: 'Revoke', 
            description: 'Withdraw consent for VA health records access anytime',
            icon: Lock
          },
          { 
            title: 'Be Notified', 
            description: 'Receive notification of any data breaches affecting you',
            icon: Bell
          }
        ]
      },
      {
        heading: 'Data Breach Response',
        plainEnglish: 'If there\'s ever a breach, we\'ll tell you what happened and what to do.',
        isBreachResponse: true,
        text: 'In the unlikely event of a data breach affecting your information, we commit to the following response:',
        breachSteps: [
          {
            step: 1,
            title: 'Prompt Notification',
            description: 'We will notify you within 60 days of discovering a breach that affects your Protected Health Information, as required by HIPAA',
            icon: Bell
          },
          {
            step: 2,
            title: 'Clear Explanation',
            description: 'Our notification will explain what happened, what information was involved, and what we are doing to address the situation',
            icon: FileText
          },
          {
            step: 3,
            title: 'Protective Instructions',
            description: 'We will provide specific, actionable steps you should take to protect yourself, which may include changing passwords, monitoring your credit, or contacting the VA',
            icon: Shield
          },
          {
            step: 4,
            title: 'Dedicated Support',
            description: 'We will designate a contact person or team to answer your questions about the breach and assist you with next steps',
            icon: UserCheck
          },
          {
            step: 5,
            title: 'Ongoing Updates',
            description: 'We will keep you informed as our investigation progresses and provide any additional protective measures that become necessary',
            icon: RefreshCw
          }
        ]
      }
    ]
  },
  {
    id: 'retention',
    title: 'Data Retention & Cookies',
    icon: Clock,
    summary: 'How long we keep data and cookie usage',
    content: [
      {
        heading: 'Data Retention',
        plainEnglish: 'We keep data only as long as needed, then delete it.',
        text: 'We retain your data for as long as your account is active or as needed to provide services. Upon account deletion, we remove personal data within 30 days, except where retention is required by law.'
      },
      {
        heading: 'Cookies',
        plainEnglish: 'We use minimal, essential cookies only.',
        text: 'We use essential cookies for authentication and session management. We use anonymized analytics to improve our services. You can disable non-essential cookies in your browser settings.'
      },
      {
        heading: 'Age Requirement',
        plainEnglish: 'Our service is for adults only.',
        text: 'Our Service is not intended for individuals under 18 years of age. We do not knowingly collect information from children.'
      },
      {
        heading: 'Policy Updates',
        plainEnglish: 'We\'ll tell you about important changes.',
        text: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our platform.'
      }
    ]
  },
  {
    id: 'business-continuity',
    title: 'Business Continuity',
    icon: Building2,
    summary: 'Your data rights if our company is sold or closes',
    content: [
      {
        heading: 'Your Rights During Business Changes',
        plainEnglish: 'If our company is ever sold or closes, you\'ll have clear options for your data.',
        isBusinessContinuity: true,
        text: 'If EarnedIT is acquired by another company, merges with another organization, or ceases operations, we guarantee you will have the following options:',
        businessOptions: [
          {
            option: 'i',
            title: 'Export Your Data',
            description: 'You may securely download or transmit all of your health information and documents in standard formats (such as PDF) before any transfer occurs. We will provide at least 90 days notice to allow you to export your data.',
            icon: Download
          },
          {
            option: 'ii',
            title: 'Policy Continuity',
            description: 'Any acquiring entity or successor organization must agree to honor the privacy commitments in this policy, or we will notify you and provide the opportunity to export your data before the transfer.',
            icon: Shield
          },
          {
            option: 'iii',
            title: 'Account Closure',
            description: 'You may close your account and request complete deletion of all your data at any time. Upon closure, we will permanently delete your personal information and health records within 30 days.',
            icon: Trash2
          }
        ]
      },
      {
        heading: 'Advance Notice Commitment',
        plainEnglish: 'We\'ll give you plenty of warning before any major changes.',
        text: 'In the event of any business transfer or closure, we commit to providing you with at least 90 days written notice via email before the effective date, giving you ample time to make decisions about your data.'
      }
    ]
  }
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = 'January 15, 2026';
  const [expandedSections, setExpandedSections] = useState({});
  const [activeSection, setActiveSection] = useState('collection');
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadProgress(progress);

      PRIVACY_SECTIONS.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#1B3A5F] to-[#C41E3A] transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <div className="bg-gradient-to-br from-[#1B3A5F] via-[#234b73] to-[#1B3A5F] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back
          </Button>

          <div className="flex items-start gap-6">
            <div className="hidden sm:flex w-20 h-20 bg-white/10 backdrop-blur rounded-2xl items-center justify-center flex-shrink-0">
              <Shield className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
              <p className="text-white/80 text-lg mb-4">
                Your privacy is sacred to us. Here's exactly how we protect it.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm">
                  <Clock className="w-4 h-4" />
                  Updated {lastUpdated}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 backdrop-blur rounded-full text-sm text-green-200">
                  <CheckCircle className="w-4 h-4" />
                  HIPAA Compliant
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur rounded-full text-sm text-blue-200">
                  <Lock className="w-4 h-4" />
                  AES-256 Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contents</h3>
              <nav className="space-y-1">
                {PRIVACY_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        isActive 
                          ? 'bg-[#1B3A5F] text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900 text-sm">HIPAA Certified</h4>
                </div>
                <p className="text-xs text-green-700">
                  We maintain full compliance with healthcare privacy regulations.
                </p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
              <CardContent className="py-6 px-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg mb-2">HIPAA Compliance Commitment</h3>
                    <p className="text-blue-800 leading-relaxed">
                      EarnedIT is committed to protecting your Protected Health Information (PHI) in accordance 
                      with the Health Insurance Portability and Accountability Act (HIPAA). We implement 
                      administrative, physical, and technical safeguards to ensure the confidentiality, 
                      integrity, and availability of your health information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {PRIVACY_SECTIONS.map((section, sectionIdx) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id] !== false;
              
              return (
                <div key={section.id} id={section.id} className="scroll-mt-8">
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1B3A5F] rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                          <p className="text-sm text-slate-500">{section.summary}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <CardContent className="p-6 space-y-6">
                        {section.content.map((item, itemIdx) => (
                          <div key={itemIdx} className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-semibold text-slate-600">
                                  {sectionIdx + 1}.{itemIdx + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 text-lg">{item.heading}</h3>
                                {item.plainEnglish && (
                                  <div className="mt-2 px-4 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                    <p className="text-blue-800 text-sm font-medium">
                                      Plain English: {item.plainEnglish}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {item.highlight && (
                              <div className="ml-11 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <span className="font-semibold text-green-800">We Never Sell Your Data</span>
                                </div>
                                <p className="text-green-700">{item.text}</p>
                              </div>
                            )}
                            
                            {item.text && !item.highlight && (
                              <p className="ml-11 text-slate-600 leading-relaxed">{item.text}</p>
                            )}
                            
                            {item.list && (
                              <ul className="ml-11 space-y-3">
                                {item.list.map((listItem, listIdx) => {
                                  const ItemIcon = listItem.icon || CheckCircle;
                                  return (
                                    <li key={listIdx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                      <ItemIcon className="w-5 h-5 text-[#1B3A5F] flex-shrink-0 mt-0.5" />
                                      <span className="text-slate-700">{listItem.text}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            
                            {item.securityFeatures && (
                              <div className="ml-11 grid sm:grid-cols-2 gap-3">
                                {item.securityFeatures.map((feature, featureIdx) => (
                                  <div 
                                    key={featureIdx} 
                                    className={`p-4 rounded-xl border-2 ${
                                      feature.level === 'critical' 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-blue-50 border-blue-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Lock className={`w-4 h-4 ${
                                        feature.level === 'critical' ? 'text-green-600' : 'text-blue-600'
                                      }`} />
                                      <span className={`font-semibold text-sm ${
                                        feature.level === 'critical' ? 'text-green-800' : 'text-blue-800'
                                      }`}>
                                        {feature.title}
                                      </span>
                                    </div>
                                    <p className={`text-xs ${
                                      feature.level === 'critical' ? 'text-green-700' : 'text-blue-700'
                                    }`}>
                                      {feature.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {item.shareCategories && (
                              <div className="ml-11 space-y-3">
                                {item.shareCategories.map((category, catIdx) => {
                                  const CatIcon = category.icon;
                                  return (
                                    <div key={catIdx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                                        <CatIcon className="w-5 h-5 text-[#1B3A5F]" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-slate-900">{category.title}</p>
                                        <p className="text-sm text-slate-600">{category.description}</p>
                                      </div>
                                      <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full">
                                        {category.consent}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {item.rights && (
                              <div className="ml-11 grid sm:grid-cols-2 gap-3">
                                {item.rights.map((right, rightIdx) => {
                                  const RightIcon = right.icon;
                                  return (
                                    <div key={rightIdx} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-[#1B3A5F] rounded-lg flex items-center justify-center">
                                          <RightIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-900">{right.title}</span>
                                      </div>
                                      <p className="text-sm text-slate-600 ml-11">{right.description}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {item.thirdPartyCommitments && (
                              <div className="ml-11 space-y-3">
                                {item.thirdPartyCommitments.map((commitment, commitIdx) => {
                                  const CommitIcon = commitment.icon;
                                  return (
                                    <div key={commitIdx} className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <CommitIcon className="w-5 h-5 text-green-700" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-green-900">{commitment.title}</p>
                                        <p className="text-sm text-green-700 mt-1">{commitment.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {item.isServiceProviders && item.serviceProviders && (
                              <div className="ml-11">
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                      <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Provider</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Purpose</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden md:table-cell">Data Accessed</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700 hidden lg:table-cell">Location</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {item.serviceProviders.map((provider, provIdx) => (
                                        <tr key={provIdx} className="hover:bg-slate-50">
                                          <td className="px-4 py-3 font-medium text-slate-900">{provider.name}</td>
                                          <td className="px-4 py-3 text-slate-600">{provider.purpose}</td>
                                          <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{provider.dataAccessed}</td>
                                          <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              {provider.location}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <p className="mt-3 text-xs text-slate-500 italic">
                                  This list is updated as we add or change service providers. All providers are bound by data processing agreements.
                                </p>
                              </div>
                            )}
                            
                            {item.breachSteps && (
                              <div className="ml-11 space-y-3">
                                {item.breachSteps.map((step) => {
                                  const StepIcon = step.icon;
                                  return (
                                    <div key={step.step} className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-amber-700">{step.step}</span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <StepIcon className="w-4 h-4 text-amber-700" />
                                          <p className="font-medium text-amber-900">{step.title}</p>
                                        </div>
                                        <p className="text-sm text-amber-700">{step.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {item.businessOptions && (
                              <div className="ml-11 space-y-3">
                                {item.businessOptions.map((option) => {
                                  const OptionIcon = option.icon;
                                  return (
                                    <div key={option.option} className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-blue-700">({option.option})</span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <OptionIcon className="w-4 h-4 text-blue-700" />
                                          <p className="font-medium text-blue-900">{option.title}</p>
                                        </div>
                                        <p className="text-sm text-blue-700">{option.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                </div>
              );
            })}

            <Card className="bg-gradient-to-br from-[#1B3A5F] to-[#2a5a8f] text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2">Privacy Questions or Concerns?</h3>
                    <p className="text-white/70 mb-4">
                      Our support team is here to help with any privacy-related inquiries.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <a 
                        href="mailto:support@earnedit.ai"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1B3A5F] rounded-lg font-medium hover:bg-white/90 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Contact Support Team
                      </a>
                    </div>
                    <p className="text-white/50 text-sm mt-4">
                      You may also file HIPAA complaints with the U.S. Department of Health and Human Services Office for Civil Rights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
