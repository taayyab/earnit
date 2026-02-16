import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Info,
  Brain,
  Lock,
  Heart,
  Shield,
  FileText,
  Users,
  MessageSquare,
  User,
  ClipboardList,
  Upload,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Button } from "../components/ui/button";
import Navbar from "../components/layout/Navbar";

export function Landing() {
  const [showAccreditation, setShowAccreditation] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowAccreditation(window.scrollY < 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Accreditation Banner */}
      <div
        className={`bg-[#fff7e6] border-b px-4 overflow-hidden transition-all duration-300 ${
          showAccreditation
            ? "py-1 opacity-100 border-amber-200"
            : "py-0 opacity-0 -translate-y-2 h-0 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[13.5px] sm:text-[13.5px] text-amber-800">
          <Clock className="h-4 w-4 shrink-0 text-amber-800" />
          <span>
            EarnedIT is pending VA accreditation. All claims preparation
            services are supervised by our accredited partners.
          </span>
          <div className="relative group">
            <Info className="h-4 w-4 shrink-0 cursor-pointer text-amber-700" />
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-amber-200 rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-900">
              <div className="absolute -top-2 right-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
              <p className="text-slate-800 font-semibold text-sm mb-2">
                What does this mean?
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                While EarnedIT awaits formal VA accreditation, we partner with
                accredited claims agents and Veterans Service Organizations to
                ensure all claim preparation meets VA standards. You receive the
                same quality assistance under professional oversight.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 ">
        <section className=" bg-slate-100te py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center flex justify-center items-center flex-col">
            <h1 className="text-[36px] sm:text-[56px] font-bold text-slate-800 leading-tight tracking-tight mb-6">
              Distinguished Claims Support
              <br />
              for Every Veteran
            </h1>
            <p className="mt-6 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed ">
              AI Veteran Benefits Platform simplifies VA disability claims with
              secure intake, AI-powered analysis, peer mentor support, and
              accredited agent guidance. Get the benefits you've earned with
              confidence.
            </p>

            <div className="mt-8 flex flex-row items-center justify-center gap-8">
              <Link to="/Register">
                <Button className="bg-rose-700 hover:bg-rose-800 text-white  text-[16px] font-semibold px-7 py-5 h-13 rounded-md">
                  Start Your Claim
                </Button>
              </Link>
              <Link
                to="#how-it-works"
                className="text-[16px] font-medium text-slate-600 hover:text-slate-900 transition-colors px-7 py-5 h-13 flex justify-center items-center"
              >
                How It Works
              </Link>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-12 sm:mt-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
              {/* AI-Powered Analysis Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow w-full">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-slate-700" />
                  </div>
                  <h5 className="text-[18px] font-semibold text-slate-800 mb-3">
                    AI-Powered Analysis
                  </h5>
                  <p className="text-[14px] text-slate-500 leading-relaxed w-[233.3px]">
                    Smart document review identifies conditions and strengthens
                    your claim.
                  </p>
                </div>
              </div>

              {/* Secure & Encrypted Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow w-full">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h5 className="text-[18px] font-semibold text-slate-800 mb-3">
                    Secure & Encrypted
                  </h5>
                  <p className="text-[14px] text-slate-500 leading-relaxed w-[233.3px]">
                    Your data is protected with military-grade encryption.
                  </p>
                </div>
              </div>

              {/* Veteran-First Support Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow w-full">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-rose-600" />
                  </div>
                  <h5 className="text-[18px] font-semibold text-slate-800 mb-3">
                    Veteran-First Support
                  </h5>
                  <p className="text-[14px] text-slate-500 leading-relaxed w-[233.3px]">
                    Peer mentors, AI guidance, and community resources for your
                    journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Veterans Section */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 flex justify-center items-center flex-col gap-5 line">
              <h2 className="text-4xl font-bold text-slate-800 pb-2 ">
                Built for Veterans, by Veterans
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-3xl mx-auto leading-relaxed">
                We understand the challenges you face. Our platform combines
                cutting-edge technology with human support to give you the best
                chance at success.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* HIPAA-Compliant Security */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-slate-700" />
                </div>
                <h5 className="text-base font-black text-slate-800 pb-2">
                  HIPAA-Compliant Security
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Military-grade encryption protects your sensitive health
                  information with full audit trails.
                </p>
              </div>

              {/* AI-Powered Claims Analysis */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6 text-slate-700" />
                </div>
                <h5 className="text-base font-black text-slate-800 pb-2">
                  AI-Powered Claims Analysis
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Advanced AI reviews your documents, maps conditions to VA
                  codes, and identifies evidence gaps.
                </p>
              </div>

              {/* Peer Mentor Support */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <h5 className="text-base font-black text-slate-800 pb-2">
                  Peer Mentor Support
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Connect with experienced veterans who understand your journey
                  and can guide you through the process.
                </p>
              </div>

              {/* Secure Communication */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                  <MessageSquare className="h-6 w-6 text-slate-700" />
                </div>
                <h5 className="text-base font-black text-slate-800 pb-2">
                  Secure Communication
                </h5>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Encrypted messaging with mentors and claims agents ensures
                  your privacy at every step.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Journey to Benefits Section */}
        <section
          id="how-it-works"
          className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
                Your Journey to Benefits
              </h2>
              <p className="text-sm sm:text-base text-slate-500 pt-6">
                Our streamlined process guides you from start to finish,
                ensuring nothing is missed.
              </p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="relative z-10 flex flex-col items-center text-center lg:after:content-[''] lg:after:absolute lg:after:top-7 lg:after:left-[calc(60%+28px)] lg:after:h-px lg:after:w-[calc(80%+2rem-64px)] lg:after:bg-slate-200 lg:after:-z-10">
                  <div className="relative w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <User className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-700 text-white text-xs font-semibold flex items-center justify-center">
                      01
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    Secure Registration
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Create your account with ID.me verification for maximum
                    security and authenticity.
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center lg:after:content-[''] lg:after:absolute lg:after:top-7 lg:after:left-[calc(60%+28px)] lg:after:h-px lg:after:w-[calc(80%+2rem-64px)] lg:after:bg-slate-200 lg:after:-z-10">
                  <div className="relative w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <ClipboardList className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-700 text-white text-xs font-semibold flex items-center justify-center">
                      02
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    Guided Intake
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Complete a simple questionnaire that helps us understand
                    your service and conditions.
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center lg:after:content-[''] lg:after:absolute lg:after:top-7 lg:after:left-[calc(60%+28px)] lg:after:h-px lg:after:w-[calc(80%+2rem-64px)] lg:after:bg-slate-200 lg:after:-z-10">
                  <div className="relative w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-700 text-white text-xs font-semibold flex items-center justify-center">
                      03
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    Document Upload
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Securely upload your medical records, service documents, and
                    supporting evidence.
                  </p>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Brain className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-700 text-white text-xs font-semibold flex items-center justify-center">
                      04
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    AI Analysis
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Our AI reviews your claim, identifies strengths, and
                    highlights areas that need attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[rgb(31,59,92)] text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-semibold text-white ">
              Ready to Get the Benefits You've Earned?
            </h2>
            <p className=" lg:w-150 mt-4 text-sm sm:text-base text-white/90 text-[17px] text-center">
              Join thousands of veterans who have successfully navigated their
              claims with AI Veteran Benefits Platform.
            </p>
            <div className="mt-6">
              <Link to="/Register">
                <Button className="bg-rose-700 hover:bg-rose-800 text-white text-sm text-[17px] font-semibold px-7 py-5 h-13 rounded-md">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/earnedit_logo.webp"
                alt="EarnedIT"
                className="h-16 w-auto"
              />
              <div className=" text-slate-500">
                <p className="font-semibold text-slate-800 text-[14px]">
                  EarnedIT
                </p>
                <p className="text-[12px]">(c) 2026 All rights reserved</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center w-full max-w-sm  justify-between text-[13px] font-medium text-slate-500">
              <Link
                to="/terms"
                className="hover:text-slate-800 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="font-bold">.</span>
              <Link
                to="/privacy"
                className="hover:text-slate-800 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="font-bold">.</span>
              <Link
                to="/faq"
                className="hover:text-slate-800 transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-slate-500">
            <a
              href="#"
              className="hover:text-slate-800 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-8 w-8" />
            </a>
            <a
              href="#"
              className="hover:text-slate-800 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-8 w-8" />
            </a>
            <a
              href="#"
              className="hover:text-slate-800 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-8 w-8" />
            </a>
          </div>
          <div className="w-full flex items-center justify-center border-t-[0.5px] border-gray-200 pt-6 mt-11 pb-24">
            <p className="mt-6 text-center text-[11px] text-slate-600 leading-relaxed max-w-3xl mx-auto">
              EarnedIT, LLC is pending VA accreditation. Claims assistance
              services are provided under the supervision of accredited claims
              agents and Veterans Service Organizations in compliance with 38
              CFR 14.629.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
