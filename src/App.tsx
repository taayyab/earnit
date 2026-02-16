import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Claims } from "./pages/Claims";
import { ClaimDetail } from "./pages/ClaimDetail";
import { ClaimDocuments } from "./pages/ClaimDocuments";
import { ClaimAnalysis } from "./pages/ClaimAnalysis";
import { ClaimEvidence } from "./pages/ClaimEvidence";
import { ClaimReview } from "./pages/ClaimReview";
import { ClaimSubmit } from "./pages/ClaimSubmit";
import { ClaimTrack } from "./pages/ClaimTrack";
import { ClaimForms } from "./pages/ClaimForms";
import { Playground } from "./pages/Playground";
import { AppLayout } from "./components/layout/app-layout";
import Register from "./pages/Register";
import { Login } from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import { AdvocateDashboard } from "./pages/advocate/AdvocateDashboard";
import { AgentDashboard } from "./pages/agent/AgentDashboard";
import { PartnerDashboard } from "./pages/partner/PartnerDashboard";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("authenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Veteran Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Advocate Dashboard */}
        <Route
          path="/advocate/dashboard"
          element={
            <ProtectedRoute>
              <AdvocateDashboard />
            </ProtectedRoute>
          }
        />

        {/* Agent Dashboard */}
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Partner Admin Dashboard */}
        <Route
          path="/partner/dashboard"
          element={
            <ProtectedRoute>
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims"
          element={
            <ProtectedRoute>
              <Claims />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id"
          element={
            <ProtectedRoute>
              <ClaimDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/documents"
          element={
            <ProtectedRoute>
              <ClaimDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/analysis"
          element={
            <ProtectedRoute>
              <ClaimAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/evidence"
          element={
            <ProtectedRoute>
              <ClaimEvidence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/review"
          element={
            <ProtectedRoute>
              <ClaimReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/submit"
          element={
            <ProtectedRoute>
              <ClaimSubmit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/track"
          element={
            <ProtectedRoute>
              <ClaimTrack />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims/:id/forms"
          element={
            <ProtectedRoute>
              <ClaimForms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <Playground />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
