import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ChevronLeft, ChevronRight, Shield, FileText, Brain, Users, Target, TrendingUp, Award, Rocket, DollarSign, CheckCircle2, Zap, Lock, BarChart3, Clock, AlertTriangle, Download } from 'lucide-react';
import logoImage from '../assets/logo.webp';

const slides = [
  {
    id: 'title',
    type: 'title',
    content: {
      title: 'EarnedIT',
      subtitle: 'AI-Powered VA Disability Claims Platform',
      tagline: 'Helping veterans get the benefits they earned'
    }
  },
  {
    id: 'problem',
    type: 'problem',
    content: {
      title: 'The Problem',
      stats: [
        { value: '70%', label: 'of initial claims are denied or underrated' },
        { value: '125+ Days', label: 'average VA claim processing time' },
        { value: '500K+', label: 'claims backlog at any given time' },
        { value: '$Billions', label: 'in benefits veterans miss out on' }
      ],
      painPoints: [
        'Complex bureaucratic process overwhelms veterans',
        'Missing or insufficient evidence leads to denials',
        'Veterans lack guidance on medical documentation',
        'No visibility into claim status or deficiencies'
      ]
    }
  },
  {
    id: 'solution',
    type: 'solution',
    content: {
      title: 'Our Solution',
      subtitle: 'AI-powered claims assistance that maximizes veteran success',
      features: [
        { icon: Brain, title: 'AI Document Analysis', desc: 'Automatically extracts conditions and maps to VA diagnostic codes' },
        { icon: FileText, title: 'Nexus Letter Scoring', desc: 'AI evaluates letter quality against VA requirements' },
        { icon: Shield, title: 'Pre-Submission QA', desc: '5-stage quality assurance catches issues before filing' },
        { icon: Clock, title: 'Deadline Tracking', desc: 'Automated reminders for critical VA deadlines' },
        { icon: DollarSign, title: 'Back Pay Calculator', desc: 'Estimates retroactive benefits using VA rates 2015-2024' },
        { icon: Lock, title: 'HIPAA Compliant', desc: 'AES-256-GCM encryption protects veteran health data' }
      ]
    }
  },
  {
    id: 'market-validation',
    type: 'validation',
    content: {
      title: 'Market Validation',
      quote: '"Veterans deserve modern tools that simplify the claims process and protect their sensitive information."',
      points: [
        '18+ million living U.S. veterans',
        'VA processes 2+ million claims annually',
        'Growing demand for digital health solutions',
        'VSOs and claims agents need better tools',
        '76+ automated tests ensure platform reliability'
      ]
    }
  },
  {
    id: 'market-size',
    type: 'market',
    content: {
      title: 'Market Opportunity',
      tam: { value: '$4.2B', label: 'Total Addressable Market', desc: 'VA disability claims assistance market' },
      sam: { value: '$1.8B', label: 'Serviceable Market', desc: 'Digital-first claims assistance' },
      som: { value: '$180M', label: 'Obtainable Market', desc: 'SaaS platform for VSOs and agents' }
    }
  },
  {
    id: 'product',
    type: 'product',
    content: {
      title: 'Product Highlights',
      capabilities: [
        { icon: Brain, title: 'AI Document Parser', desc: 'Extracts conditions, treatments, and nexus statements from medical records' },
        { icon: FileText, title: 'DBQ Pre-Fill', desc: '20+ condition-specific forms auto-populated from records' },
        { icon: BarChart3, title: 'Nexus Scoring', desc: '5-component analysis with improvement suggestions' },
        { icon: Shield, title: 'Evidence Guidance', desc: 'Personalized checklists based on claim type' },
        { icon: Users, title: 'Veteran Advocate Support', desc: 'Tiered veteran advocate system with consent management' },
        { icon: Zap, title: '13 VA APIs', desc: 'Full integration with VA Lighthouse ecosystem' }
      ]
    }
  },
  {
    id: 'business-model',
    type: 'business',
    content: {
      title: 'Business Model',
      subtitle: 'Fully compliant with 38 CFR 14.636',
      models: [
        { title: 'SaaS Platform Fees', desc: 'Monthly licensing for VSOs and partner organizations', icon: Users },
        { title: 'Contingency Fees', desc: 'VA-compliant fees on appeals and supplemental claims only', icon: DollarSign },
        { title: 'Enterprise Licensing', desc: 'Custom deployments for large organizations', icon: Target }
      ],
      note: 'No fees for original claims (per federal law)'
    }
  },
  {
    id: 'competition',
    type: 'competition',
    content: {
      title: 'Competitive Landscape',
      competitors: [
        { name: 'Traditional VSOs', weakness: 'Manual processes, limited technology' },
        { name: 'Claims Agents', weakness: 'Expensive, variable quality' },
        { name: 'DIY Online', weakness: 'Overwhelming, error-prone' },
        { name: 'Generic Legal Tech', weakness: 'Not specialized for VA claims' }
      ],
      ourAdvantage: 'EarnedIT combines AI analysis, HIPAA security, and VA API integration in one platform'
    }
  },
  {
    id: 'advantages',
    type: 'advantages',
    content: {
      title: 'Competitive Advantages',
      advantages: [
        { icon: Brain, title: 'AI-First Architecture', desc: 'Document analysis, nexus scoring, condition extraction' },
        { icon: Lock, title: 'Security Built-In', desc: 'HIPAA compliant with AES-256-GCM encryption' },
        { icon: Zap, title: 'Deep VA Integration', desc: '13 VA Lighthouse APIs for real-time data' },
        { icon: CheckCircle2, title: 'Quality Assurance', desc: '5-stage pre-submission QA engine' },
        { icon: Users, title: 'Full Ecosystem', desc: 'Peer support, partner orgs, case management' },
        { icon: Award, title: 'Compliance First', desc: '38 CFR 14.636 fee structure baked in' }
      ]
    }
  },
  {
    id: 'milestones',
    type: 'milestones',
    content: {
      title: 'Milestones & Roadmap',
      achieved: [
        'Full-stack React/FastAPI platform with HIPAA encryption',
        '13 VA API integrations operational',
        'AI: Document analysis, nexus scoring, DBQ pre-fill (20+ forms)',
        'Back pay calculator with 2015-2024 VA rates',
        '76+ automated tests ensuring reliability'
      ],
      roadmap: [
        { q: 'Q1 2025', item: 'Beta launch with pilot VSO partners' },
        { q: 'Q2 2025', item: 'Mobile app and expanded AI capabilities' },
        { q: 'Q3 2025', item: 'Enterprise tier and additional VA integrations' },
        { q: 'Q4 2025', item: 'Scale to 50+ partner organizations' }
      ]
    }
  },
  {
    id: 'ask',
    type: 'ask',
    content: {
      title: 'The Ask',
      amount: '$2.5M',
      round: 'Seed Round',
      allocation: [
        { percent: '35%', use: 'Engineering & AI Development' },
        { percent: '25%', use: 'Sales & Partners (Houston Pilot → National)' },
        { percent: '20%', use: 'HIPAA Compliance & Security' },
        { percent: '10%', use: 'Operations & Infrastructure' },
        { percent: '10%', use: 'Working Capital' }
      ],
      challenges: [
        '90-day Houston VSO pilot program',
        'VA Lighthouse API production access',
        'SOC 2 Type II certification',
        'National partner expansion'
      ]
    }
  },
  {
    id: 'closing',
    type: 'closing',
    content: {
      title: "Let's Connect",
      tagline: 'Help veterans get the benefits they earned',
      email: 'support@earnedit.ai',
      website: 'www.earnedit.ai',
      cta: 'Ready to transform veteran claims assistance?'
    }
  }
];

function TitleSlide({ content }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-12 py-8 bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <img src={logoImage} alt="EarnedIT" className="h-28 w-auto mb-6" />
      <h1 className="text-5xl font-bold text-[#1B3A5F] mb-3">{content.title}</h1>
      <p className="text-xl text-[#B22234] font-semibold mb-4">{content.subtitle}</p>
      <p className="text-lg text-slate-600 italic">{content.tagline}</p>
    </div>
  );
}

function ProblemSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-8 text-center">{content.title}</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {content.stats.map((stat, i) => (
          <Card key={i} className="bg-red-50 border-none">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-[#B22234]">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-[#1B3A5F] mb-4">Pain Points</h3>
        <ul className="space-y-3">
          {content.painPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#B22234] mt-0.5 flex-shrink-0" />
              <span className="text-lg text-slate-700">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SolutionSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-2 text-center">{content.title}</h2>
      <p className="text-lg text-slate-600 text-center mb-8">{content.subtitle}</p>
      <div className="grid grid-cols-3 gap-4 flex-1">
        {content.features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Card key={i} className="border border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#1B3A5F]">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#1B3A5F]">{feature.title}</h3>
                </div>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ValidationSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-8 text-center">{content.title}</h2>
      <Card className="bg-blue-50 border-none max-w-3xl mb-8">
        <CardContent className="p-8">
          <p className="text-xl text-[#1B3A5F] italic text-center">{content.quote}</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 max-w-2xl">
        {content.points.map((point, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span className="text-lg text-slate-700">{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-12 text-center">{content.title}</h2>
      <div className="flex items-end justify-center gap-8">
        <div className="text-center">
          <div className="w-48 h-48 rounded-full bg-[#1B3A5F] flex items-center justify-center mb-4 mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{content.tam.value}</p>
              <p className="text-sm text-white/80">{content.tam.label}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">{content.tam.desc}</p>
        </div>
        <div className="text-center">
          <div className="w-36 h-36 rounded-full bg-[#B22234] flex items-center justify-center mb-4 mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{content.sam.value}</p>
              <p className="text-xs text-white/80">{content.sam.label}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">{content.sam.desc}</p>
        </div>
        <div className="text-center">
          <div className="w-28 h-28 rounded-full bg-[#D4A574] flex items-center justify-center mb-4 mx-auto">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{content.som.value}</p>
              <p className="text-[10px] text-white/80">{content.som.label}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">{content.som.desc}</p>
        </div>
      </div>
    </div>
  );
}

function ProductSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-8 text-center">{content.title}</h2>
      <div className="grid grid-cols-3 gap-4 flex-1">
        {content.capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <Card key={i} className="border-2 border-[#1B3A5F]/10 hover:border-[#1B3A5F]/30 transition-colors">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-full bg-[#1B3A5F]/10 mb-3">
                  <Icon className="h-6 w-6 text-[#1B3A5F]" />
                </div>
                <h3 className="font-semibold text-[#1B3A5F] mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-600">{cap.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BusinessSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-2 text-center">{content.title}</h2>
      <p className="text-lg text-slate-600 text-center mb-10">{content.subtitle}</p>
      <div className="grid grid-cols-3 gap-6 mb-8 max-w-4xl">
        {content.models.map((model, i) => {
          const Icon = model.icon;
          return (
            <Card key={i} className="bg-gradient-to-br from-white to-slate-50 border-2 border-[#1B3A5F]/20">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-[#B22234] mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[#1B3A5F] text-lg mb-2">{model.title}</h3>
                <p className="text-sm text-slate-600">{model.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-sm text-[#B22234] font-medium">{content.note}</p>
    </div>
  );
}

function CompetitionSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-8 text-center">{content.title}</h2>
      <div className="grid grid-cols-2 gap-6 mb-8">
        {content.competitors.map((comp, i) => (
          <Card key={i} className="bg-slate-50 border-none">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-700 mb-2">{comp.name}</h3>
              <p className="text-sm text-red-600">{comp.weakness}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#1B3A5F] border-none">
        <CardContent className="p-6 text-center">
          <p className="text-lg text-white font-medium">{content.ourAdvantage}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AdvantagesSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-8 text-center">{content.title}</h2>
      <div className="grid grid-cols-3 gap-4 flex-1">
        {content.advantages.map((adv, i) => {
          const Icon = adv.icon;
          return (
            <Card key={i} className="bg-gradient-to-br from-[#1B3A5F] to-[#2a4d73] border-none">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-full bg-white/20 mb-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{adv.title}</h3>
                <p className="text-sm text-white/80">{adv.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MilestonesSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-6 text-center">{content.title}</h2>
      <div className="grid grid-cols-2 gap-8 flex-1">
        <div>
          <h3 className="text-xl font-semibold text-[#1B3A5F] mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" /> Achieved
          </h3>
          <ul className="space-y-3">
            {content.achieved.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Award className="h-4 w-4 text-[#D4A574] mt-1 flex-shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#1B3A5F] mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-[#B22234]" /> Roadmap
          </h3>
          <div className="space-y-4">
            {content.roadmap.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-sm font-bold text-[#1B3A5F] min-w-[70px]">{item.q}</span>
                <span className="text-sm text-slate-700">{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AskSlide({ content }) {
  return (
    <div className="h-full px-8 py-6 flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold text-[#1B3A5F] mb-2 text-center">{content.title}</h2>
      <p className="text-lg text-slate-600 mb-6">{content.round}</p>
      <div className="text-5xl font-bold text-[#B22234] mb-8">{content.amount}</div>
      <div className="grid grid-cols-4 gap-4 mb-8 max-w-4xl">
        {content.allocation.map((item, i) => (
          <Card key={i} className="bg-[#1B3A5F] border-none">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{item.percent}</p>
              <p className="text-xs text-white/80 mt-1">{item.use}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="max-w-2xl">
        <h3 className="text-sm font-semibold text-slate-500 mb-2 text-center">Key Challenges to Address</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {content.challenges.map((challenge, i) => (
            <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">{challenge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClosingSlide({ content }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-gradient-to-br from-[#1B3A5F] via-[#234567] to-[#2a4d73] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-24 h-24 border border-white rounded-full" />
      </div>
      
      <div className="relative z-10">
        <img src={logoImage} alt="EarnedIT" className="h-28 w-auto mb-6 mx-auto brightness-0 invert drop-shadow-lg" />
        
        <h1 className="text-5xl font-bold text-white mb-4">{content.title}</h1>
        
        <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto">{content.cta}</p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-md mx-auto border border-white/20">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4A574] flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <a href={`mailto:${content.email}`} className="text-xl font-semibold text-white hover:text-[#D4A574] transition-colors">
                {content.email}
              </a>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#B22234] flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">{content.website}</span>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-[#D4A574] font-semibold italic">"{content.tagline}"</p>
      </div>
    </div>
  );
}

function SlideRenderer({ slide }) {
  switch (slide.type) {
    case 'title': return <TitleSlide content={slide.content} />;
    case 'problem': return <ProblemSlide content={slide.content} />;
    case 'solution': return <SolutionSlide content={slide.content} />;
    case 'validation': return <ValidationSlide content={slide.content} />;
    case 'market': return <MarketSlide content={slide.content} />;
    case 'product': return <ProductSlide content={slide.content} />;
    case 'business': return <BusinessSlide content={slide.content} />;
    case 'competition': return <CompetitionSlide content={slide.content} />;
    case 'advantages': return <AdvantagesSlide content={slide.content} />;
    case 'milestones': return <MilestonesSlide content={slide.content} />;
    case 'ask': return <AskSlide content={slide.content} />;
    case 'closing': return <ClosingSlide content={slide.content} />;
    default: return null;
  }
}

function PrintAllSlides() {
  return (
    <div className="hidden print:block">
      {slides.map((slide, index) => (
        <div 
          key={slide.id} 
          className="print-slide"
          style={{ 
            pageBreakAfter: index < slides.length - 1 ? 'always' : 'auto',
            height: '100vh',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <SlideRenderer slide={slide} />
        </div>
      ))}
    </div>
  );
}

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = React.useRef(null);

  const nextSlide = React.useCallback(() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1)), []);
  const prevSlide = React.useCallback(() => setCurrentSlide((prev) => Math.max(prev - 1, 0)), []);

  const handleDownload = () => {
    window.print();
  };

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  }, [nextSlide, prevSlide]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Pitch deck presentation"
      aria-roledescription="presentation"
      className="min-h-screen bg-white flex flex-col outline-none"
    >
      <PrintAllSlides />
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 print:hidden">
        <Card className="flex-1 border-2 border-slate-200 overflow-hidden" role="region" aria-live="polite">
          <CardContent className="p-0 h-full min-h-[600px]">
            <SlideRenderer slide={slides[currentSlide]} />
          </CardContent>
        </Card>
        
        <nav className="flex items-center justify-between mt-4 px-4" aria-label="Slide navigation">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
            aria-label="Go to previous slide"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </Button>
          
          <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                role="tab"
                aria-selected={i === currentSlide}
                aria-label={`Go to slide ${i + 1}: ${slide.content.title || 'Title'}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? 'bg-[#1B3A5F]' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="gap-2"
            aria-label="Go to next slide"
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
        
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-sm text-slate-500" aria-live="polite">
            Slide {currentSlide + 1} of {slides.length} • Use arrow keys to navigate
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2 print:hidden"
            aria-label="Download pitch deck as PDF"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
