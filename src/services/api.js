const DEMO_ENDPOINT_MAP = {
  '/api/claims-intelligence/analyze-documents': '/api/claims-intelligence/demo/analysis',
  '/api/claims-intelligence/pre-assemble-claim': '/api/claims-intelligence/demo/claim-package',
  '/api/claims-intelligence/generate-nexus-letter': '/api/claims-intelligence/demo/nexus-letter',
  '/api/documents/upload': '/api/documents/demo/upload-documents',
  '/api/claims-intelligence/trigger-analysis': '/api/claims-intelligence/demo/trigger-analysis',
  '/api/claims-intelligence/submit-claim': '/api/claims-intelligence/demo/submit-claim',
  '/api/rdb/generate': '/api/rdb/demo',
  '/api/assistant/chat': '/api/assistant/demo/chat-response',
  '/api/service-history': '/api/service-history/demo',
  '/api/claims-status': '/api/claims-status/demo',
  '/api/community-care': '/api/community-care/demo',
  '/api/benefits-reference': '/api/benefits-reference/demo',
  '/api/appealable-issues': '/api/appealable-issues/demo',
  '/api/legacy-appeals': '/api/legacy-appeals/demo',
  '/api/facilities': '/api/facilities/demo',
  '/api/fhir': '/api/fhir/demo',
  '/api/forms': '/api/forms/demo',
  '/api/appeals': '/api/appeals/demo',
  '/api/auth/idme': '/api/auth/idme/demo/status',
  '/api/va': '/api/va/demo/status',
  '/api/ai/test': '/api/ai/demo/test',
};

function getDemoEndpoint(originalUrl, isDemoMode) {
  if (!isDemoMode) return originalUrl;
  
  const urlObj = new URL(originalUrl, window.location.origin);
  const pathname = urlObj.pathname;
  
  for (const [prodEndpoint, demoEndpoint] of Object.entries(DEMO_ENDPOINT_MAP)) {
    if (pathname === prodEndpoint || pathname.startsWith(prodEndpoint + '/')) {
      if (demoEndpoint.includes('?')) {
        const [demoPath, demoQuery] = demoEndpoint.split('?');
        urlObj.pathname = demoPath;
        const existingParams = urlObj.searchParams;
        const demoParams = new URLSearchParams(demoQuery);
        for (const [key, value] of demoParams) {
          existingParams.set(key, value);
        }
      } else {
        urlObj.pathname = demoEndpoint;
      }
      return urlObj.toString();
    }
  }
  
  urlObj.searchParams.set('demo', 'true');
  return urlObj.toString();
}

export function createDemoFetch(isDemoMode) {
  return async function demoFetch(url, options = {}) {
    const targetUrl = getDemoEndpoint(url, isDemoMode);
    
    const fetchOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };
    
    const response = await fetch(targetUrl, fetchOptions);
    return response;
  };
}

export function appendDemoQueryParam(url, isDemoMode) {
  if (!isDemoMode) return url;
  
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set('demo', 'true');
  return urlObj.toString();
}

export { DEMO_ENDPOINT_MAP, getDemoEndpoint };
