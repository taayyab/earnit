import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { apiClient } from "../api/client";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Loader2,
  Play,
  Shield,
  User,
  Users,
} from "lucide-react";

type UserRole = "veteran" | "advocate" | "agent" | "partner_admin";

const DEMO_ACCOUNTS = [
  {
    id: "demo-veteran",
    title: "Demo Veteran",
    name: "Marcus Johnson",
    description:
      "Experience the full claims journey with pre-loaded documents, veteran advocate support, and claim tracking.",
    icon: User,
    color: "bg-blue-600",
    role: "veteran" as UserRole,
  },
  {
    id: "veteran-advocate",
    title: "Veteran Advocate",
    name: "Sarah Mitchell",
    description:
      "View the supporter dashboard with assigned veterans and pending connection requests.",
    icon: Users,
    color: "bg-emerald-500",
    role: "advocate" as UserRole,
  },
  {
    id: "claims-agent",
    title: "Claims Agent",
    name: "David Chen",
    description:
      "Access the claims agent workflow with client management and case processing.",
    icon: Briefcase,
    color: "bg-purple-500",
    role: "agent" as UserRole,
  },
  {
    id: "partner-admin",
    title: "Partner Admin",
    name: "Jennifer Williams",
    description:
      "Manage VSO organization settings, team members, and client referrals.",
    icon: Building2,
    color: "bg-amber-500",
    role: "partner_admin" as UserRole,
  },
];

const getRoleBasedRoute = (role: UserRole): string => {
  switch (role) {
    case "veteran":
      return "/dashboard";
    case "advocate":
      return "/advocate/dashboard";
    case "agent":
      return "/agent/dashboard";
    case "partner_admin":
      return "/partner/dashboard";
    default:
      return "/dashboard";
  }
};

export const Login = () => {
  const [view, setView] = useState<"select" | "production" | "demo">("select");
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated") === "true";
    if (isAuthenticated) {
      const role = localStorage.getItem("userRole") as UserRole;
      const route = getRoleBasedRoute(role);
      navigate(route, { replace: true });
    }
  }, [navigate]);

  const handleDemoLogin = async (accountId: string) => {
    setLoadingAccount(accountId);
    setError(null);

    try {
      const result = await apiClient.demoLogin(accountId);

      if (result.status === "success" && result.data) {
        localStorage.setItem("userId", result.data.user.id);
        localStorage.setItem("userRole", result.data.user.role);
        localStorage.setItem("userName", `${result.data.user.firstName} ${result.data.user.lastName}`);
        localStorage.setItem("userEmail", result.data.user.email);
        localStorage.setItem("authenticated", "true");
        localStorage.setItem("isDemo", "true");

        if (result.data.user.role === "veteran") {
          navigate("/onboarding");
        } else {
          const route = getRoleBasedRoute(result.data.user.role);
          navigate(route);
        }
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please check your network.");
    } finally {
      setLoadingAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {view === "select" ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3A5F]">
                Choose Your Environment
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                Select how you'd like to access the platform
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:mx-20">
              <button
                type="button"
                onClick={() => setView("production")}
                className="group rounded-2xl hover:border-2 border border-slate-200 hover:border-slate-700 bg-white shadow-sm hover:shadow-md transition-all p-8 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-700">
                  <Shield className="h-7 w-7 text-slate-700 group-hover:text-slate-100" />
                </div>
                <h2 className="mt-6 text-lg font-semibold text-slate-900">
                  Production Login
                </h2>
                <p className="mt-3 text-sm text-slate-500 max-w-72.5 leading-relaxed mx-auto">
                  Access your real account with secure authentication. Use your
                  credentials or ID.me for VA-verified login.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setView("demo")}
                className="group rounded-2xl hover:border-2 border-2 border-slate-200 hover:border-amber-600 bg-white shadow-sm hover:shadow-md transition-all p-8 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-600">
                  <Play className="h-7 w-7 text-amber-600 group-hover:text-amber-100" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                  Demo Environment
                </h3>
                <p className="mt-3 text-sm text-slate-500 max-w-72.5 leading-relaxed mx-auto">
                  Explore the platform with pre-loaded sample data. Try
                  different user roles without creating an account.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
                  Explore Demo
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </>
        ) : view === "production" ? (
          <div className="mx-auto flex flex-col items-center max-w-103.5">
            <div className=" mx-w-md w-full">
              <button
                type="button"
                onClick={() => setView("select")}
                className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left h-4 w-4 mr-2"
                  aria-hidden="true"
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Back
              </button>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-8">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Shield className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  Production Login
                </h3>
                <p className="mt-2 text-sm text-[#65758b]">
                  Sign in to your EarnedIT account
                </p>
              </div>

              <form className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-none text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="mt-2 w-full rounded-sm border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-none text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="mt-2 w-full rounded-sm border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation text-primary-foreground shadow min-h-14 text-white px-5 py-3 text-base w-full bg-[#1B3A5F] hover:bg-[#1B3A5F]/90"
                >
                  Sign In
                </button>
              </form>
              <div className="mt-6 text-center text-sm">
                <p className="text-slate-500">
                  Don't have an account?{" "}
                  <Link
                    className="text-[#1B3A5F] hover:underline font-medium"
                    to="/register"
                    data-discover="true"
                  >
                    Register here
                  </Link>
                </p>
              </div>

              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <p className="text-amber-800 text-xs">
                  <strong>Note:</strong> ID.me verification will be available
                  once configured by your administrator.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex flex-col items-center">
            <div className="mx-w-md w-full">
              <button
                type="button"
                onClick={() => setView("select")}
                className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left h-4 w-4 mr-2"
                  aria-hidden="true"
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Back
              </button>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Play className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B3A5F] mt-2 mb-2 ">
                Demo Environment
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select an account to explore the platform
              </p>
            </div>

            {error && (
              <div className="mt-4 w-full max-w-4xl bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
              {DEMO_ACCOUNTS.map((item) => {
                const Icon = item.icon;
                const isLoading = loadingAccount === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDemoLogin(item.id)}
                    disabled={loadingAccount !== null}
                    className="rounded-xl border-2 border-white bg-white p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${item.color}`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              All demo accounts use simulated data. No real veteran information
              is stored.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
