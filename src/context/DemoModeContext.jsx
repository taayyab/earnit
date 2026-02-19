import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const DEMO_VETERAN_PROFILE = {
  id: "demo-veteran-001",
  user_id: "demo-veteran-001",
  va_icn: "1012845331V153043",
  first_name: "Marcus",
  last_name: "Thompson",
  email: "marcus.thompson@earnedit.demo",
  role: "veteran",
  is_demo: true,
  state: "TX",
  city: "Austin",
  branch: "Army",
  service_years: "2010-2018",
  rank: "E-5 (Sergeant)",
  discharge_status: "Honorable",
  representation_mode: "earnedit_agent"
};

const DemoModeContext = createContext({
  isDemoMode: false,
  demoProfile: null,
  appendDemoParam: (url) => url,
  getDemoQueryString: () => '',
});

export function DemoModeProvider({ children }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const isDemoMode = useMemo(() => {
    const demoParam = searchParams.get('demo');
    return demoParam === 'true' || demoParam === '1';
  }, [searchParams]);

  const demoProfile = useMemo(() => {
    return isDemoMode ? DEMO_VETERAN_PROFILE : null;
  }, [isDemoMode]);

  const appendDemoParam = (url) => {
    if (!isDemoMode) return url;
    
    if (typeof url !== 'string') return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}demo=true`;
  };

  const getDemoQueryString = () => {
    return isDemoMode ? '?demo=true' : '';
  };

  const value = useMemo(() => ({
    isDemoMode,
    demoProfile,
    appendDemoParam,
    getDemoQueryString,
  }), [isDemoMode, demoProfile]);

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

export default DemoModeContext;
