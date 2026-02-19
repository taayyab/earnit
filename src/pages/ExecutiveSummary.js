import React from 'react';
import { Button } from '../components/ui/button';
import { Download, TrendingUp, Users, Shield, Brain, Zap, CheckCircle2, Target, DollarSign, Award } from 'lucide-react';
import logoImage from '../assets/logo.webp';

export default function ExecutiveSummary() {
  const handleDownload = () => {
    window.open('/api/marketing/executive-summary/download', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Screen-only download button */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={handleDownload} className="gap-2 bg-[#1B3A5F] hover:bg-[#0f2340]">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Print-optimized document */}
      <div className="max-w-4xl mx-auto px-8 py-12 print:px-12 print:py-8">
        
        {/* Header / Cover */}
        <header className="text-center mb-12 pb-8 border-b-4 border-[#1B3A5F]">
          <img src={logoImage} alt="EarnedIT" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#1B3A5F] mb-2">EarnedIT</h1>
          <p className="text-xl text-[#B22234] font-semibold mb-4">AI-Powered VA Disability Claims Platform</p>
          <div className="inline-block bg-slate-100 px-6 py-2 rounded-full">
            <p className="text-sm text-slate-600 font-medium">Executive Summary | Seed Round: $2.5M</p>
          </div>
        </header>

        {/* Company Summary */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Company Summary</h2>
          </div>
          
          <div className="bg-red-50 border-l-4 border-[#B22234] p-4 mb-4">
            <p className="text-lg font-semibold text-[#B22234]">The Problem</p>
            <p className="text-slate-700">Over 70% of initial VA disability claims are denied or underrated. Veterans face a 125+ day average processing time, with 500,000+ claims backlogged at any given time. The result: billions in earned benefits go unclaimed due to missing evidence, complex bureaucracy, and lack of guidance.</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-[#1B3A5F] p-4 mb-4">
            <p className="text-lg font-semibold text-[#1B3A5F]">The Solution</p>
            <p className="text-slate-700">EarnedIT is an AI-powered platform that streamlines VA disability claims from intake to submission. Our technology automatically extracts conditions from medical records, scores nexus letters against VA requirements, pre-fills 20+ Disability Benefits Questionnaires, calculates back pay, and provides a 5-stage pre-submission quality assurance engine—all while maintaining HIPAA compliance with AES-256-GCM encryption.</p>
          </div>
          
          <p className="text-slate-700"><strong>Target Customers:</strong> U.S. veterans filing disability claims, Veteran Service Organizations (VSOs), accredited claims agents, and healthcare providers supporting veteran patients. Our B2B2C model serves veterans directly while licensing our platform to partner organizations.</p>
        </section>

        {/* Customer Analysis */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Customer Analysis</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-[#1B3A5F]">18M+</p>
              <p className="text-sm text-slate-600">Living U.S. veterans</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-[#1B3A5F]">2M+</p>
              <p className="text-sm text-slate-600">Claims processed annually by VA</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-[#B22234]">70%</p>
              <p className="text-sm text-slate-600">Initial claims denied or underrated</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-3xl font-bold text-[#D4A574]">$Billions</p>
              <p className="text-sm text-slate-600">In unclaimed benefits annually</p>
            </div>
          </div>
          
          <p className="text-slate-700 mb-2"><strong>Primary Segments:</strong></p>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li><strong>Veterans (B2C):</strong> First-time filers, those with denied claims, veterans seeking rating increases</li>
            <li><strong>VSOs & Claims Agents (B2B):</strong> Organizations needing modern tools to serve more veterans efficiently</li>
            <li><strong>Healthcare Providers:</strong> VA and civilian providers completing DBQs and nexus letters</li>
          </ul>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Market Validation
            </p>
            <p className="text-slate-700 text-sm">Platform built with 13 VA Lighthouse API integrations, 76+ automated tests, and full HIPAA compliance verified. Growing demand for digital-first claims solutions as VA modernizes.</p>
          </div>
        </section>

        {/* Page break for print */}
        <div className="print:page-break-after-always" />

        {/* Market Analysis */}
        <section className="mb-10 print:pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Market Analysis</h2>
          </div>
          
          <div className="flex items-end justify-center gap-8 my-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[#1B3A5F] flex items-center justify-center mx-auto mb-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">$4.2B</p>
                  <p className="text-xs text-white/80">TAM</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-24">Total VA claims assistance market</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#B22234] flex items-center justify-center mx-auto mb-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">$1.8B</p>
                  <p className="text-xs text-white/80">SAM</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-24">Digital-first claims assistance</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#D4A574] flex items-center justify-center mx-auto mb-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">$180M</p>
                  <p className="text-[10px] text-white/80">SOM</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-24">SaaS for VSOs & agents</p>
            </div>
          </div>
          
          <p className="text-slate-700"><strong>Target Market Share:</strong> Capture 2-5% of the serviceable market within 5 years through strategic partnerships with VSOs and direct veteran acquisition, representing $36M-$90M in annual revenue potential.</p>
        </section>

        {/* Product & Technology */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Product & Technology</h2>
          </div>
          
          <p className="text-slate-700 mb-4">EarnedIT is a fully functional platform currently in beta, built on a modern tech stack designed for security, scalability, and AI integration.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-slate-200 p-4 rounded-lg">
              <p className="font-semibold text-[#1B3A5F] mb-2">AI-Powered Features</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Document analysis & condition extraction</li>
                <li>• Nexus letter quality scoring (5 components)</li>
                <li>• DBQ pre-fill (20+ condition-specific forms)</li>
                <li>• Back pay calculator (2015-2024 VA rates)</li>
                <li>• RAG-powered claims advisor chatbot</li>
              </ul>
            </div>
            <div className="border border-slate-200 p-4 rounded-lg">
              <p className="font-semibold text-[#1B3A5F] mb-2">Platform Capabilities</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• 13 VA Lighthouse API integrations</li>
                <li>• 5-stage pre-submission QA engine</li>
                <li>• Deadline tracking with automated reminders</li>
                <li>• Peer mentor matching system</li>
                <li>• Partner organization management</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-[#1B3A5F] text-white p-4 rounded-lg">
            <p className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" /> Security & Compliance
            </p>
            <p className="text-sm text-white/90">HIPAA compliant with AES-256-GCM encryption for all PHI. Immutable audit logging, session management, and full compliance with 38 CFR 14.636 fee regulations. 76+ automated tests ensure platform reliability.</p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Intellectual Property</h2>
          </div>
          
          <p className="text-slate-700">EarnedIT's competitive moat is built on proprietary technology rather than patents:</p>
          <ul className="list-disc list-inside text-slate-700 space-y-1 mt-2">
            <li><strong>Proprietary AI Models:</strong> Custom-trained models for VA-specific document analysis, condition extraction, and nexus letter evaluation</li>
            <li><strong>VA API Integration Library:</strong> Deep integration with 13 VA Lighthouse APIs, representing significant development investment</li>
            <li><strong>38 CFR Part 4 Knowledge Base:</strong> Comprehensive database mapping conditions to VA diagnostic codes and rating criteria</li>
            <li><strong>Trade Secrets:</strong> Proprietary algorithms for approval readiness scoring and back pay calculation</li>
          </ul>
        </section>

        {/* Page break for print */}
        <div className="print:page-break-after-always" />

        {/* Competitive Differentiation */}
        <section className="mb-10 print:pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Competitive Differentiation</h2>
          </div>
          
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#1B3A5F] text-white">
                  <th className="p-3 text-left">Competitor</th>
                  <th className="p-3 text-left">Weakness</th>
                  <th className="p-3 text-left">EarnedIT Advantage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Traditional VSOs</td>
                  <td className="p-3 text-slate-600">Manual processes, limited technology</td>
                  <td className="p-3 text-green-700">AI automation, 10x faster processing</td>
                </tr>
                <tr className="border-b bg-slate-50">
                  <td className="p-3 font-medium">Claims Agents</td>
                  <td className="p-3 text-slate-600">Expensive, variable quality</td>
                  <td className="p-3 text-green-700">Consistent AI quality, lower cost</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">DIY Online Tools</td>
                  <td className="p-3 text-slate-600">Overwhelming, error-prone</td>
                  <td className="p-3 text-green-700">Guided experience with QA checks</td>
                </tr>
                <tr className="border-b bg-slate-50">
                  <td className="p-3 font-medium">Generic Legal Tech</td>
                  <td className="p-3 text-slate-600">Not specialized for VA claims</td>
                  <td className="p-3 text-green-700">Purpose-built for VA ecosystem</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-[#D4A574]/20 border border-[#D4A574] p-4 rounded-lg">
            <p className="font-semibold text-[#1B3A5F]">Key Differentiators</p>
            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
              <div><strong>AI-First:</strong> Document analysis, scoring, pre-fill</div>
              <div><strong>Compliance:</strong> HIPAA + 38 CFR 14.636 built-in</div>
              <div><strong>Integration:</strong> 13 VA APIs for real-time data</div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Leadership Team</h2>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1B3A5F] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                OG
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1B3A5F]">Odie Gray</h3>
                <p className="text-[#B22234] font-medium mb-2">Founder & CEO</p>
                <p className="text-slate-700 text-sm mb-3">
                  U.S. Army veteran with nearly 20 years of cybersecurity experience specializing in critical infrastructure defense, risk management, and compliance. Former technology consultant who built and led teams protecting sensitive systems.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <strong>Veteran Advocate:</strong> Founded Diversity Cyber Council, a 501(c)(3) nonprofit that has trained 70+ professionals and received $75,000 grant from State Street</li>
                  <li>• <strong>Technical Expertise:</strong> CompTIA Security+ certified, 17+ years in information security</li>
                  <li>• <strong>Entrepreneurial Track Record:</strong> Founders Institute of New York graduate, IVMF programs at Syracuse University</li>
                  <li>• <strong>Why EarnedIT:</strong> Personal understanding of veteran challenges combined with deep technical and compliance expertise positions Odie to build a platform that truly serves those who served</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Page break for print */}
        <div className="print:page-break-after-always" />

        {/* Financials */}
        <section className="mb-10 print:pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B3A5F] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Financial Projections</h2>
          </div>
          
          <p className="text-slate-700 mb-4">Conservative 5-year projections based on SaaS + fee-based revenue model:</p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-[#1B3A5F] text-white">
                  <th className="p-3 text-left border border-slate-300">Metric</th>
                  <th className="p-3 text-right border border-slate-300">Year 1</th>
                  <th className="p-3 text-right border border-slate-300">Year 2</th>
                  <th className="p-3 text-right border border-slate-300">Year 3</th>
                  <th className="p-3 text-right border border-slate-300">Year 4</th>
                  <th className="p-3 text-right border border-slate-300">Year 5</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium border border-slate-300">Partner Organizations</td>
                  <td className="p-3 text-right border border-slate-300">15</td>
                  <td className="p-3 text-right border border-slate-300">50</td>
                  <td className="p-3 text-right border border-slate-300">80</td>
                  <td className="p-3 text-right border border-slate-300">150</td>
                  <td className="p-3 text-right border border-slate-300">250</td>
                </tr>
                <tr className="border-b bg-slate-50">
                  <td className="p-3 font-medium border border-slate-300">Veterans Served</td>
                  <td className="p-3 text-right border border-slate-300">1,000</td>
                  <td className="p-3 text-right border border-slate-300">5,000</td>
                  <td className="p-3 text-right border border-slate-300">12,000</td>
                  <td className="p-3 text-right border border-slate-300">35,000</td>
                  <td className="p-3 text-right border border-slate-300">75,000</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium border border-slate-300">Revenue</td>
                  <td className="p-3 text-right border border-slate-300">$350K</td>
                  <td className="p-3 text-right border border-slate-300">$1.5M</td>
                  <td className="p-3 text-right border border-slate-300">$3.2M</td>
                  <td className="p-3 text-right border border-slate-300">$8.5M</td>
                  <td className="p-3 text-right border border-slate-300">$18M</td>
                </tr>
                <tr className="border-b bg-slate-50">
                  <td className="p-3 font-medium border border-slate-300">Gross Margin</td>
                  <td className="p-3 text-right border border-slate-300">65%</td>
                  <td className="p-3 text-right border border-slate-300">70%</td>
                  <td className="p-3 text-right border border-slate-300">75%</td>
                  <td className="p-3 text-right border border-slate-300">78%</td>
                  <td className="p-3 text-right border border-slate-300">80%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium border border-slate-300">Net Income</td>
                  <td className="p-3 text-right text-red-600 border border-slate-300">($1.2M)</td>
                  <td className="p-3 text-right text-red-600 border border-slate-300">($350K)</td>
                  <td className="p-3 text-right border border-slate-300">$320K</td>
                  <td className="p-3 text-right border border-slate-300">$1.7M</td>
                  <td className="p-3 text-right border border-slate-300">$5.4M</td>
                </tr>
                <tr className="bg-[#1B3A5F]/10">
                  <td className="p-3 font-bold border border-slate-300">Cumulative Cash Flow</td>
                  <td className="p-3 text-right font-medium border border-slate-300">($1.2M)</td>
                  <td className="p-3 text-right font-medium border border-slate-300">($1.55M)</td>
                  <td className="p-3 text-right font-medium border border-slate-300">($1.23M)</td>
                  <td className="p-3 text-right font-medium border border-slate-300">$470K</td>
                  <td className="p-3 text-right font-bold text-green-700 border border-slate-300">$5.87M</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">Year 3</p>
              <p className="text-sm text-slate-600">Path to Profitability</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-[#1B3A5F]">100x</p>
              <p className="text-sm text-slate-600">Revenue Growth (Y1→Y5)</p>
            </div>
            <div className="bg-[#D4A574]/20 p-4 rounded-lg border border-[#D4A574]">
              <p className="text-2xl font-bold text-[#B22234]">80%</p>
              <p className="text-sm text-slate-600">Target Gross Margin</p>
            </div>
          </div>
        </section>

        {/* Investment */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#B22234] flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B3A5F]">Investment Opportunity</h2>
          </div>
          
          <div className="bg-gradient-to-r from-[#1B3A5F] to-[#2a4d73] text-white p-6 rounded-lg mb-6">
            <div className="text-center mb-4">
              <p className="text-lg opacity-80">Seed Round</p>
              <p className="text-4xl font-bold">$2,500,000</p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-2xl font-bold">35%</p>
                <p className="text-xs opacity-80">Engineering & AI</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-2xl font-bold">20%</p>
                <p className="text-xs opacity-80">Compliance & Security</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-2xl font-bold">25%</p>
                <p className="text-xs opacity-80">Sales & Partners (Houston pilot + expansion)</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-2xl font-bold">10%</p>
                <p className="text-xs opacity-80">Operations</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-2xl font-bold">10%</p>
                <p className="text-xs opacity-80">Working Capital</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-lg">
              <p className="font-semibold text-[#1B3A5F] mb-2">Use of Funds</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Scale AI infrastructure and model training</li>
                <li>• Obtain SOC 2 Type II certification</li>
                <li>• Expand VA API integrations to full production access</li>
                <li>• Build sales team for VSO partnerships (Houston pilot → national expansion)</li>
                <li>• Launch mobile application (iOS + Android)</li>
                <li>• 90-day Houston pilot program execution</li>
                <li>• VA Lighthouse API production access certification</li>
              </ul>
            </div>
            <div className="border border-slate-200 p-4 rounded-lg">
              <p className="font-semibold text-[#1B3A5F] mb-2">Key Milestones (18 months)</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Complete 90-day Houston pilot with 5+ VSO partners</li>
                <li>• 50+ partner organizations onboarded</li>
                <li>• 5,000+ veterans served</li>
                <li>• $1.5M ARR achieved</li>
                <li>• Mobile app launched</li>
                <li>• Series A readiness ($15M+ target)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-[#1B3A5F] pt-6 mt-12 text-center">
          <img src={logoImage} alt="EarnedIT" className="h-12 w-auto mx-auto mb-2" />
          <p className="text-[#1B3A5F] font-semibold">EarnedIT</p>
          <p className="text-slate-600 text-sm">Helping veterans get the benefits they earned</p>
          <p className="text-slate-500 text-sm mt-2">support@earnedit.ai | www.earnedit.ai</p>
          <p className="text-slate-400 text-xs mt-4">Founded October 2025 | Houston, TX</p>
        </footer>

      </div>
    </div>
  );
}
