import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import { DemoModeProvider } from './context/DemoModeContext';
import { Toaster } from './components/ui/sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import DemoModeBanner from './components/DemoModeBanner';
import ChatAssistant from './components/ChatAssistant';
import { SkipToContent } from './components/ui/skip-to-content';
import { AriaLiveProvider } from './components/ui/aria-live-region';
import { AccessibilityReportButton } from './utils/accessibility-testing';
import { ClaimStageGuard, RequireQAPass, RequireRDBApproval, RequireDenialLetter } from './components/ClaimStageGuard';
import { CLAIM_STAGES } from './hooks/useClaimStage';

const Onboarding = lazy(() => import('./pages/Onboarding'));
const AdvocateMatching = lazy(() => import('./pages/AdvocateMatching'));
const IntakeQuestionnaire = lazy(() => import('./pages/IntakeQuestionnaire'));
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'));
const ClaimDetail = lazy(() => import('./pages/ClaimDetail'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));
const AgentCommandCenter = lazy(() => import('./pages/AgentCommandCenter'));
const AgentEvidence = lazy(() => import('./pages/agent/AgentEvidence'));
const AgentCommunications = lazy(() => import('./pages/agent/AgentCommunications'));
const MetricsReports = lazy(() => import('./pages/agent/MetricsReports'));
const AgentClaimDetail = lazy(() => import('./pages/agent/AgentClaimDetail'));
const AgentClaimWizard = lazy(() => import('./pages/agent/AgentClaimWizard'));
const AgentSchedule = lazy(() => import('./pages/agent/AgentSchedule'));
const AgentOnboarding = lazy(() => import('./pages/agent/AgentOnboarding'));
const TriageDashboard = lazy(() => import('./pages/agent/TriageDashboard'));
const FormEditor = lazy(() => import('./pages/FormEditor'));
const WraparoundServicesPage = lazy(() => import('./pages/WraparoundServicesPage'));
const DocumentOnboarding = lazy(() => import('./pages/DocumentOnboarding'));
const ClaimReview = lazy(() => import('./pages/ClaimReview'));
const MFAVerification = lazy(() => import('./pages/MFAVerification'));
const MFASetup = lazy(() => import('./pages/MFASetup'));
const AppealsStatus = lazy(() => import('./pages/AppealsStatus'));
const AppealDecisionWizard = lazy(() => import('./pages/AppealDecisionWizard'));
const SupportCaseDashboard = lazy(() => import('./pages/SupportCaseDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const MarketingOnePager = lazy(() => import('./pages/MarketingOnePager'));
const PitchDeck = lazy(() => import('./pages/PitchDeck'));
const ExecutiveSummary = lazy(() => import('./pages/ExecutiveSummary'));
const InvestorLanding = lazy(() => import('./pages/InvestorLanding'));
const CourseExample = lazy(() => import('./pages/CourseExample'));
const FormsLibrary = lazy(() => import('./pages/FormsLibrary'));
const DBQFormViewer = lazy(() => import('./pages/DBQFormViewer'));
const EvidenceLibrary = lazy(() => import('./pages/EvidenceLibrary'));
const TemplateEditor = lazy(() => import('./pages/TemplateEditor'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const PartnerTermsOfService = lazy(() => import('./pages/legal/PartnerTermsOfService'));
const HIPAABusinessAssociateAgreement = lazy(() => import('./pages/legal/HIPAABusinessAssociateAgreement'));
const VetAdvocateVolunteerAgreement = lazy(() => import('./pages/legal/VetAdvocateVolunteerAgreement'));
const FAQ = lazy(() => import('./pages/support/FAQ'));
const SignUp = lazy(() => import('./pages/support/SignUp'));
const PartnerRegistration = lazy(() => import('./pages/partner/PartnerRegistration'));
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'));
const VetAdvocateRegistration = lazy(() => import('./pages/advocate/VetAdvocateRegistration'));
const MyVeterans = lazy(() => import('./pages/advocate/MyVeterans'));
const AdvocateCalendar = lazy(() => import('./pages/advocate/AdvocateCalendar'));
const SupportCases = lazy(() => import('./pages/advocate/SupportCases'));
const VeteranClientOnboarding = lazy(() => import('./pages/partner/VeteranClientOnboarding'));
const OnboardingTemplateEditor = lazy(() => import('./pages/partner/OnboardingTemplateEditor'));
const VeteranIntakeForm = lazy(() => import('./pages/public/VeteranIntakeForm'));
const AccreditationReview = lazy(() => import('./pages/admin/AccreditationReview'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AccreditationPending = lazy(() => import('./pages/AccreditationPending'));
const VeteranClaimsDashboard = lazy(() => import('./pages/VeteranClaimsDashboard'));
const FacilitySearch = lazy(() => import('./pages/FacilitySearch'));
const DemoLogin = lazy(() => import('./pages/DemoLogin'));
const ProviderRegistration = lazy(() => import('./pages/provider/ProviderRegistration'));
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard'));
const ProviderServices = lazy(() => import('./pages/provider/ProviderServices'));
const ProviderRequests = lazy(() => import('./pages/provider/ProviderRequests'));
const ProviderVerification = lazy(() => import('./pages/admin/ProviderVerification'));
const ProviderSearch = lazy(() => import('./pages/veteran/ProviderSearch'));
const VeteranRequests = lazy(() => import('./pages/veteran/VeteranRequests'));

const SSDIDashboard = lazy(() => import('./pages/ssdi/SSDIDashboard'));
const SSDIStart = lazy(() => import('./pages/ssdi/SSDIStart'));
const SSDIEducation = lazy(() => import('./pages/ssdi/SSDIEducation'));
const SSDIConsent = lazy(() => import('./pages/ssdi/SSDIConsent'));
const SSDIForms = lazy(() => import('./pages/ssdi/SSDIForms'));
const SSDIApplicationDetail = lazy(() => import('./pages/ssdi/SSDIApplicationDetail'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function PrivateRoute({ children, allowPendingAccreditation = false }) {
  const { user, loading, needsMfaVerification } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsMfaVerification) {
    return <Navigate to="/mfa-verify" replace />;
  }

  if (!allowPendingAccreditation && 
      user.accreditation_status === 'pending' && 
      (user.role === 'claims_agent' || user.role === 'va_attorney' || user.role === 'vso_representative')) {
    return <Navigate to="/accreditation-pending" replace />;
  }
  
  return children;
}

function MFARoute({ children }) {
  const { user, loading, mfaRequired, mfaVerified } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!mfaRequired || mfaVerified) {
    const roleRoutes = {
      'veteran': '/dashboard',
      'peer_mentor': '/mentor',
      'peer_supporter': '/mentor',
      'veteran_advocate': '/mentor',
      'claims_agent': '/agent',
      'partner_admin': '/partner/dashboard'
    };
    return <Navigate to={roleRoutes[user.role] || '/dashboard'} replace />;
  }
  
  return children;
}

function RoleRedirect({ children }) {
  const { user } = useAuth();
  if (!user) return children;

  const roleRoutes = {
    'advocate': '/mentor',
    'veteran_advocate': '/mentor',
    'peer_mentor': '/mentor',
    'peer_supporter': '/mentor',
    'agent': '/agent',
    'claims_agent': '/agent',
    'partner_admin': '/partner/dashboard',
    'provider': '/provider/dashboard',
  };

  const redirect = roleRoutes[user.role];
  if (redirect) return <Navigate to={redirect} replace />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <AriaLiveProvider>
      <Router>
        <DemoModeProvider>
        <SkipToContent />
        <DemoModeBanner />
        <main id="main-content" className="min-h-screen bg-white">
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/demo-login" element={<Suspense fallback={<PageLoader />}><DemoLogin /></Suspense>} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketing" element={<MarketingOnePager />} />
            <Route path="/pitch-deck" element={<PitchDeck />} />
            <Route path="/executive-summary" element={<ExecutiveSummary />} />
            <Route path="/investors" element={<InvestorLanding />} />
            <Route path="/course-example" element={<CourseExample />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/partner-tos" element={<PartnerTermsOfService />} />
            <Route path="/legal/hipaa-baa" element={<HIPAABusinessAssociateAgreement />} />
            <Route path="/legal/vet-advocate-volunteer-agreement" element={<VetAdvocateVolunteerAgreement />} />
            <Route path="/partner/register" element={<PartnerRegistration />} />
            <Route path="/provider/register" element={<ProviderRegistration />} />
            <Route path="/provider/dashboard" element={<PrivateRoute><ProviderDashboard /></PrivateRoute>} />
            <Route path="/provider/services" element={<PrivateRoute><ProviderServices /></PrivateRoute>} />
            <Route path="/provider/requests" element={<PrivateRoute><ProviderRequests /></PrivateRoute>} />
            
            {/* SSDI (Social Security Disability Insurance) Routes */}
            <Route path="/ssdi" element={<PrivateRoute><SSDIDashboard /></PrivateRoute>} />
            <Route path="/ssdi/start" element={<PrivateRoute><SSDIStart /></PrivateRoute>} />
            <Route path="/ssdi/:ssdiId" element={<PrivateRoute><SSDIApplicationDetail /></PrivateRoute>} />
            <Route path="/ssdi/:ssdiId/education" element={<PrivateRoute><SSDIEducation /></PrivateRoute>} />
            <Route path="/ssdi/:ssdiId/consent" element={<PrivateRoute><SSDIConsent /></PrivateRoute>} />
            <Route path="/ssdi/:ssdiId/forms" element={<PrivateRoute><SSDIForms /></PrivateRoute>} />
            <Route path="/ssdi/:ssdiId/status-check" element={<PrivateRoute><SSDIApplicationDetail /></PrivateRoute>} />
            
            <Route path="/advocate/register" element={<VetAdvocateRegistration />} />
            <Route path="/advocate/veterans" element={<PrivateRoute><MyVeterans /></PrivateRoute>} />
            <Route path="/advocate/calendar" element={<PrivateRoute><AdvocateCalendar /></PrivateRoute>} />
            <Route path="/advocate/cases" element={<PrivateRoute><SupportCases /></PrivateRoute>} />
            <Route path="/onboard/:token" element={<VeteranIntakeForm />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help" element={<FAQ />} />
            <Route path="/support" element={<FAQ />} />
            <Route path="/how-to-sign-up" element={<SignUp />} />
            <Route path="/facilities" element={<FacilitySearch />} />
            <Route path="/find-va-facilities" element={<FacilitySearch />} />
            <Route
              path="/forms-library"
              element={
                <PrivateRoute>
                  <FormsLibrary />
                </PrivateRoute>
              }
            />
            <Route
              path="/dbq/:dbqType"
              element={
                <PrivateRoute>
                  <DBQFormViewer />
                </PrivateRoute>
              }
            />
            <Route
              path="/evidence-library"
              element={
                <PrivateRoute>
                  <EvidenceLibrary />
                </PrivateRoute>
              }
            />
            <Route
              path="/template-editor/:instanceId"
              element={
                <PrivateRoute>
                  <TemplateEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/template-editor"
              element={
                <PrivateRoute>
                  <TemplateEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/mfa-verify"
              element={
                <MFARoute>
                  <MFAVerification />
                </MFARoute>
              }
            />
            <Route
              path="/mfa-setup"
              element={
                <PrivateRoute>
                  <MFASetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <PrivateRoute>
                  <Onboarding />
                </PrivateRoute>
              }
            />
            <Route
              path="/advocates"
              element={
                <PrivateRoute>
                  <AdvocateMatching />
                </PrivateRoute>
              }
            />
            <Route
              path="/veteran-advocate"
              element={<Navigate to="/advocates" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleRedirect>
                    <Dashboard />
                  </RoleRedirect>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-claims"
              element={
                <PrivateRoute>
                  <VeteranClaimsDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/intake"
              element={
                <PrivateRoute>
                  <IntakeQuestionnaire />
                </PrivateRoute>
              }
            />
            <Route
              path="/claim/:claimId/intake"
              element={
                <PrivateRoute>
                  <IntakeQuestionnaire />
                </PrivateRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <PrivateRoute>
                  <DocumentUpload />
                </PrivateRoute>
              }
            />
            <Route
              path="/claim/:claimId/documents"
              element={
                <PrivateRoute>
                  <ClaimStageGuard minStage={CLAIM_STAGES.INTAKE}>
                    <DocumentUpload />
                  </ClaimStageGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/claim/:id"
              element={
                <PrivateRoute>
                  <ClaimStageGuard>
                    <ClaimDetail />
                  </ClaimStageGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/mentor"
              element={
                <PrivateRoute>
                  <MentorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent"
              element={
                <PrivateRoute>
                  <AgentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/command-center"
              element={
                <PrivateRoute>
                  <AgentCommandCenter />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/evidence"
              element={
                <PrivateRoute>
                  <AgentEvidence />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/communications"
              element={
                <PrivateRoute>
                  <AgentCommunications />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/metrics"
              element={
                <PrivateRoute>
                  <MetricsReports />
                </PrivateRoute>
              }
            />
            <Route path="/agent/analytics" element={<Navigate to="/agent/metrics" replace />} />
            <Route path="/impact-reports" element={<Navigate to="/agent/metrics" replace />} />
            <Route
              path="/agent/schedule"
              element={
                <PrivateRoute>
                  <AgentSchedule />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/onboarding"
              element={
                <PrivateRoute>
                  <AgentOnboarding />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/triage"
              element={
                <PrivateRoute>
                  <TriageDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/claim/:id"
              element={
                <PrivateRoute>
                  <AgentClaimDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/create-claim"
              element={
                <PrivateRoute>
                  <AgentClaimWizard />
                </PrivateRoute>
              }
            />
            <Route
              path="/support-cases"
              element={
                <PrivateRoute>
                  <SupportCaseDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/form/:claimId"
              element={
                <PrivateRoute>
                  <ClaimStageGuard minStage={CLAIM_STAGES.QA_REVIEW}>
                    <RequireQAPass>
                      <FormEditor />
                    </RequireQAPass>
                  </ClaimStageGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/services"
              element={
                <PrivateRoute>
                  <WraparoundServicesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/document-onboarding"
              element={
                <PrivateRoute>
                  <DocumentOnboarding />
                </PrivateRoute>
              }
            />
            <Route
              path="/claim-review"
              element={
                <PrivateRoute>
                  <ClaimReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/start-claim"
              element={
                <PrivateRoute>
                  <DocumentOnboarding />
                </PrivateRoute>
              }
            />
            <Route
              path="/appeals"
              element={
                <PrivateRoute>
                  <AppealsStatus />
                </PrivateRoute>
              }
            />
            <Route
              path="/appeals-status"
              element={
                <PrivateRoute>
                  <AppealsStatus />
                </PrivateRoute>
              }
            />
            <Route
              path="/appeal-wizard"
              element={
                <PrivateRoute>
                  <AppealDecisionWizard />
                </PrivateRoute>
              }
            />
            <Route
              path="/appeal-wizard/:claimId"
              element={
                <PrivateRoute>
                  <ClaimStageGuard>
                    <RequireDenialLetter>
                      <AppealDecisionWizard />
                    </RequireDenialLetter>
                  </ClaimStageGuard>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/partner/dashboard"
              element={
                <PrivateRoute>
                  <PartnerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/partner/clients/onboard"
              element={
                <PrivateRoute>
                  <VeteranClientOnboarding />
                </PrivateRoute>
              }
            />
            <Route
              path="/partner/templates"
              element={
                <PrivateRoute>
                  <OnboardingTemplateEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/partner/templates/:templateId"
              element={
                <PrivateRoute>
                  <OnboardingTemplateEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/accreditation"
              element={
                <PrivateRoute>
                  <AccreditationReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/provider-verification"
              element={
                <PrivateRoute>
                  <ProviderVerification />
                </PrivateRoute>
              }
            />
            <Route
              path="/veteran/provider-search"
              element={
                <PrivateRoute>
                  <ProviderSearch />
                </PrivateRoute>
              }
            />
            <Route
              path="/veteran/requests"
              element={
                <PrivateRoute>
                  <VeteranRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/accreditation-pending"
              element={
                <PrivateRoute allowPendingAccreditation={true}>
                  <AccreditationPending />
                </PrivateRoute>
              }
            />
          </Routes>
          </Suspense>
          <SessionTimeoutWarning />
          <ChatAssistant />
          <AccessibilityReportButton />
          <Toaster />
        </main>
        </DemoModeProvider>
      </Router>
      </AriaLiveProvider>
    </AuthProvider>
  );
}

export default App;
