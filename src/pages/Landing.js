import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PendingAccreditationBadge, AccreditationDisclaimer } from '../components/PendingAccreditationBadge';
import ExternalLinkWarning from '../components/ExternalLinkWarning';
import { Shield, FileText, Users, MessageSquare, CheckCircle2, Lock, UserCheck, Clock, Instagram, Facebook, Linkedin } from 'lucide-react';
import logoImage from '../assets/logo.webp';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'HIPAA-Compliant Security',
      description: 'Military-grade encryption protects your sensitive health information with full audit trails.',
      color: 'text-[hsl(var(--primary))]',
    },
    {
      icon: FileText,
      title: 'AI-Powered Claims Analysis',
      description: 'Advanced AI reviews your documents, maps conditions to VA codes, and identifies evidence gaps.',
      color: 'text-[hsl(var(--info))]',
    },
    {
      icon: Users,
      title: 'Peer Mentor Support',
      description: 'Connect with experienced veterans who understand your journey and can guide you through the process.',
      color: 'text-[hsl(var(--accent))]',
    },
    {
      icon: MessageSquare,
      title: 'Secure Communication',
      description: 'Encrypted messaging with mentors and claims agents ensures your privacy at every step.',
      color: 'text-[hsl(var(--success))]',
    },
  ];

  const process = [
    {
      step: '01',
      title: 'Secure Registration',
      description: 'Create your account with ID.me verification for maximum security and authenticity.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Guided Intake',
      description: 'Complete a simple questionnaire that helps us understand your service and conditions.',
      icon: FileText,
    },
    {
      step: '03',
      title: 'Document Upload',
      description: 'Securely upload your medical records, service documents, and supporting evidence.',
      icon: Lock,
    },
    {
      step: '04',
      title: 'AI Analysis',
      description: 'Our AI reviews your claim, identifies strengths, and highlights areas that need attention.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Pending Accreditation Banner */}
      <PendingAccreditationBadge variant="banner" />
      
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="EarnedIT" className="h-16 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#1B3A5F]">EarnedIT</h1>
                <p className="text-xs text-slate-500">Veteran Benefits Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                data-testid="nav-login-button"
                className="text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] min-h-[44px] min-w-[44px] px-3 sm:px-4"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/register')}
                data-testid="nav-register-button"
                className="bg-[hsl(var(--accent))] text-white hover:bg-[#8F1B29] min-h-[44px] min-w-[44px] px-4 sm:px-6"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50" data-testid="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[hsl(var(--foreground))] mb-6">
              Distinguished Claims Support for Every Veteran
            </h1>
            <p className="text-lg text-foreground/80 leading-relaxed mb-8 max-w-2xl mx-auto">
              AI Veteran Benefits Platform simplifies VA disability claims with secure intake, AI-powered analysis, peer mentor support, and accredited agent guidance. Get the benefits you've earned with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                data-testid="hero-get-started-button"
                className="bg-[hsl(var(--accent))] text-white hover:bg-[#8F1B29] hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150 min-h-[48px] px-6 sm:px-8 text-base sm:text-lg"
              >
                Start Your Claim
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                data-testid="hero-learn-more-button"
                className="text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] min-h-[48px] px-6 sm:px-8 text-base sm:text-lg"
              >
                How It Works
              </Button>
            </div>
          </div>
          
          {/* Feature Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200 text-center card-interactive">
              <div className="inline-flex p-3 rounded-full bg-blue-50 mb-3 sm:mb-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#1B3A5F]" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2 text-base sm:text-lg">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">Smart document review identifies conditions and strengthens your claim</p>
            </div>
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200 text-center card-interactive">
              <div className="inline-flex p-3 rounded-full bg-green-50 mb-3 sm:mb-4">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2 text-base sm:text-lg">Secure & Encrypted</h3>
              <p className="text-sm text-muted-foreground">Your data is protected with military-grade encryption</p>
            </div>
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-200 text-center card-interactive">
              <div className="inline-flex p-3 rounded-full bg-red-50 mb-3 sm:mb-4">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#C41E3A]" />
              </div>
              <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2 text-base sm:text-lg">Veteran-First Support</h3>
              <p className="text-sm text-muted-foreground">Peer mentors, AI guidance, and community resources for your journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-white" data-testid="features-section">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Built for Veterans, by Veterans
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              We understand the challenges you face. Our platform combines cutting-edge technology with human support to give you the best chance at success.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="bg-white border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  data-testid={`feature-card-${index}`}
                >
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <div className={`inline-flex p-3 rounded-xl bg-white border border-slate-200 ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white" data-testid="how-it-works-section">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[hsl(var(--foreground))] mb-4">
              Your Journey to Benefits
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Our streamlined process guides you from start to finish, ensuring nothing is missed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="relative"
                  data-testid={`process-step-${index}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-white text-xs font-bold">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-[2px] bg-[hsl(var(--border))]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-[hsl(var(--primary))] text-white" data-testid="cta-section">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Ready to Get the Benefits You've Earned?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of veterans who have successfully navigated their claims with AI Veteran Benefits Platform.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            data-testid="cta-register-button"
            className="bg-[hsl(var(--accent))] text-white hover:bg-[#8F1B29] hover:shadow-lg hover:-translate-y-[1px] transition-all duration-150 min-h-[48px] px-6 sm:px-8 text-base sm:text-lg"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8" data-testid="footer">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="AI Veteran Benefits Platform" className="h-16 w-auto" />
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--primary))]">EarnedIT</p>
                <p className="text-xs text-muted-foreground">© 2026 All rights reserved</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link 
                to="/faq" 
                className="text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="mt-6 flex justify-center items-center gap-4 sm:gap-6">
            <ExternalLinkWarning 
              href="https://www.instagram.com/vetsearnedit"
              className="text-muted-foreground hover:text-[hsl(var(--accent))] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              showIcon={false}
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-8 w-8" />
            </ExternalLinkWarning>
            <ExternalLinkWarning 
              href="https://www.facebook.com/vetsearnedit"
              className="text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              showIcon={false}
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-8 w-8" />
            </ExternalLinkWarning>
            <ExternalLinkWarning 
              href="https://www.linkedin.com/company/earnedit"
              className="text-muted-foreground hover:text-[hsl(var(--info))] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              showIcon={false}
              aria-label="Follow us on LinkedIn"
            >
              <Linkedin className="h-8 w-8" />
            </ExternalLinkWarning>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100">
            <AccreditationDisclaimer className="text-center max-w-2xl mx-auto" />
          </div>
        </div>
      </footer>
    </div>
  );
}
