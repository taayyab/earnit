const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Types
export interface Claim {
  id: string;
  veteranId: string;
  claimType: string;
  stage: string;
  status: string;
  vaClaimId?: string;
  submittedAt?: string;
  estimatedRating?: number;
  approvalReadinessScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  conditions?: Condition[];
}

export interface Condition {
  id: string;
  claimId: string;
  name: string;
  vaCode?: string;
  description?: string;
  claimedRating?: number;
  approvedRating?: number;
  serviceConnected?: boolean;
}

export interface Advocate {
  id: string;
  userId?: string;
  name: string;
  branch: string;
  era: string;
  yearsExperience: number;
  specialties: string[];
  bio?: string;
  rating: number;
  reviewCount: number;
  tier: string;
  availability: string[];
  interactionStyle?: string;
  matchScore?: number;
  assignedAt?: string;
}

export interface Touchpoint {
  id: string;
  scheduledDate: string;
  meetingType: string;
  status: string;
  notes?: string;
  summary?: string;
  nextSteps?: string[];
  completedAt?: string;
  advocateName: string;
}

export interface Document {
  id: string;
  claimId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  documentTypeLabel: string;
  ocrText?: string;
  ocrConfidence?: number;
  createdAt: string;
}

export interface DocumentType {
  value: string;
  label: string;
}

export interface ExtractedCondition {
  id?: string;
  name: string;
  vaCode?: string;
  description?: string;
  confidence?: number;
  claimedRating?: number;
  serviceConnected?: boolean;
}

export interface AnalysisResult {
  claimId: string;
  documentsAnalyzed: number;
  conditions: ExtractedCondition[];
  confidence?: number;
  note?: string;
}

export interface DiagnosticCode {
  key: string;
  code: string;
  description: string;
  maxRating: number;
}

export interface QAIssue {
  id: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  resolved?: boolean;
}

export interface QACheck {
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  issues: QAIssue[];
}

export interface QAResult {
  claimId: string;
  overallScore: number;
  passed: boolean;
  passThreshold: number;
  checks: QACheck[];
  issues: QAIssue[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
  };
}

export interface EvidenceLink {
  id: string;
  conditionId: string;
  documentId: string;
  relevanceScore?: number;
  pageReferences?: string;
  excerpts?: string;
  notes?: string;
  createdAt: string;
  documentFileName?: string;
  documentType?: string;
  conditionName?: string;
}

export interface EvidenceSuggestion {
  conditionId: string;
  conditionName: string;
  documentId: string;
  documentFileName: string;
  documentType: string;
  relevanceScore: number;
  reasons: string[];
}

export interface ConditionWithEvidence {
  id: string;
  claimId: string;
  name: string;
  vaCode?: string;
  description?: string;
  claimedRating?: number;
  approvedRating?: number;
  serviceConnected?: boolean;
  evidenceLinks: EvidenceLink[];
}

export interface SubmissionReadiness {
  isReady: boolean;
  checks: {
    hasConditions: boolean;
    hasDocuments: boolean;
    hasDD214: boolean;
    hasMedicalRecords: boolean;
    allConditionsHaveEvidence: boolean;
    qaApproved: boolean;
    stageIsReview: boolean;
  };
  missingItems: string[];
  conditions: number;
  documents: number;
  approvalReadinessScore: number;
}

export interface SubmissionPackage {
  claimType: string;
  veteranId: string;
  conditions: Array<{
    name: string;
    vaCode?: string;
    claimedRating?: number;
    serviceConnected?: boolean;
  }>;
  documents: Array<{
    fileName: string;
    documentType?: string;
    hasOCR: boolean;
  }>;
  forms: Array<{
    formNumber: string;
    formName: string;
    status: string;
  }>;
  estimatedRating: number;
  approvalReadinessScore: number;
}

export interface SubmissionResult {
  claimId: string;
  vaClaimId: string;
  submittedAt: string;
  estimatedDecisionDate: string;
  status: string;
  message: string;
  note?: string;
}

export interface FormGenerationResult {
  success: boolean;
  formNumber: string;
  formName: string;
  generatedAt: string;
  method: 'openai' | 'simulated';
  data: Record<string, unknown>;
  previewText: string;
}

export interface AvailableForm {
  formNumber: string;
  formName: string;
  description: string;
  status: string;
  type: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  claimId?: string;
  subject?: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  senderName?: string;
  senderEmail?: string;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Claims API
export const claimsApi = {
  list: async (userId: string): Promise<{ success: boolean; claims: Claim[] }> => {
    return apiFetch(`/claims?userId=${userId}`);
  },

  get: async (claimId: string): Promise<{ success: boolean; claim: Claim }> => {
    return apiFetch(`/claims/${claimId}`);
  },

  create: async (data: {
    veteranId: string;
    claimType?: string;
    conditionsList?: { name: string; description?: string }[];
  }): Promise<{ success: boolean; claim: Claim; message: string }> => {
    return apiFetch('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    claimId: string,
    data: {
      stage?: string;
      status?: string;
      notes?: string;
      estimatedRating?: number;
      conditionsList?: { name: string; description?: string; vaCode?: string }[];
    }
  ): Promise<{ success: boolean; claim: Claim; message: string }> => {
    return apiFetch(`/claims/${claimId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (claimId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/claims/${claimId}`, {
      method: 'DELETE',
    });
  },
};

// Advocates API
export const advocatesApi = {
  list: async (): Promise<{ success: boolean; advocates: Advocate[] }> => {
    return apiFetch('/advocates');
  },

  get: async (advocateId: string): Promise<{ success: boolean; advocate: Advocate }> => {
    return apiFetch(`/advocates/${advocateId}`);
  },

  getMyAdvocate: async (
    userId: string
  ): Promise<{ success: boolean; hasAdvocate: boolean; advocate: Advocate | null }> => {
    return apiFetch(`/advocates/my-advocate?userId=${userId}`);
  },

  assign: async (data: {
    veteranId: string;
    advocateId: string;
    matchScore?: number;
  }): Promise<{ success: boolean; assignment: unknown; message: string }> => {
    return apiFetch('/advocates/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Touchpoints API
export const touchpointsApi = {
  getUpcoming: async (
    userId: string
  ): Promise<{ success: boolean; touchpoints: Touchpoint[] }> => {
    return apiFetch(`/touchpoints/upcoming?userId=${userId}`);
  },

  getHistory: async (
    userId: string
  ): Promise<{ success: boolean; touchpoints: Touchpoint[] }> => {
    return apiFetch(`/touchpoints/history?userId=${userId}`);
  },

  schedule: async (data: {
    veteranId: string;
    advocateId: string;
    scheduledDate: string;
    meetingType?: string;
    notes?: string;
  }): Promise<{ success: boolean; touchpoint: Touchpoint; message: string }> => {
    return apiFetch('/touchpoints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  complete: async (
    touchpointId: string,
    data: { summary?: string; nextSteps?: string[] }
  ): Promise<{ success: boolean; touchpoint: Touchpoint; message: string }> => {
    return apiFetch(`/touchpoints/${touchpointId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: async (touchpointId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/touchpoints/${touchpointId}/cancel`, {
      method: 'POST',
    });
  },
};

// Documents API
export const documentsApi = {
  upload: async (
    file: File,
    userId: string,
    claimId?: string,
    documentType?: string
  ): Promise<{ success: boolean; document: Document; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    if (claimId) formData.append('claimId', claimId);
    if (documentType) formData.append('documentType', documentType);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  },

  listByUser: async (userId: string): Promise<{ success: boolean; documents: Document[]; count: number }> => {
    return apiFetch(`/documents?userId=${userId}`);
  },

  listByClaim: async (claimId: string): Promise<{ success: boolean; documents: Document[]; count: number }> => {
    return apiFetch(`/documents/claim/${claimId}`);
  },

  get: async (documentId: string): Promise<{ success: boolean; document: Document }> => {
    return apiFetch(`/documents/${documentId}`);
  },

  getTypes: async (): Promise<{ success: boolean; documentTypes: DocumentType[] }> => {
    return apiFetch('/documents/types');
  },

  update: async (
    documentId: string,
    data: { claimId?: string; documentType?: string }
  ): Promise<{ success: boolean; document: Document; message: string }> => {
    return apiFetch(`/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (documentId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  getDownloadUrl: (documentId: string): string => {
    return `${API_BASE_URL}/documents/${documentId}/download`;
  },
};

// AI API
export const aiApi = {
  analyze: async (claimId: string): Promise<{ success: boolean; analysis: AnalysisResult }> => {
    return apiFetch(`/ai/analyze/${claimId}`, { method: 'POST' });
  },

  getAnalysis: async (claimId: string): Promise<{ success: boolean; analysis: AnalysisResult }> => {
    return apiFetch(`/ai/analysis/${claimId}`);
  },

  confirmAnalysis: async (claimId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/ai/analysis/${claimId}/confirm`, { method: 'POST' });
  },

  addCondition: async (
    claimId: string,
    data: { name: string; description?: string; vaCode?: string }
  ): Promise<{ success: boolean; condition: ExtractedCondition; message: string }> => {
    return apiFetch(`/ai/conditions/${claimId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCondition: async (
    conditionId: string,
    data: { name?: string; description?: string; vaCode?: string; claimedRating?: number; serviceConnected?: boolean }
  ): Promise<{ success: boolean; condition: ExtractedCondition; message: string }> => {
    return apiFetch(`/ai/conditions/${conditionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  removeCondition: async (conditionId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/ai/conditions/${conditionId}`, { method: 'DELETE' });
  },

  getDiagnosticCodes: async (search?: string): Promise<{ success: boolean; diagnosticCodes: DiagnosticCode[] }> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiFetch(`/ai/diagnostic-codes${query}`);
  },
};

// QA API
export const qaApi = {
  validate: async (claimId: string): Promise<{ success: boolean; qa: QAResult }> => {
    return apiFetch(`/qa/validate/${claimId}`, { method: 'POST' });
  },

  getResults: async (claimId: string): Promise<{ success: boolean; qa: QAResult }> => {
    return apiFetch(`/qa/${claimId}`);
  },

  approve: async (claimId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/qa/${claimId}/approve`, { method: 'POST' });
  },

  dismissIssue: async (issueId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/qa/issues/${issueId}/dismiss`, { method: 'POST' });
  },
};

// Evidence API
export const evidenceApi = {
  getByClaim: async (claimId: string): Promise<{
    success: boolean;
    evidenceLinks: EvidenceLink[];
    conditionsWithEvidence: ConditionWithEvidence[];
  }> => {
    return apiFetch(`/evidence/claim/${claimId}`);
  },

  getByCondition: async (conditionId: string): Promise<{ success: boolean; evidenceLinks: EvidenceLink[] }> => {
    return apiFetch(`/evidence/condition/${conditionId}`);
  },

  getSuggestions: async (claimId: string): Promise<{ success: boolean; suggestions: EvidenceSuggestion[] }> => {
    return apiFetch(`/evidence/suggest/${claimId}`);
  },

  link: async (data: {
    conditionId: string;
    documentId: string;
    relevanceScore?: number;
    pageReferences?: string;
    excerpts?: string;
    notes?: string;
  }): Promise<{ success: boolean; evidenceLink: EvidenceLink; message: string }> => {
    return apiFetch('/evidence/link', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLink: async (
    linkId: string,
    data: { relevanceScore?: number; pageReferences?: string; excerpts?: string; notes?: string }
  ): Promise<{ success: boolean; evidenceLink: EvidenceLink; message: string }> => {
    return apiFetch(`/evidence/link/${linkId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  unlink: async (linkId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/evidence/link/${linkId}`, { method: 'DELETE' });
  },

  confirm: async (claimId: string): Promise<{ success: boolean; message: string }> => {
    return apiFetch(`/evidence/confirm/${claimId}`, { method: 'POST' });
  },
};

// Submit API
export const submitApi = {
  getReadiness: async (claimId: string): Promise<{ success: boolean; readiness: SubmissionReadiness }> => {
    return apiFetch(`/submit/readiness/${claimId}`);
  },

  previewPackage: async (claimId: string): Promise<{ success: boolean; package: SubmissionPackage }> => {
    return apiFetch(`/submit/preview/${claimId}`);
  },

  submit: async (claimId: string): Promise<{ success: boolean; submission: SubmissionResult }> => {
    return apiFetch(`/submit/submit/${claimId}`, { method: 'POST' });
  },

  getStatus: async (claimId: string): Promise<{
    success: boolean;
    status: {
      claimId: string;
      vaClaimId: string;
      stage: string;
      status: string;
      submittedAt: string;
      estimatedDecisionDate?: string;
    };
  }> => {
    return apiFetch(`/submit/status/${claimId}`);
  },
};

// Messages API
export const messagesApi = {
  send: async (data: {
    senderId: string;
    recipientId: string;
    claimId?: string;
    subject?: string;
    content: string;
  }): Promise<{ success: boolean; message: Message }> => {
    return apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getInbox: async (userId: string): Promise<{ success: boolean; messages: Message[] }> => {
    return apiFetch(`/messages/inbox?userId=${userId}`);
  },

  getAdvocateMessages: async (userId: string): Promise<{ success: boolean; messages: Message[] }> => {
    return apiFetch(`/messages/advocate?userId=${userId}`);
  },

  getByClaimId: async (claimId: string): Promise<{ success: boolean; messages: Message[] }> => {
    return apiFetch(`/messages/claim/${claimId}`);
  },

  getConversation: async (userId1: string, userId2: string): Promise<{ success: boolean; messages: Message[] }> => {
    return apiFetch(`/messages/conversation?userId1=${userId1}&userId2=${userId2}`);
  },

  getUnreadCount: async (userId: string): Promise<{ success: boolean; unreadCount: number }> => {
    return apiFetch(`/messages/unread-count?userId=${userId}`);
  },

  markAsRead: async (messageId: string): Promise<{ success: boolean; message: Message }> => {
    return apiFetch(`/messages/${messageId}/read`, { method: 'POST' });
  },
};

// Forms API
export const formsApi = {
  listAvailable: async (claimId: string): Promise<{ success: boolean; forms: AvailableForm[]; conditionCount: number }> => {
    return apiFetch(`/forms/claim/${claimId}`);
  },

  generate526EZ: async (claimId: string): Promise<{ success: boolean; form: FormGenerationResult }> => {
    return apiFetch(`/forms/526ez/${claimId}`, { method: 'POST' });
  },

  generateNexusLetter: async (
    conditionId: string,
    data?: { medicalHistory?: string; serviceRecords?: string; diagnosisDate?: string; treatingPhysician?: string }
  ): Promise<{ success: boolean; nexusLetter: FormGenerationResult }> => {
    return apiFetch(`/forms/nexus/${conditionId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  generateDBQ: async (
    conditionId: string,
    data?: {
      examinationDate?: string;
      examinerInfo?: { name: string; credentials: string; facility: string };
      medicalHistory?: string;
      symptoms?: string[];
      functionalImpact?: string;
      onsetDate?: string;
    }
  ): Promise<{ success: boolean; dbq: FormGenerationResult }> => {
    return apiFetch(`/forms/dbq/${conditionId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },
};

// Export all APIs
export const api = {
  claims: claimsApi,
  advocates: advocatesApi,
  touchpoints: touchpointsApi,
  documents: documentsApi,
  ai: aiApi,
  qa: qaApi,
  evidence: evidenceApi,
  submit: submitApi,
  forms: formsApi,
  messages: messagesApi,
};

export default api;
