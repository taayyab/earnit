/**
 * API Client for EarnedIt Platform
 */

import axios from 'axios';

const API_URL = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api` 
  : '/api';

// Create axios instance with credentials for cookie-based auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper to get CSRF token from cookie
const getCsrfToken = () => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
};

// Add token to requests (fallback for localStorage-based auth during migration)
// Also include CSRF token for state-changing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Include CSRF token for non-GET requests
  if (config.method !== 'get') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['x-csrftoken'] = csrfToken;
    }
  }
  
  return config;
});

// Handle auth errors (401/403) - clear auth state and redirect to login
// For demo users, be more lenient to prevent environment reset on non-critical errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    
    // Critical auth endpoints that should always trigger logout
    const criticalAuthEndpoints = [
      '/auth/me',
      '/auth/session',
      '/auth/logout'
    ];
    
    // Check if this is a critical auth error
    const isCriticalAuthError = criticalAuthEndpoints.some(endpoint => 
      requestUrl.includes(endpoint)
    );
    
    if (status === 401 || status === 403) {
      // Check if current user is a demo user
      const storedUser = localStorage.getItem('user');
      let isDemoUser = false;
      
      try {
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          isDemoUser = userData.is_demo === true || 
                       userData.email?.endsWith('@earnedit.demo');
        }
      } catch (e) {
        // If we can't parse user data, proceed with normal flow
      }
      
      // For demo users, only redirect on critical auth endpoint failures
      // This prevents environment reset when non-critical endpoints return 401/403
      if (isDemoUser && !isCriticalAuthError) {
        // Just reject the error without clearing auth state
        // The component can handle the error gracefully
        console.warn(`Demo user: Non-critical auth error on ${requestUrl}, preserving session`);
        return Promise.reject(error);
      }
      
      // For non-demo users or critical auth errors, clear auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('mfaRequired');
      localStorage.removeItem('mfaVerified');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password, role = 'veteran') => api.post('/auth/dev-login', { email, password, role }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getSession: () => api.get('/auth/session'),
  logout: () => api.post('/auth/logout'),
  demoLogin: (accountType = 'veteran') => api.post('/auth/demo-login', { account_type: accountType }),
  getDemoCredentials: () => api.get('/auth/demo-credentials'),
  initializeDemo: () => api.post('/auth/demo-init'),
  vaLighthouseDemo: () => api.post('/auth/va-lighthouse-demo'),
};

// Claims API
export const claimsAPI = {
  create: (data) => api.post('/claims/create', data),
  list: () => api.get('/claims/list'),
  get: (id) => api.get(`/claims/${id}`),
  update: (id, data) => api.put(`/claims/${id}`, data),
};

// Agent API (for claims agents)
export const agentAPI = {
  getClaim: (id) => api.get(`/agent/claims/${id}`),
  getClaims: (params) => api.get('/agent/claims', { params }),
  getKanban: (params) => api.get('/agent/kanban', { params }),
  assignClaim: (claimId) => api.post('/agent/assign', { claim_id: claimId }),
  moveClaim: (claimId, newStatus) => api.post('/agent/kanban/move', { claim_id: claimId, new_status: newStatus }),
  reviewClaim: (claimId, approved, notes) => api.post('/agent/review', { claim_id: claimId, approved, notes }),
  qaApprove: (claimId, passed, notes) => api.post('/agent/qa-approve', { claim_id: claimId, passed, notes }),
  submitToVA: (claimId) => api.post(`/agent/submit/${claimId}`),
  getWorkload: () => api.get('/agent/workload'),
  getDashboard: () => api.get('/agent/dashboard'),
};

// Intake API
export const intakeAPI = {
  submit: (data) => api.post('/intake/submit', data),
  getResponses: (claimId) => api.get('/intake/responses', { params: { claim_id: claimId } }),
};

// Documents API
export const documentsAPI = {
  upload: (file, claimId, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (claimId) formData.append('claim_id', claimId);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
      timeout: 300000,
    });
  },
  list: (claimId) => api.get('/documents/list', { params: claimId ? { claim_id: claimId } : {} }),
  get: (id) => api.get(`/documents/${id}`),
  getConfig: () => api.get('/documents/config'),
};

// AI API
export const aiAPI = {
  searchCodes: (query, limit = 5) => api.get('/ai/search-codes', { params: { query, limit } }),
  getCode: (code) => api.get(`/ai/code/${code}`),
  mapCondition: (data) => api.post('/ai/map-condition', data),
  scoreEvidence: (data) => api.post('/ai/score-evidence', data),
};

// MFA API
export const mfaAPI = {
  getStatus: () => api.get('/mfa/status'),
  setup: () => api.post('/mfa/setup'),
  verifySetup: (code) => api.post('/mfa/verify-setup', { code }),
  verify: (code) => api.post('/mfa/verify', { code }),
  disable: (code) => api.post('/mfa/disable', { code }),
  regenerateBackupCodes: (code) => api.post('/mfa/regenerate-backup-codes', { code }),
};

// ID.me OAuth API
export const idmeAPI = {
  getStatus: () => api.get('/auth/idme/status'),
  getLoginUrl: (linkUserId) => api.get('/auth/idme/login-url', { params: linkUserId ? { link_user_id: linkUserId } : {} }),
  callback: (code, state) => api.post('/auth/idme/callback', { code, state }),
};

// VA Lighthouse API
export const vaAPI = {
  getStatus: () => api.get('/va/status'),
  submit: (claimId) => api.post('/va/submit', { claim_id: claimId }),
  getClaimStatus: (claimId) => api.get(`/va/claim/${claimId}/status`),
  getPendingSubmissions: () => api.get('/va/pending-submissions'),
  pollStatus: (submissionId) => api.get(`/va/poll-status/${submissionId}`),
};

// Appeals API
export const appealsAPI = {
  createCase: (data) => api.post('/appeals/cases', data),
  getCase: (caseId) => api.get(`/appeals/cases/${caseId}`),
  analyzeCase: (caseId, documentId) => api.post(`/appeals/cases/${caseId}/analyze`, { document_id: documentId }),
  getAnalysis: (caseId) => api.get(`/appeals/cases/${caseId}/analysis`),
  getRoadmap: (caseId) => api.get(`/appeals/cases/${caseId}/roadmap`),
  refreshRoadmap: (caseId) => api.post(`/appeals/cases/${caseId}/roadmap/refresh`),
  verifyIssue: (issueId, data) => api.patch(`/appeals/issues/${issueId}/verify`, data),
  updateEvidence: (issueId, data) => api.post(`/appeals/issues/${issueId}/evidence`, data),
  uploadDenialLetter: (caseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'denial_letter');
    return api.post(`/appeals/cases/${caseId}/upload-denial-letter`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Templates API - Letter templates and generation
export const templatesAPI = {
  list: (query, category) => api.get('/templates/list', { params: { query, category } }),
  getCategories: () => api.get('/templates/categories'),
  get: (templateId) => api.get(`/templates/${templateId}`),
  preview: (templateId) => api.get(`/templates/${templateId}/preview`),
  generate: (templateId, claimId, additionalData) => 
    api.post(`/templates/${templateId}/generate`, { claim_id: claimId, additional_data: additionalData }),
  send: (templateId, claimId, recipientEmail, additionalData, subject) =>
    api.post(`/templates/${templateId}/send`, { 
      claim_id: claimId, 
      recipient_email: recipientEmail,
      additional_data: additionalData,
      subject 
    }),
  validate: (templateId, fieldValues) =>
    api.post(`/templates/${templateId}/validate`, { field_values: fieldValues }),
  downloadPdf: (templateId, claimId, additionalData) =>
    api.post(`/templates/${templateId}/generate/pdf`, 
      { claim_id: claimId, additional_data: additionalData },
      { responseType: 'blob' }
    ),
  createInstance: (templateId, claimId, conditionId, title, autoPopulate) =>
    api.post('/templates/instances', { 
      template_id: templateId, 
      claim_id: claimId, 
      condition_id: conditionId,
      title,
      auto_populate: autoPopulate 
    }),
  getMyInstances: (status) => api.get('/templates/instances/my', { params: { status } }),
  getInstance: (instanceId) => api.get(`/templates/instances/${instanceId}`),
  updateInstance: (instanceId, fieldValues) => 
    api.put(`/templates/instances/${instanceId}`, { field_values: fieldValues }),
  renderInstance: (instanceId) => api.get(`/templates/instances/${instanceId}/render`),
  populateWithAI: (instanceId) => api.post(`/templates/instances/${instanceId}/populate`),
};

// MEB/IDES API - Medical Evaluation Board claims
export const mebAPI = {
  createMEBClaim: (data) => api.post('/claims/meb-intake', data),
  getMEBStatus: (claimId) => api.get(`/claims/${claimId}/meb-status`),
  updateMEBPhase: (claimId, newPhase, fitnessFindings, notes) => 
    api.put(`/claims/${claimId}/meb-phase`, { new_phase: newPhase, fitness_finding: fitnessFindings, notes }),
  updateMEBEvidence: (claimId, evidenceId, documentId, status) =>
    api.put(`/claims/${claimId}/meb-evidence`, { evidence_id: evidenceId, document_id: documentId, status }),
};

// Conditions API - Condition tracking and secondary conditions
export const conditionsAPI = {
  getClaimConditions: (claimId) => api.get(`/conditions/claim/${claimId}`),
  selectConditions: (claimId, conditionIds) => api.post(`/conditions/claim/${claimId}/select`, { condition_ids: conditionIds }),
  getSecondaryRecommendations: (conditionId) => api.get(`/conditions/condition/${conditionId}/secondary-recommendations`),
  linkSecondary: (data) => api.post('/conditions/link-secondary', data),
  getConditionRequirements: (conditionId) => api.get(`/conditions/condition/${conditionId}/requirements`),
  getDashboardSummary: () => api.get('/conditions/dashboard/summary'),
  updateEvidenceStatus: (evidenceId, status, notes) => api.put(`/conditions/evidence/${evidenceId}/status`, { status, notes }),
};

// Priority Processing API
export const priorityProcessingAPI = {
  getEligibility: (veteranId) => veteranId 
    ? api.get(`/priority-processing/eligibility/${veteranId}`) 
    : api.get('/priority-processing/eligibility'),
  getStatus: (claimId) => api.get(`/priority-processing/status/${claimId}`),
  requestPriority: (claimId, reason) => api.post(`/priority-processing/request/${claimId}`, reason ? { reason } : {}),
  generateForm: (claimId) => api.post(`/priority-processing/generate-form/${claimId}`),
};

// Orchestration API - Claim lifecycle and stage management
export const orchestrationAPI = {
  getAggregate: (claimId) => api.get(`/orchestration/claims/${claimId}/aggregate`),
  getStage: (claimId) => api.get(`/orchestration/claims/${claimId}/stage`),
  transitionStage: (claimId, targetStage, force = false) => 
    api.post(`/orchestration/claims/${claimId}/transition`, { target_stage: targetStage, force }),
  getSuggestedConditions: (claimId) => api.get(`/orchestration/claims/${claimId}/suggested-conditions`),
  verifyCondition: (claimId, conditionName, accepted) => 
    api.post(`/orchestration/claims/${claimId}/verify-condition`, { condition_name: conditionName, accepted }),
  getEvidenceChecklist: (claimId) => api.get(`/orchestration/claims/${claimId}/evidence-checklist`),
  getDeficiencyTasks: (claimId) => api.get(`/orchestration/claims/${claimId}/deficiency-tasks`),
  linkDocument: (claimId, documentId, requirementId) => 
    api.post(`/orchestration/claims/${claimId}/link-document`, { document_id: documentId, requirement_id: requirementId }),
  getMedicationAnalysis: (claimId) => api.get(`/orchestration/claims/${claimId}/medication-analysis`),
  addSecondaryCondition: (claimId, conditionName, primaryConditionName) => 
    api.post(`/orchestration/claims/${claimId}/add-secondary-condition`, null, { 
      params: { condition_name: conditionName, primary_condition_name: primaryConditionName } 
    }),
  checkSubmissionReadiness: (claimId) => api.get(`/orchestration/claims/${claimId}/submission-readiness`),
  getJourneyProgress: (claimId) => api.get(`/orchestration/claims/${claimId}/journey-progress`),
  getNextActions: (claimId) => api.get(`/orchestration/claims/${claimId}/next-actions`),
};

// Benefits Reference Data API - VA disability codes and contention types
export const benefitsReferenceAPI = {
  searchDisabilities: (query, category, limit = 20) => 
    api.get('/benefits-reference/disabilities', { params: { query, category, limit } }),
  getContentionTypes: () => api.get('/benefits-reference/contention-types'),
  getSpecialIssues: (query) => api.get('/benefits-reference/special-issues', { params: { query } }),
  getCategories: () => api.get('/benefits-reference/categories'),
};

// Evidence API - Evidence verification and analysis
export const evidenceAPI = {
  getMatrix: (claimId) => api.get(`/evidence/matrix/${claimId}`),
  getDeficiencies: (claimId) => api.get(`/evidence/deficiencies/${claimId}`),
  runGapAnalysis: (claimId) => api.post(`/evidence/gap-analysis/${claimId}`),
  getContentVerification: (claimId, documentId) => 
    api.get(`/evidence/content-verification/${claimId}`, { 
      params: documentId ? { document_id: documentId } : {} 
    }),
  tagDocument: (documentId, data) => api.post(`/evidence/tag/${documentId}`, data),
  getCategories: () => api.get('/evidence/categories'),
};

// Predictions API - Rating predictions and explanations
export const predictionsAPI = {
  getRatingPrediction: (claimId, conditions, documents, serviceInfo = {}) => 
    api.post('/predictions/rating', { 
      claim_id: claimId, 
      conditions, 
      documents,
      service_info: serviceInfo 
    }),
  explainPrediction: (claimId) => api.get(`/predictions/explain/${claimId}`),
  getSingleConditionPrediction: (condition, evidence) => 
    api.post('/predictions/rating/single', { condition, evidence }),
  getCombinedPrediction: (conditions, serviceInfo) => 
    api.post('/predictions/rating/combined', { conditions, service_info: serviceInfo }),
  getRatingFactors: (diagnosticCode) => api.get(`/predictions/factors/${diagnosticCode}`),
  getPredictionHistory: (claimId) => api.get(`/predictions/history/${claimId}`),
  calculateCombinedRating: (ratings) => api.post('/predictions/calculate-combined', ratings),
};

// DBQ API - Disability Benefits Questionnaire pre-fill and management
export const dbqAPI = {
  getTypes: () => api.get('/dbq/types'),
  getTemplate: (dbqType) => api.get(`/dbq/template/${dbqType}`),
  getBlank: (dbqType) => api.get(`/dbq/blank/${dbqType}`),
  prefill: (dbqType, documentIds, existingData = null) => 
    api.post('/dbq/prefill', { 
      dbq_type: dbqType, 
      document_ids: documentIds,
      existing_data: existingData 
    }),
  prefillLegacy: (dbqType, documentTexts, existingData = null) => 
    api.post('/dbq/prefill', { 
      dbq_type: dbqType, 
      document_texts: documentTexts,
      existing_data: existingData 
    }),
  extract: (dbqType, documentText, sectionName = null) => 
    api.post('/dbq/extract', { 
      dbq_type: dbqType, 
      document_text: documentText,
      section_name: sectionName 
    }),
  suggest: (conditions) => api.post('/dbq/suggest', { conditions }),
  validate: (dbqData) => api.post('/dbq/validate', { dbq_data: dbqData }),
  extractMedicalData: (documentText, extractionTypes = null, dbqType = null) =>
    api.post('/dbq/extract-medical-data', { 
      document_text: documentText, 
      extraction_types: extractionTypes,
      dbq_type: dbqType 
    }),
  getConditionMapping: () => api.get('/dbq/condition-mapping'),
  getForCondition: (condition) => api.get(`/dbq/for-condition/${encodeURIComponent(condition)}`),
  getLibrary: (demo = false) => api.get('/dbq/library', { params: { demo } }),
  getLibraryByCategory: (categoryId) => api.get(`/dbq/library/${categoryId}`),
  verifyVersion: (dbqType) => api.get(`/dbq/verify-version/${dbqType}`),
};
