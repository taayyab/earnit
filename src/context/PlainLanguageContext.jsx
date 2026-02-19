import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'earnedit-plain-language-mode';

const PlainLanguageContext = createContext({
  usePlainLanguage: true,
  toggleLanguageMode: () => {},
  setPlainLanguage: () => {}
});

export function PlainLanguageProvider({ children }) {
  const [usePlainLanguage, setUsePlainLanguage] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(usePlainLanguage));
  }, [usePlainLanguage]);

  const toggleLanguageMode = useCallback(() => {
    setUsePlainLanguage(prev => !prev);
  }, []);

  const setPlainLanguage = useCallback((value) => {
    setUsePlainLanguage(value);
  }, []);

  const value = {
    usePlainLanguage,
    toggleLanguageMode,
    setPlainLanguage
  };

  return (
    <PlainLanguageContext.Provider value={value}>
      {children}
    </PlainLanguageContext.Provider>
  );
}

export function useLanguageMode() {
  const context = useContext(PlainLanguageContext);
  // Context always has default value, so this returns safe defaults when no provider is present
  // This allows components to work both inside and outside the provider
  return context;
}

export default PlainLanguageContext;
