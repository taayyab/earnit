import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import logoImage from '../assets/logo.webp';
import {
  TrendingUp,
  Users,
  Shield,
  Brain,
  Target,
  DollarSign,
  CheckCircle2,
  Award,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  BarChart3,
  FileText,
  Zap,
  Clock,
  Lock
} from 'lucide-react';

export default function InvestorLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-br from-[#1B3A5F] via-[#1B3A5F] to-[#2C5282] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#D4A574]/10 rounded-full" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="EarnedIT" className="h-12 w-auto" />
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Chivo, sans-serif' }}>EarnedIT</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/demo-login')}>
                Live Demo
              </Button>
              <Button className="bg-[#D4A574] hover:bg-[#c49564] text-[#1B3A5F] font-semibold" onClick={() => navigate('/pitch-deck')}>
                View Pitch Deck
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6">
                <MapPin className="h-4 w-4 text-[#F6C343]" />
                <span>90-Day Houston Pilot Launching Q2 2026</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Chivo, sans-serif' }}>
                AI-Powered VA Claims.{' '}
                <span className="text-[#F6C343]">$4.2B Market.</span>
              </h1>

              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                EarnedIT automates the VA disability claims process, turning months of paperwork into days.
                We're raising <span className="font-bold text-white">$2.5M</span> to scale our platform
                and launch our Houston VSO pilot.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl">
                  <p className="text-3xl font-bold text-[#F6C343]">73%</p>
                  <p className="text-sm text-blue-100">Faster claim prep</p>
                </div>
                <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl">
                  <p className="text-3xl font-bold text-[#F6C343]">40%</p>
                  <p className="text-sm text-blue-100">Higher approval rates</p>
                </div>
                <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-xl">
                  <p className="text-3xl font-bold text-[#F6C343]">13</p>
                  <p className="text-sm text-blue-100">VA API integrations</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold mb-6 text-center">Seed Round: $2.5M</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Engineering & AI</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/20 rounded-full h-2">
                      <div className="bg-[#F6C343] h-2 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <span className="font-semibold w-12 text-right">35%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Sales & Partners</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/20 rounded-full h-2">
                      <div className="bg-[#D4A574] h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="font-semibold w-12 text-right">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Compliance & Security</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/20 rounded-full h-2">
                      <div className="bg-[#B22234] h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="font-semibold w-12 text-right">20%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Operations</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="font-semibold w-12 text-right">10%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Working Capital</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-white/20 rounded-full h-2">
                      <div className="bg-blue-300 h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="font-semibold w-12 text-right">10%</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/20 text-center">
                <Button className="w-full bg-[#F6C343] hover:bg-[#e5b232] text-[#1B3A5F] font-bold py-3" onClick={() => navigate('/executive-summary')}>
                  Read Full Executive Summary <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#FEF3C7] border-b border-[#F6C343]/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#92400E] mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>The Problem We're Solving</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#B22234] mb-2">70%</p>
              <p className="text-sm text-[#78350F]">Initial VA claims denied or underrated</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[#B22234] mb-2">125+</p>
              <p className="text-sm text-[#78350F]">Days average processing time</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[#B22234] mb-2">500K+</p>
              <p className="text-sm text-[#78350F]">Claims backlogged at VA</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[#B22234] mb-2">$Billions</p>
              <p className="text-sm text-[#78350F]">In unclaimed benefits annually</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B3A5F] mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
              VA-Compliant Revenue Model
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              SaaS-first architecture with contingency upside. Fully compliant with 38 CFR 14.636 fee regulations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-[#1B3A5F]/20 hover:border-[#1B3A5F] transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1B3A5F]">Partner SaaS Licenses</p>
                    <p className="text-xs text-green-600 font-semibold">PRIMARY REVENUE</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Basic (50 vets/mo)</span>
                    <span className="font-bold text-[#1B3A5F]">$500/mo</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Professional (500 vets/mo)</span>
                    <span className="font-bold text-[#1B3A5F]">$2,000/mo</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#1B3A5F]/10 rounded border border-[#1B3A5F]/20">
                    <span className="text-sm font-medium">Enterprise (unlimited)</span>
                    <span className="font-bold text-[#1B3A5F]">$5,000/mo</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Recurring monthly revenue. Year 1 target: 15 partners</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#D4A574]/20 hover:border-[#D4A574] transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A574] flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1B3A5F]">Accredited Agent Fees</p>
                    <p className="text-xs text-[#D4A574] font-semibold">SECONDARY REVENUE</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Per-client access fee</span>
                    <span className="font-bold text-[#1B3A5F]">$50-$150</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Back pay share</span>
                    <span className="font-bold text-[#1B3A5F]">10-15%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Upfront fees + contingency share. Year 1 target: 20-30 agents</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#B22234]/20 hover:border-[#B22234] transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#B22234] flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1B3A5F]">Veteran Direct</p>
                    <p className="text-xs text-[#B22234] font-semibold">TERTIARY REVENUE</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-sm font-medium text-green-700">Original claims</span>
                    <span className="font-bold text-green-700">FREE</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Appeals / Supplemental</span>
                    <span className="font-bold text-[#1B3A5F]">30% back pay</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Legally prohibited to charge for original claims (38 CFR 14.636)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#1B3A5F]/10 px-4 py-2 rounded-full text-sm text-[#1B3A5F] font-semibold mb-4">
              <MapPin className="h-4 w-4" />
              Houston, TX
            </div>
            <h2 className="text-3xl font-bold text-[#1B3A5F] mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
              90-Day Pilot Program
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Launching in Houston — home to the 2nd largest veteran population in the U.S.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1B3A5F] mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#B22234]" />
                Pilot Objectives
              </h3>
              <div className="space-y-4">
                {[
                  { metric: '5+ VSO Partners', desc: 'Onboard local veteran service organizations' },
                  { metric: '200+ Veterans', desc: 'Process claims through the platform' },
                  { metric: '85%+ Satisfaction', desc: 'Measure veteran and partner NPS' },
                  { metric: 'VA API Production', desc: 'Qualify for Lighthouse API production access' },
                  { metric: '$50K+ MRR', desc: 'Demonstrate revenue generation capability' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#1B3A5F]">{item.metric}</p>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1B3A5F] mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#D4A574]" />
                Timeline
              </h3>
              <div className="space-y-6">
                {[
                  { phase: 'Month 1', title: 'Foundation', tasks: 'Partner onboarding, staff training, VA API sandbox testing' },
                  { phase: 'Month 2', title: 'Operations', tasks: 'Live claims processing, feedback loops, API optimization' },
                  { phase: 'Month 3', title: 'Scale & Measure', tasks: 'Volume ramp, outcome tracking, national expansion prep' }
                ].map((phase, i) => (
                  <div key={i} className="relative pl-8 pb-2">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#1B3A5F] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    {i < 2 && <div className="absolute left-3 top-7 w-0.5 h-full bg-[#1B3A5F]/20" />}
                    <p className="text-sm text-[#B22234] font-semibold">{phase.phase}: {phase.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{phase.tasks}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1B3A5F] mb-8 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Platform Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'AI Claims Intelligence', items: ['Document analysis & condition extraction', 'Nexus letter quality scoring', '801 VA diagnostic codes mapped', 'Secondary condition discovery engine'] },
              { icon: Shield, title: 'Security & Compliance', items: ['AES-256-GCM encryption (HIPAA)', '38 CFR 14.636 fee compliance', 'Immutable audit logging', 'SOC 2 Type II (in progress)'] },
              { icon: Zap, title: 'VA Integration', items: ['13 VA Lighthouse APIs', '5-stage pre-submission QA', 'Benefits Intake API ready', 'Automated deadline tracking'] }
            ].map((section, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-6 border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#1B3A5F] rounded-lg flex items-center justify-center mb-4">
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1B3A5F] mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1B3A5F] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Financial Projections
          </h2>
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4 text-left font-semibold">Metric</th>
                  <th className="p-4 text-right font-semibold">Year 1</th>
                  <th className="p-4 text-right font-semibold">Year 2</th>
                  <th className="p-4 text-right font-semibold">Year 3</th>
                  <th className="p-4 text-right font-semibold">Year 5</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-blue-100">Partner Organizations</td>
                  <td className="p-4 text-right font-semibold">15</td>
                  <td className="p-4 text-right font-semibold">50</td>
                  <td className="p-4 text-right font-semibold">80</td>
                  <td className="p-4 text-right font-semibold">250</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-blue-100">Veterans Served</td>
                  <td className="p-4 text-right font-semibold">1,000</td>
                  <td className="p-4 text-right font-semibold">5,000</td>
                  <td className="p-4 text-right font-semibold">12,000</td>
                  <td className="p-4 text-right font-semibold">75,000</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-4 text-blue-100">Annual Revenue</td>
                  <td className="p-4 text-right font-semibold">$350K</td>
                  <td className="p-4 text-right font-semibold">$1.5M</td>
                  <td className="p-4 text-right font-semibold">$3.2M</td>
                  <td className="p-4 text-right font-semibold text-[#F6C343]">$18M</td>
                </tr>
                <tr>
                  <td className="p-4 text-blue-100">Gross Margin</td>
                  <td className="p-4 text-right font-semibold">65%</td>
                  <td className="p-4 text-right font-semibold">70%</td>
                  <td className="p-4 text-right font-semibold">75%</td>
                  <td className="p-4 text-right font-semibold text-[#F6C343]">80%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <p className="text-3xl font-bold text-[#F6C343]">$4.2B</p>
              <p className="text-sm text-blue-100 mt-1">Total Addressable Market</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <p className="text-3xl font-bold text-[#F6C343]">Year 3</p>
              <p className="text-sm text-blue-100 mt-1">Path to Profitability</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <p className="text-3xl font-bold text-[#F6C343]">100x</p>
              <p className="text-sm text-blue-100 mt-1">Revenue Growth (Y1→Y5)</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-5">
              <p className="text-3xl font-bold text-[#F6C343]">$15M+</p>
              <p className="text-sm text-blue-100 mt-1">Series A Target</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1B3A5F] mb-8 text-center" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Leadership
          </h2>
          <div className="max-w-2xl mx-auto bg-slate-50 rounded-2xl p-8 border">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-[#1B3A5F] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                OG
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1B3A5F]">Odie Gray</h3>
                <p className="text-[#B22234] font-medium mb-3">Founder & CEO</p>
                <p className="text-slate-600 text-sm mb-3">
                  U.S. Army veteran with nearly 20 years of cybersecurity experience. Founded Diversity Cyber Council
                  (501(c)(3), $75K grant from State Street, 70+ professionals trained). Founders Institute graduate,
                  CompTIA Security+ certified.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Army Veteran', 'Cybersecurity (17+ yrs)', 'Founders Institute', 'IVMF Syracuse'].map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-[#1B3A5F]/10 rounded-full text-xs text-[#1B3A5F] font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1B3A5F] mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
            See the Platform in Action
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Experience all 5 user roles with realistic demo data — veteran, advocate, agent, partner admin, and provider.
          </p>

          <div className="grid md:grid-cols-5 gap-4 mb-10">
            {[
              { role: 'Veteran', desc: 'File & track claims', icon: FileText },
              { role: 'Advocate', desc: 'Support veterans', icon: Users },
              { role: 'Agent', desc: 'Manage claim pipeline', icon: BarChart3 },
              { role: 'Partner', desc: 'Organization dashboard', icon: Building2 },
              { role: 'Provider', desc: 'Medical evaluations', icon: Shield }
            ].map((role, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
                <role.icon className="h-8 w-8 text-[#1B3A5F] mx-auto mb-2" />
                <p className="font-bold text-[#1B3A5F] text-sm">{role.role}</p>
                <p className="text-xs text-slate-500">{role.desc}</p>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="bg-[#1B3A5F] hover:bg-[#0f2340] text-white px-10 py-4 text-lg"
            onClick={() => navigate('/demo-login')}
          >
            Launch Live Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#1B3A5F] to-[#2C5282] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <img src={logoImage} alt="EarnedIT" className="h-16 w-auto mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Ready to Invest in Veterans?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            $2.5M Seed Round | Houston Pilot Q2 2026 | $4.2B Market Opportunity
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button size="lg" className="bg-[#F6C343] hover:bg-[#e5b232] text-[#1B3A5F] font-bold px-8" onClick={() => navigate('/executive-summary')}>
              Executive Summary
            </Button>
            <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/30 px-8" onClick={() => navigate('/pitch-deck')}>
              Pitch Deck
            </Button>
            <Button size="lg" className="bg-white/10 hover:bg-white/20 border border-white/30 px-8" onClick={() => navigate('/marketing')}>
              One-Pager
            </Button>
          </div>
          <div className="text-sm text-blue-200 space-y-1">
            <p>support@earnedit.ai | www.earnedit.ai</p>
            <p>Founded October 2025 | Houston, TX</p>
          </div>
        </div>
      </section>
    </div>
  );
}