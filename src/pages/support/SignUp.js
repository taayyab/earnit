import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  Target, 
  Shield,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SIGNUP_STEPS = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Sign up with your email address to get started.',
    details: [
      'Enter your email and create a secure password',
      'Verify your email address',
      'Optional: Enable multi-factor authentication for extra security'
    ]
  },
  {
    step: 2,
    title: 'Verify Your Identity (Optional)',
    description: 'Connect with ID.me to verify your veteran status for enhanced features.',
    details: [
      'Click "Verify with ID.me" in your account settings',
      'Complete the ID.me verification process',
      'Unlocks VA health records import and premium features'
    ]
  },
  {
    step: 3,
    title: 'Upload Your Documents',
    description: 'Upload your DD-214 and medical records to start your claim.',
    details: [
      'Upload your DD-214 (Certificate of Release or Discharge)',
      'Add any medical records, treatment notes, or service records',
      'Our AI will analyze your documents automatically'
    ]
  },
  {
    step: 4,
    title: 'Review AI Analysis',
    description: 'Review the conditions our AI identified from your documents.',
    details: [
      'See all identified medical conditions mapped to VA codes',
      'Review evidence strength for each condition',
      'Confirm or modify the AI findings'
    ]
  },
  {
    step: 5,
    title: 'Follow Your Roadmap',
    description: 'Get a personalized path to a complete, ready-to-submit claim.',
    details: [
      'View exactly what evidence is needed for each condition',
      'Track your progress with completion percentages',
      'Access templates and guidance for missing evidence'
    ]
  }
];

export default function SignUp() {
  const navigate = useNavigate();

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
          <div className="w-16 h-16 bg-gradient-to-br from-[#1B3A5F] to-[#2a5a8f] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-[#1B3A5F]">How to Sign Up for EarnedIT</h1>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            Getting started is easy. Follow these steps to begin your VA disability claims journey.
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-green-900">Try Demo Mode First</h2>
                <p className="text-sm text-green-700">
                  Want to explore before signing up? Click "Try Demo" on our homepage for instant access 
                  to a pre-populated demo account with sample data.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="bg-green-600 hover:bg-green-700 ml-auto flex-shrink-0"
              >
                Try Demo
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {SIGNUP_STEPS.map((item, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="flex">
                <div className="w-20 bg-[#1B3A5F] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-10">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1B3A5F]" aria-hidden="true" />
              What You'll Need
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Required Documents</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#1B3A5F]" aria-hidden="true" />
                    DD-214 (Certificate of Release or Discharge)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Recommended Documents</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Medical records and treatment notes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Service treatment records
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    VA medical center records
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Private doctor statements
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 text-center">
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-[#1B3A5F] hover:bg-[#0F2A4A] px-8"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
          <p className="text-sm text-slate-500 mt-3">
            Get started with AI-powered claims assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
