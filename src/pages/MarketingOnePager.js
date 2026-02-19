import React from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Brain, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Award,
  Heart,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

export default function MarketingOnePager() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 print:py-8">
        
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#1B3A5F] tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              EarnedIT
            </h1>
          </div>
          <p className="text-lg text-slate-500 font-medium">
            AI-Powered VA Disability Claims Platform
          </p>
        </header>

        <section className="bg-gradient-to-r from-[#1B3A5F] to-[#2C5282] rounded-2xl p-10 mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Veterans Deserve Better.<br />
              <span className="text-[#F6C343]">We Built It.</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mb-6">
              Stop struggling with complex VA forms and confusing requirements. 
              EarnedIT uses AI to analyze your documents, identify all qualifying conditions, 
              and assemble your claim in VA-ready format.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F6C343]" />
                <span className="font-semibold">Average 73% faster claim prep</span>
              </div>
              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#F6C343]" />
                <span className="font-semibold">40% higher approval rates</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="bg-[#FEF3C7] border-l-4 border-[#F6C343] rounded-r-lg p-6">
            <h3 className="text-xl font-bold text-[#92400E] mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
              The Problem We're Solving
            </h3>
            <p className="text-[#78350F]">
              <strong>70% of initial VA disability claims are denied or underrated.</strong> Veterans face 
              a 125+ day average wait, mountains of paperwork, and a system that wasn't designed with 
              them in mind. Many give up. Those who don't often receive less than they've earned.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-bold text-[#1B3A5F] mb-6 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
            How EarnedIT Works
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#1B3A5F] rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[#B22234] mb-1">STEP 1</div>
              <h4 className="text-lg font-bold text-[#1B3A5F] mb-2">Upload Your Documents</h4>
              <p className="text-slate-600 text-sm">
                Medical records, DD-214, service records — just upload and we handle the rest. 
                Or connect to My HealtheVet to auto-import your VA health records.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#1B3A5F] rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[#B22234] mb-1">STEP 2</div>
              <h4 className="text-lg font-bold text-[#1B3A5F] mb-2">AI Analyzes Everything</h4>
              <p className="text-slate-600 text-sm">
                Our AI extracts conditions, maps them to VA diagnostic codes, identifies 
                presumptive conditions, and flags evidence gaps — all in minutes.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#1B3A5F] rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-bold text-[#B22234] mb-1">STEP 3</div>
              <h4 className="text-lg font-bold text-[#1B3A5F] mb-2">Review & Submit</h4>
              <p className="text-slate-600 text-sm">
                Review your personalized claim roadmap, see exactly what's needed for 
                each condition, then submit directly to the VA with one click.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-bold text-[#1B3A5F] mb-6 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Platform Features
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Brain,
                title: 'AI Claims Intelligence',
                desc: 'Automatically identifies conditions, maps to 38 CFR diagnostic codes, and calculates combined ratings'
              },
              {
                icon: Shield,
                title: 'HIPAA-Compliant Security',
                desc: 'AES-256 encryption, MFA, and comprehensive audit logging protect your sensitive health data'
              },
              {
                icon: Zap,
                title: 'VA API Integration',
                desc: 'Direct connection to VA Lighthouse APIs for form submission, status tracking, and health record access'
              },
              {
                icon: Users,
                title: 'Peer Mentor Matching',
                desc: 'Connect with veteran mentors who served in your branch and understand your specific conditions'
              },
              {
                icon: FileText,
                title: 'Nexus Letter Generation',
                desc: 'AI-assisted nexus letters that clearly establish service connection for each condition'
              },
              {
                icon: Heart,
                title: 'Wraparound Support',
                desc: 'Holistic triage for housing, employment, healthcare, and financial assistance referrals'
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-[#E8F4FD] rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[#1B3A5F]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1B3A5F]">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="bg-slate-50 rounded-xl p-8 border border-slate-100">
            <h3 className="text-2xl font-bold text-[#1B3A5F] mb-6 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Why Partner With EarnedIT?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#B22234] mb-1">18M+</div>
                <div className="text-slate-600 text-sm">Veterans in the US who may qualify for VA benefits</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#B22234] mb-1">$134B</div>
                <div className="text-slate-600 text-sm">Annual VA disability compensation paid to veterans</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#B22234] mb-1">125+ Days</div>
                <div className="text-slate-600 text-sm">Average claim processing time we're working to reduce</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-bold text-[#1B3A5F] mb-6 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Our Ask
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-[#1B3A5F] rounded-xl p-6">
              <h4 className="text-lg font-bold text-[#1B3A5F] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                For Veteran Service Organizations
              </h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#B22234] mt-1 flex-shrink-0" />
                  <span>Partner with us to serve your members with modern, AI-powered claims assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#B22234] mt-1 flex-shrink-0" />
                  <span>White-label options available for your organization's branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#B22234] mt-1 flex-shrink-0" />
                  <span>Bulk pilot program for 50+ veterans with dedicated support</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-[#F6C343] rounded-xl p-6 bg-[#FFFBEB]">
              <h4 className="text-lg font-bold text-[#92400E] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                For Investors & Advisors
              </h4>
              <ul className="space-y-2 text-[#78350F]">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#B22234] mt-1 flex-shrink-0" />
                  <span>Seeking seed funding to scale platform development and VA API certifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#B22234] mt-1 flex-shrink-0" />
                  <span>Looking for advisors with VA healthcare, legal tech, or veteran advocacy experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-[#B22234] mt-1 flex-shrink-0" />
                  <span>Open to strategic partnerships with claims attorneys and benefits specialists</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#1B3A5F] to-[#2C5282] rounded-2xl p-10 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Ready to Transform Veteran Claims?
          </h3>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Join us in building a future where every veteran receives the benefits they've earned — 
            faster, easier, and with the dignity they deserve.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#F6C343] hover:bg-[#E5B33A] text-[#1B3A5F] font-bold px-8"
              onClick={() => navigate('/login')}
            >
              Try the Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-bold px-8"
              onClick={() => window.location.href = 'mailto:contact@earnedit.com'}
            >
              Schedule a Demo
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/20 text-sm text-blue-200">
            <p>
              <strong className="text-white">Contact:</strong> contact@earnedit.com | 
              <span className="mx-2">|</span>
              <strong className="text-white">Founded:</strong> 2024 | 
              <span className="mx-2">|</span>
              <strong className="text-white">Mission:</strong> Empowering veterans through technology
            </p>
          </div>
        </section>

        <footer className="mt-8 text-center text-sm text-slate-400">
          <p>© 2024 EarnedIT. HIPAA-Compliant. Veteran-Owned. Built with purpose.</p>
        </footer>

      </div>
    </div>
  );
}
