import { useMemo, useCallback } from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { createDemoFetch, getDemoEndpoint, DEMO_ENDPOINT_MAP } from '../services/api';

export function useDemoApi() {
  const { isDemoMode, demoProfile, appendDemoParam, getDemoQueryString } = useDemoMode();
  
  const demoFetch = useMemo(() => {
    return createDemoFetch(isDemoMode);
  }, [isDemoMode]);
  
  const getEndpoint = useCallback((url) => {
    return getDemoEndpoint(url, isDemoMode);
  }, [isDemoMode]);
  
  const demoPost = useCallback(async (url, data, options = {}) => {
    return demoFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }, [demoFetch]);
  
  const demoGet = useCallback(async (url, options = {}) => {
    return demoFetch(url, {
      method: 'GET',
      ...options,
    });
  }, [demoFetch]);
  
  return {
    isDemoMode,
    demoProfile,
    demoFetch,
    demoGet,
    demoPost,
    getEndpoint,
    appendDemoParam,
    getDemoQueryString,
    DEMO_ENDPOINT_MAP,
  };
}

export default useDemoApi;
