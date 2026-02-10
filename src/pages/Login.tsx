import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Shield, ExternalLink, CheckCircle2, Clock, FileText, Users } from "lucide-react"
import { apiClient } from "../api/client"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Badge } from "../components/ui/badge"

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const success = searchParams.get("success")
    const userId = searchParams.get("userId")

    if (success === "true" && userId) {
      localStorage.setItem("userId", userId)
      localStorage.setItem("authenticated", "true")
      navigate("/dashboard")
    }
  }, [searchParams, navigate])

  const handleConnect = () => {
    const userId = `demo-user-${Date.now()}`
    localStorage.setItem("userId", userId)
    localStorage.setItem("authenticated", "true")
    navigate("/dashboard")
  }

  const handleRealAuth = () => {
    window.location.href = apiClient.getLoginUrl()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Tagline */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-12 w-12 text-amber-500" />
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-white">Earned</span><span className="text-amber-500">IT</span>
              </h1>
            </div>
            <p className="text-lg text-slate-300">
              Get the VA benefits you've earned
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Connect your VA account to manage your disability claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleRealAuth}
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <ExternalLink className="h-5 w-5" />
                Connect with VA (ID.me)
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-slate-500">
                  or
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="mock" className="text-xs">
                    DEMO MODE
                  </Badge>
                  <span className="text-sm text-slate-500">
                    For testing without real credentials
                  </span>
                </div>
                <Button
                  onClick={handleConnect}
                  variant="gold"
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  Try Demo Mode
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500">
                Free for original claims per 38 CFR 14.636.
                <br />
                We only charge for successful appeals.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            Why Veterans Trust EarnedIT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FileText}
              title="AI-Powered Claims"
              description="Smart document analysis identifies all eligible conditions"
            />
            <FeatureCard
              icon={Clock}
              title="50% Faster"
              description="Streamlined process reduces claim processing time"
            />
            <FeatureCard
              icon={CheckCircle2}
              title="35% Higher Approval"
              description="Pre-submission QA catches issues before filing"
            />
            <FeatureCard
              icon={Users}
              title="10,000+ Veterans"
              description="Trusted by veterans across all branches"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>
            EarnedIT is not affiliated with the Department of Veterans Affairs.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} EarnedIT. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText
  title: string
  description: string
}) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
