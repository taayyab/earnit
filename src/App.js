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
import { Skeleton } from './components/ui/skeleton';
import { AccessibilityReportButton } from './utils/accessibility-testing';
import { ClaimStageGuard, RequireQAPass, RequireRDBApproval, RequireDenialLetter } from './components/ClaimStageGuard';
import { CLAIM_STAGES } from './hooks/useClaimStage';

// Retry wrapper for lazy imports — handles stale chunk 404s after redeployment
function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch(() => {
      // Chunk failed to load (likely stale deployment). Reload once.
      const reloaded = sessionStorage.getItem('chunk_reload');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
        return new Promise(() => {}); // never resolves — page is reloading
      }
      sessionStorage.removeItem('chunk_reload');
      return importFn(); // retry once more after flag set
    })
  );
}

// Error boundary for chunk load failures and other render crashes
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    // If it's a chunk load error, auto-reload
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      const reloaded = sessionStorage.getItem('chunk_reload');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
        return;
      }
      sessionStorage.removeItem('chunk_reload');
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">A new version may be available.</p>
            <button
              onClick={() => { sessionStorage.removeItem('chunk_reload'); window.location.reload(); }}
              className="px-4 py-2 bg-[#1B3A5F] text-white rounded hover:bg-[#2a4a6f]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'));
const AdvocateMatching = lazyWithRetry(() => import('./pages/AdvocateMatching'));
const IntakeQuestionnaire = lazyWithRetry(() => import('./pages/IntakeQuestionnaire'));
const DocumentUpload = lazyWithRetry(() => import('./pages/DocumentUpload'));
const ClaimDetail = lazyWithRetry(() => import('./pages/ClaimDetail'));
const BackPayEstimationPage = lazyWithRetry(() => import('./pages/BackPayEstimationPage'));
const MentorDashboard = lazyWithRetry(() => import('./pages/MentorDashboard'));
const Messages = lazyWithRetry(() => import('./pages/Messages'));
const AgentDashboard = lazyWithRetry(() => import('./pages/AgentDashboard'));
const AgentCommandCenter = lazyWithRetry(() => import('./pages/AgentCommandCenter'));
const AgentEvidence = lazyWithRetry(() => import('./pages/agent/AgentEvidence'));
const AgentCommunications = lazyWithRetry(() => import('./pages/agent/AgentCommunications'));
const MetricsReports = lazyWithRetry(() => import('./pages/agent/MetricsReports'));
const AgentClaimDetail = lazyWithRetry(() => import('./pages/agent/AgentClaimDetail'));
const AgentClaimWizard = lazyWithRetry(() => import('./pages/agent/AgentClaimWizard'));
const AgentSchedule = lazyWithRetry(() => import('./pages/agent/AgentSchedule'));
const AgentOnboarding = lazyWithRetry(() => import('./pages/agent/AgentOnboarding'));
const TriageDashboard = lazyWithRetry(() => import('./pages/agent/TriageDashboard'));
const FormEditor = lazyWithRetry(() => import('./pages/FormEditor'));
const WraparoundServicesPage = lazyWithRetry(() => import('./pages/WraparoundServicesPage'));
const DocumentOnboarding = lazyWithRetry(() => import('./pages/DocumentOnboarding'));
const ClaimReview = lazyWithRetry(() => import('./pages/ClaimReview'));
const MFAVerification = lazyWithRetry(() => import('./pages/MFAVerification'));
const MFASetup = lazyWithRetry(() => import('./pages/MFASetup'));
const AppealsStatus = lazyWithRetry(() => import('./pages/AppealsStatus'));
const AppealDecisionWizard = lazyWithRetry(() => import('./pages/AppealDecisionWizard'));
const SupportCaseDashboard = lazyWithRetry(() => import('./pages/SupportCaseDashboard'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const MarketingOnePager = lazyWithRetry(() => import('./pages/MarketingOnePager'));
const PitchDeck = lazyWithRetry(() => import('./pages/PitchDeck'));
const ExecutiveSummary = lazyWithRetry(() => import('./pages/ExecutiveSummary'));
const InvestorLanding = lazyWithRetry(() => import('./pages/InvestorLanding'));
const CourseExample = lazyWithRetry(() => import('./pages/CourseExample'));
const FormsLibrary = lazyWithRetry(() => import('./pages/FormsLibrary'));
const DBQFormViewer = lazyWithRetry(() => import('./pages/DBQFormViewer'));
const EvidenceLibrary = lazyWithRetry(() => import('./pages/EvidenceLibrary'));
const ServiceHistoryPage = lazyWithRetry(() => import('./pages/ServiceHistoryPage'));
const HealthRecordsPage  = lazyWithRetry(() => import('./pages/HealthRecordsPage'));
const CommunityCarePage  = lazyWithRetry(() => import('./pages/CommunityCarePage'));
const VAApiScenariosPage = lazyWithRetry(() => import('./pages/VAApiScenariosPage'));
const TemplateEditor = lazyWithRetry(() => import('./pages/TemplateEditor'));
const TermsOfService = lazyWithRetry(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/legal/PrivacyPolicy'));
const PartnerTermsOfService = lazyWithRetry(() => import('./pages/legal/PartnerTermsOfService'));
const HIPAABusinessAssociateAgreement = lazyWithRetry(() => import('./pages/legal/HIPAABusinessAssociateAgreement'));
const VetAdvocateVolunteerAgreement = lazyWithRetry(() => import('./pages/legal/VetAdvocateVolunteerAgreement'));
const FAQ = lazyWithRetry(() => import('./pages/support/FAQ'));
const SignUp = lazyWithRetry(() => import('./pages/support/SignUp'));
const PartnerRegistration = lazyWithRetry(() => import('./pages/partner/PartnerRegistration'));
const PartnerDashboard = lazyWithRetry(() => import('./pages/partner/PartnerDashboard'));
const VetAdvocateRegistration = lazyWithRetry(() => import('./pages/advocate/VetAdvocateRegistration'));
const MyVeterans = lazyWithRetry(() => import('./pages/advocate/MyVeterans'));
const AdvocateCalendar = lazyWithRetry(() => import('./pages/advocate/AdvocateCalendar'));
const SupportCases = lazyWithRetry(() => import('./pages/advocate/SupportCases'));
const VeteranClientOnboarding = lazyWithRetry(() => import('./pages/partner/VeteranClientOnboarding'));
const OnboardingTemplateEditor = lazyWithRetry(() => import('./pages/partner/OnboardingTemplateEditor'));
const VeteranIntakeForm = lazyWithRetry(() => import('./pages/public/VeteranIntakeForm'));
const AccreditationReview = lazyWithRetry(() => import('./pages/admin/AccreditationReview'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const AccreditationPending = lazyWithRetry(() => import('./pages/AccreditationPending'));
const VeteranClaimsDashboard = lazyWithRetry(() => import('./pages/VeteranClaimsDashboard'));
const FacilitySearch = lazyWithRetry(() => import('./pages/FacilitySearch'));
const DemoLogin = lazyWithRetry(() => import('./pages/DemoLogin'));
const ProviderRegistration = lazyWithRetry(() => import('./pages/provider/ProviderRegistration'));
const ProviderDashboard = lazyWithRetry(() => import('./pages/provider/ProviderDashboard'));
const ProviderServices = lazyWithRetry(() => import('./pages/provider/ProviderServices'));
const ProviderRequests = lazyWithRetry(() => import('./pages/provider/ProviderRequests'));
const ProviderVerification = lazyWithRetry(() => import('./pages/admin/ProviderVerification'));
const ProviderSearch = lazyWithRetry(() => import('./pages/veteran/ProviderSearch'));
const VeteranRequests = lazyWithRetry(() => import('./pages/veteran/VeteranRequests'));

const SSDIDashboard = lazyWithRetry(() => import('./pages/ssdi/SSDIDashboard'));
const SSDIStart = lazyWithRetry(() => import('./pages/ssdi/SSDIStart'));
const SSDIEducation = lazyWithRetry(() => import('./pages/ssdi/SSDIEducation'));
const SSDIConsent = lazyWithRetry(() => import('./pages/ssdi/SSDIConsent'));
const SSDIForms = lazyWithRetry(() => import('./pages/ssdi/SSDIForms'));
const SSDIApplicationDetail = lazyWithRetry(() => import('./pages/ssdi/SSDIApplicationDetail'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ children, allowPendingAccreditation = false }) {
  const { user, loading, needsMfaVerification } = useAuth();
  
  if (loading) {
    return <PageLoader />;
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
    return <PageLoader />;
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

// Restrict access to advocate-only routes
function AdvocateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  const advocateRoles = ['advocate', 'veteran_advocate', 'peer_mentor', 'peer_supporter'];
  if (!advocateRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// Restrict /mentor to advocate roles only (veterans get redirected)
function MentorRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  const advocateRoles = ['advocate', 'veteran_advocate', 'peer_mentor', 'peer_supporter', 'claims_agent', 'va_attorney', 'vso_representative'];
  if (!advocateRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <ChunkErrorBoundary>
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
            <Route path="/advocate/veterans" element={<AdvocateRoute><MyVeterans /></AdvocateRoute>} />
            <Route path="/advocate/calendar" element={<AdvocateRoute><AdvocateCalendar /></AdvocateRoute>} />
            <Route path="/advocate/cases" element={<AdvocateRoute><SupportCases /></AdvocateRoute>} />
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
              path="/service-history"
              element={
                <PrivateRoute>
                  <ServiceHistoryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/health-records"
              element={
                <PrivateRoute>
                  <HealthRecordsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/community-care"
              element={
                <PrivateRoute>
                  <CommunityCarePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/va-api-scenarios"
              element={
                <PrivateRoute>
                  <VAApiScenariosPage />
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
              path="/back-pay-estimation/:claimId"
              element={<PrivateRoute><BackPayEstimationPage /></PrivateRoute>}
            />
            <Route
              path="/mentor"
              element={
                <MentorRoute>
                  <MentorDashboard />
                </MentorRoute>
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
                  <FormEditor />
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
    </ChunkErrorBoundary>
  );
}

export default App;
