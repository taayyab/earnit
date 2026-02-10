const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000"

interface ApiResponse {
  status: "success" | "error"
  mode: "live" | "mock"
  source?: "va" | "internal"
  data?: unknown
  code?: string
  message?: string
}

async function request(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
  const userId = localStorage.getItem("userId") || "demo-user"

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...options.headers,
    },
  })

  return response.json()
}

export const apiClient = {
  // Veteran Verification APIs
  getVeteranConfirmation(): Promise<ApiResponse> {
    return request("/va/veteran-confirmation")
  },

  getServiceHistory(): Promise<ApiResponse> {
    return request("/va/service-history")
  },

  // Benefits APIs
  getBenefitsReference(endpoint: string = "disabilities"): Promise<ApiResponse> {
    return request(`/va/benefits-reference/${endpoint}`)
  },

  getBenefitsClaims(): Promise<ApiResponse> {
    return request("/va/benefits-claims")
  },

  submitBenefitsIntake(): Promise<ApiResponse> {
    return request("/va/benefits-intake", { method: "POST" })
  },

  // Forms API
  getForms(formName?: string): Promise<ApiResponse> {
    const endpoint = formName ? `/va/forms/${formName}` : "/va/forms"
    return request(endpoint)
  },

  // Facilities API
  getFacilities(): Promise<ApiResponse> {
    return request("/va/facilities")
  },

  // Appeals APIs
  getAppealableIssues(): Promise<ApiResponse> {
    return request("/va/appealable-issues")
  },

  getAppealsStatus(): Promise<ApiResponse> {
    return request("/va/appeals-status")
  },

  getLegacyAppeals(): Promise<ApiResponse> {
    return request("/va/legacy-appeals")
  },

  // Health APIs
  getPatientHealth(): Promise<ApiResponse> {
    return request("/va/patient-health")
  },

  getCommunityCareEligibility(): Promise<ApiResponse> {
    return request("/va/community-care-eligibility")
  },

  // Consent Management
  revokeConsent(): Promise<ApiResponse> {
    return request("/va/revoke-consent", { method: "POST" })
  },

  // Auth
  getLoginUrl(): string {
    return `${API_BASE}/auth/login`
  },
}
