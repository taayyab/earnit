import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Mail, 
  MessageCircle,
  Phone,
  FileText,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ_CATEGORIES = [
  {
    title: 'Getting Started',
    icon: Zap,
    questions: [
      {
        q: 'How do I sign up for EarnedIT?',
        a: 'Click the "Get Started" or "Try Demo" button on our homepage. Create an account using your email address, or try our instant demo mode to explore the platform without signing up. After registration, you can optionally verify your veteran status through ID.me for enhanced features.'
      },
      {
        q: 'What are EarnedIT\'s fees?',
        a: 'EarnedIT helps veterans prepare disability claims. For original claims, no fees can be charged per federal law (38 CFR 14.636). For appeals and supplemental claims filed after a VA decision, VA-accredited partners may charge contingency fees capped at 20% (direct-pay) or 33.33% (non-direct-pay) of past-due benefits only. See our Terms of Service for complete fee details.'
      },
      {
        q: 'What documents do I need to get started?',
        a: 'At minimum, upload your DD-214 (Certificate of Release or Discharge). For best results, also upload any medical records, service treatment records, VA medical center records, and private doctor statements related to your conditions.'
      }
    ]
  },
  {
    title: 'How It Works',
    icon: FileText,
    questions: [
      {
        q: 'How does the AI analyze my documents?',
        a: 'Our AI reads your uploaded documents and identifies medical conditions, service connections, and supporting evidence. It maps conditions to VA diagnostic codes (38 CFR Part 4), evaluates evidence strength, and identifies presumptive conditions. You review and confirm all AI findings before proceeding.'
      },
      {
        q: 'What is the evidence roadmap?',
        a: 'The evidence roadmap shows exactly what documentation the VA needs for each condition you\'re claiming. It tracks your progress, highlights missing evidence, and provides guidance on how to obtain required documents like buddy statements, nexus letters, and DBQs.'
      },
      {
        q: 'Can I import my VA health records?',
        a: 'Yes! With your consent, we can securely import your medical records directly from MyHealtheVet through the VA\'s official FHIR APIs. This auto-populates evidence requirements and ensures nothing is missed from your VA treatment history.'
      }
    ]
  },
  {
    title: 'Privacy & Security',
    icon: Shield,
    questions: [
      {
        q: 'Is my medical information secure?',
        a: 'Absolutely. We use AES-256-GCM encryption for all Protected Health Information (PHI), TLS 1.3 for data in transit, and maintain full HIPAA compliance. Your data is never sold or shared without your explicit consent.'
      },
      {
        q: 'Who can see my information?',
        a: 'Only you can access your account and documents. Our systems process your data for AI analysis, but no human reviews your personal information unless you specifically request support assistance. All access is logged for security.'
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes. You can delete your account and all associated data at any time through your account settings. We will remove your personal information within 30 days of deletion request.'
      }
    ]
  },
  {
    title: 'Support Services',
    icon: Users,
    questions: [
      {
        q: 'What is peer mentor matching?',
        a: 'We connect you with fellow veterans who have successfully navigated the claims process. Mentors are matched based on service branch, era, and condition types. They provide guidance, encouragement, and practical tips based on their experience.'
      },
      {
        q: 'What wraparound services do you offer?',
        a: 'Beyond claims assistance, we help connect veterans with housing assistance, employment services, mental health resources, transportation support, and other community services. Our Texas-focused network includes partnerships with local veteran service organizations.'
      },
      {
        q: 'Do you provide legal advice?',
        a: 'No. EarnedIT is not a law firm and does not provide legal advice. For complex cases or appeals, we can refer you to accredited VA claims agents or attorneys if you request it.'
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back
        </Button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#1B3A5F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-[#1B3A5F]">Help Center & FAQ</h1>
          <p className="text-slate-600 mt-2">Find answers to common questions about EarnedIT</p>
        </div>

        <div className="space-y-8">
          {FAQ_CATEGORIES.map((category, catIdx) => {
            const Icon = category.icon;
            return (
              <Card key={catIdx}>
                <CardHeader className="border-b bg-slate-50">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Icon className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  {category.questions.map((item, qIdx) => {
                    const isOpen = openItems[`${catIdx}-${qIdx}`];
                    return (
                      <div key={qIdx} className="py-4">
                        <button
                          onClick={() => toggleItem(catIdx, qIdx)}
                          className="w-full flex items-start justify-between text-left gap-4 focus-visible:ring-2 focus-visible:ring-[#1B3A5F] focus-visible:ring-offset-2 rounded-lg p-2 -m-2"
                          aria-expanded={isOpen}
                          aria-controls={`answer-${catIdx}-${qIdx}`}
                        >
                          <span className="font-medium text-slate-900">{item.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                          )}
                        </button>
                        {isOpen && (
                          <p 
                            id={`answer-${catIdx}-${qIdx}`}
                            className="mt-3 text-slate-600 pl-2"
                          >
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-10 bg-gradient-to-br from-[#1B3A5F] to-[#2a5a8f] text-white">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Still Have Questions?</h2>
              <p className="text-blue-100 mb-6">Our support team is here to help</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <a 
                  href="mailto:support@earnedit.com"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
                >
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  <span>support@earnedit.com</span>
                </a>
                <a 
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Contact Form</span>
                </a>
                <a 
                  href="tel:+18005551234"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-colors"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  <span>1-800-555-1234</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
