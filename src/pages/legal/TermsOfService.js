import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  FileText, 
  Scale, 
  Users, 
  Lock, 
  AlertTriangle, 
  Gavel, 
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Download,
  Clock,
  Shield,
  ExternalLink,
  Building2,
  Trash2,
  Eye
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const TERMS_SECTIONS = [
  {
    id: 'agreement',
    title: 'Service Agreement',
    icon: FileText,
    summary: 'What you agree to when using our platform',
    content: [
      {
        heading: 'Acceptance of Terms',
        plainEnglish: 'By using EarnedIT, you agree to follow these rules.',
        text: 'By accessing or using the EarnedIT Platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.'
      },
      {
        heading: 'Description of Service',
        plainEnglish: 'Here\'s what EarnedIT does for you.',
        text: 'EarnedIT provides a platform to assist veterans with VA disability claims preparation. Our Service includes:',
        list: [
          'AI-powered document analysis and condition identification',
          'Evidence roadmap generation',
          'VA form auto-population assistance',
          'Integration with VA health records (with user consent)',
          'Peer mentor matching',
          'Wraparound services referrals'
        ]
      }
    ]
  },
  {
    id: 'fees',
    title: 'Fees & Eligibility',
    icon: Scale,
    summary: 'Our fee structure follows federal regulations - no upfront fees for claim preparation',
    content: [
      {
        heading: 'Fee Structure',
        plainEnglish: 'No upfront fees for claim preparation. Accredited agent fees are contingent on success and capped by federal law.',
        subsections: [
          {
            label: 'No Upfront Fees for Claim Preparation',
            highlight: true,
            text: 'Per 38 CFR 14.636(c)(1), no fees may be charged for services before a Notice of Disagreement is filed. EarnedIT does not charge upfront fees for claim preparation. Any fees charged by VA-accredited agents are contingent on successful claim approval.'
          },
          {
            label: 'Appeals and Supplemental Claims',
            text: 'For claims filed after a VA decision, fees are strictly regulated:',
            list: [
              'Apply ONLY to past-due (retroactive) benefits',
              'Never apply to ongoing monthly payments',
              'Capped at 20% for direct-pay agreements',
              'Capped at 33.33% for non-direct-pay agreements',
              'Require signed fee agreement filed within 30 days',
              'Are contingent on successful outcomes only'
            ]
          }
        ]
      },
      {
        heading: 'Eligibility',
        plainEnglish: 'You must be 18+ to use our service.',
        text: 'You must be at least 18 years old to use this Service. Veterans and their authorized representatives may use this Service for claim preparation purposes.'
      }
    ]
  },
  {
    id: 'accounts',
    title: 'User Accounts & Privacy',
    icon: Lock,
    summary: 'Your account security and data protection responsibilities',
    content: [
      {
        heading: 'User Accounts',
        plainEnglish: 'Keep your login credentials safe and report any suspicious activity.',
        text: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized account access.'
      },
      {
        heading: 'Privacy and Data Protection',
        plainEnglish: 'We protect your health information according to HIPAA standards.',
        text: 'Your use of the Service is also governed by our Privacy Policy. We are committed to protecting your personal information and comply with HIPAA requirements for protected health information (PHI).',
        linkTo: '/privacy'
      }
    ]
  },
  {
    id: 'responsibilities',
    title: 'Your Responsibilities',
    icon: Users,
    summary: 'What we expect from you as a user',
    content: [
      {
        heading: 'User Responsibilities',
        plainEnglish: 'Be honest, stay legal, and review your documents before submitting.',
        text: 'You agree to:',
        list: [
          'Provide accurate and complete information',
          'Use the Service only for lawful purposes',
          'Not attempt to access other users\' accounts or data',
          'Not upload malicious content or attempt to compromise the Service',
          'Review all auto-generated content for accuracy before submission to the VA'
        ]
      }
    ]
  },
  {
    id: 'disclaimers',
    title: 'Important Disclaimers',
    icon: AlertTriangle,
    summary: 'Understanding limitations and liability',
    content: [
      {
        heading: 'Disclaimer of Warranties',
        plainEnglish: 'We help prepare claims but cannot guarantee VA approval.',
        text: 'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. EarnedIT does not guarantee approval of VA disability claims. We are not a law firm and do not provide legal advice. Our AI-powered analysis is for assistance purposes only and should be reviewed by the user or a qualified representative before submission.',
        isWarning: true
      },
      {
        heading: 'Limitation of Liability',
        plainEnglish: 'Our liability is limited to what you\'ve paid us.',
        text: 'EarnedIT shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the twelve months preceding the claim.'
      },
      {
        heading: 'Intellectual Property',
        plainEnglish: 'We own the platform; you own your documents.',
        text: 'All content, features, and functionality of the Service are owned by EarnedIT and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your personal documents and data.'
      }
    ]
  },
  {
    id: 'third-party',
    title: 'Third-Party Services',
    icon: ExternalLink,
    summary: 'How we protect your data when working with partners',
    content: [
      {
        heading: 'Third-Party Data Protection',
        plainEnglish: 'Any partner who handles your data must follow the same strict rules we do.',
        text: 'When we work with third parties (such as VSOs, accredited agents, or service partners) who may access your information, we ensure your data remains protected:',
        thirdPartyList: [
          'All partners sign legally binding Business Associate Agreements (BAAs) before accessing any veteran data',
          'Partners must implement equivalent security safeguards and privacy practices',
          'Any subcontractors used by partners are also bound by the same protections',
          'We retain the right to audit partner compliance and terminate access for violations'
        ]
      },
      {
        heading: 'External Links',
        plainEnglish: 'When you leave our site, our rules no longer apply.',
        text: 'Our platform may contain links to external websites. When you navigate to external sites:',
        externalLinkList: [
          'You will see a clear notification before leaving our platform',
          'Our Terms of Service no longer apply once you leave EarnedIT',
          'The external site\'s terms and privacy policy will govern your use',
          'We are not responsible for the content or practices of external sites'
        ]
      }
    ]
  },
  {
    id: 'business-continuity',
    title: 'Business Continuity',
    icon: Building2,
    summary: 'Your rights if our company is sold or closes',
    content: [
      {
        heading: 'Business Transfer or Closure',
        plainEnglish: 'If our company is ever sold or closes, you\'ll have clear options for your data.',
        text: 'If EarnedIT is acquired, merges with another company, or ceases operations, you are guaranteed the following options:',
        businessOptions: [
          {
            option: 'i',
            title: 'Data Export',
            description: 'You may securely download or transmit all of your health information and documents in standard formats (such as PDF) before any transfer. We will provide at least 90 days notice.',
            icon: Download
          },
          {
            option: 'ii',
            title: 'Policy Continuity',
            description: 'Any acquiring entity must agree to honor the commitments in these Terms and our Privacy Policy, or we will notify you and provide opportunity to export your data first.',
            icon: Shield
          },
          {
            option: 'iii',
            title: 'Account Closure',
            description: 'You may close your account and request complete deletion of all your data at any time. Upon closure, we will permanently delete your information within 30 days.',
            icon: Trash2
          }
        ]
      },
      {
        heading: 'Advance Notice',
        plainEnglish: 'We\'ll give you plenty of warning before any major changes.',
        text: 'In the event of any business transfer or closure, we will provide at least 90 days written notice via email before the effective date, giving you ample time to make decisions about your data.'
      }
    ]
  },
  {
    id: 'legal',
    title: 'Legal Terms',
    icon: Gavel,
    summary: 'Termination, changes, and governing law',
    content: [
      {
        heading: 'Termination',
        plainEnglish: 'Either party can end this agreement.',
        text: 'We may terminate or suspend your account at any time for violation of these Terms. You may delete your account at any time through your account settings.'
      },
      {
        heading: 'Changes to Terms',
        plainEnglish: 'We\'ll notify you of important changes.',
        text: 'We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use after changes constitutes acceptance.'
      },
      {
        heading: 'Governing Law',
        plainEnglish: 'Texas law applies to these terms.',
        text: 'These Terms shall be governed by the laws of the State of Texas, without regard to conflict of law principles.'
      }
    ]
  }
];

export default function TermsOfService() {
  const navigate = useNavigate();
  const lastUpdated = 'January 15, 2026';
  const [expandedSections, setExpandedSections] = useState({});
  const [activeSection, setActiveSection] = useState('agreement');
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadProgress(progress);

      TERMS_SECTIONS.forEach(section => {
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
              <FileText className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms of Service</h1>
              <p className="text-white/80 text-lg mb-4">
                Clear, fair terms for using the EarnedIT platform
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
                  <Shield className="w-4 h-4" />
                  Veteran Focused
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
                {TERMS_SECTIONS.map((section) => {
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

              <div className="mt-8 p-4 bg-slate-100 rounded-xl">
                <h4 className="font-medium text-slate-900 mb-2 text-sm">Need Help?</h4>
                <p className="text-xs text-slate-600 mb-3">Questions about our terms?</p>
                <a 
                  href="mailto:support@earnedit.ai" 
                  className="text-sm text-[#1B3A5F] font-medium hover:underline"
                >
                  Contact Support Team
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="py-5 px-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Key Point: No Upfront Fees for Claim Preparation</h3>
                    <p className="text-amber-800 text-sm">
                      Per federal regulation 38 CFR 14.636, no fees may be charged for services before a Notice of Disagreement is filed. 
                      This means claim preparation assistance has no upfront cost. Any fees for accredited agent services are contingent on successful outcomes and are detailed in the Fee Structure section below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {TERMS_SECTIONS.map((section, sectionIdx) => {
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
                            
                            {item.isWarning ? (
                              <div className="ml-11 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{item.text}</p>
                              </div>
                            ) : item.text ? (
                              <p className="ml-11 text-slate-600 leading-relaxed">{item.text}</p>
                            ) : null}
                            
                            {item.linkTo && (
                              <div className="ml-11">
                                <Link 
                                  to={item.linkTo}
                                  className="inline-flex items-center gap-2 text-[#1B3A5F] font-medium hover:underline"
                                >
                                  View our Privacy Policy
                                  <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                              </div>
                            )}
                            
                            {item.list && (
                              <ul className="ml-11 space-y-2">
                                {item.list.map((listItem, listIdx) => (
                                  <li key={listIdx} className="flex items-start gap-3 text-slate-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{listItem}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            {item.subsections && (
                              <div className="ml-11 space-y-4">
                                {item.subsections.map((sub, subIdx) => (
                                  <div 
                                    key={subIdx} 
                                    className={`p-4 rounded-xl ${
                                      sub.highlight 
                                        ? 'bg-green-50 border-2 border-green-200' 
                                        : 'bg-slate-50'
                                    }`}
                                  >
                                    <p className={`font-medium mb-2 ${
                                      sub.highlight ? 'text-green-800' : 'text-slate-800'
                                    }`}>
                                      {sub.highlight && <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />}
                                      {sub.label}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${
                                      sub.highlight ? 'text-green-700' : 'text-slate-600'
                                    }`}>
                                      {sub.text}
                                    </p>
                                    {sub.list && (
                                      <ul className="mt-3 space-y-1.5">
                                        {sub.list.map((listItem, listIdx) => (
                                          <li key={listIdx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                                            <span>{listItem}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {item.thirdPartyList && (
                              <ul className="ml-11 space-y-3">
                                {item.thirdPartyList.map((listItem, listIdx) => (
                                  <li key={listIdx} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-green-800">{listItem}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            
                            {item.externalLinkList && (
                              <ul className="ml-11 space-y-3">
                                {item.externalLinkList.map((listItem, listIdx) => (
                                  <li key={listIdx} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <ExternalLink className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-amber-800">{listItem}</span>
                                  </li>
                                ))}
                              </ul>
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
                    <h3 className="text-xl font-semibold mb-2">Questions About These Terms?</h3>
                    <p className="text-white/70 mb-4">
                      Our support team is here to help clarify any questions you may have.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <a 
                        href="mailto:support@earnedit.ai"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1B3A5F] rounded-lg font-medium hover:bg-white/90 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Email Support Team
                      </a>
                    </div>
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
