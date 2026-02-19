import { useState, useEffect, useCallback, useRef } from 'react';

const AUTOSAVE_INTERVAL = 30000;

export function useDraftSave(formKey, formData, setFormData, options = {}) {
  const {
    autoSaveInterval = AUTOSAVE_INTERVAL,
    importantFields = [],
    onDraftLoaded = null,
    onDraftSaved = null,
  } = options;

  const [lastSaved, setLastSaved] = useState(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialFormData = useRef(null);
  const hasLoadedDraft = useRef(false);

  const getStorageKey = useCallback(() => {
    return `draft_${formKey}`;
  }, [formKey]);

  const saveDraft = useCallback(() => {
    try {
      const draftData = {
        formData,
        savedAt: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(draftData));
      setLastSaved(new Date());
      setShowSavedIndicator(true);
      setIsDirty(false);
      
      setTimeout(() => {
        setShowSavedIndicator(false);
      }, 2000);

      if (onDraftSaved) {
        onDraftSaved(draftData);
      }
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, [formData, getStorageKey, onDraftSaved]);

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const draftData = JSON.parse(saved);
        return draftData;
      }
    } catch (error) {
      console.warn('Failed to load draft:', error);
    }
    return null;
  }, [getStorageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
      setHasDraft(false);
      setIsDirty(false);
      setLastSaved(null);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }, [getStorageKey]);

  const resumeDraft = useCallback(() => {
    const draftData = loadDraft();
    if (draftData && draftData.formData) {
      setFormData(draftData.formData);
      setLastSaved(new Date(draftData.savedAt));
      setHasDraft(false);
      if (onDraftLoaded) {
        onDraftLoaded(draftData);
      }
    }
  }, [loadDraft, setFormData, onDraftLoaded]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setHasDraft(false);
  }, [clearDraft]);

  const handleImportantFieldChange = useCallback(() => {
    setIsDirty(true);
    saveDraft();
  }, [saveDraft]);

  useEffect(() => {
    if (hasLoadedDraft.current) return;
    hasLoadedDraft.current = true;

    const draftData = loadDraft();
    if (draftData && draftData.formData) {
      const hasData = Object.values(draftData.formData).some(value => {
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => 
            typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined
          );
        }
        return value !== null && value !== undefined && value !== '';
      });
      
      if (hasData) {
        setHasDraft(true);
        initialFormData.current = draftData.formData;
      }
    }
  }, [loadDraft]);

  useEffect(() => {
    if (!isDirty) {
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData.current || {});
      if (hasChanges) {
        setIsDirty(true);
      }
    }
  }, [formData, isDirty]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isDirty) {
        saveDraft();
      }
    }, autoSaveInterval);

    return () => clearInterval(intervalId);
  }, [autoSaveInterval, isDirty, saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const DraftSavedIndicator = useCallback(() => {
    if (!showSavedIndicator && !lastSaved) return null;
    
    return (
      <div 
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          showSavedIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Draft saved
        </div>
      </div>
    );
  }, [showSavedIndicator, lastSaved]);

  const ResumeDraftPrompt = useCallback(({ onResume, onDiscard }) => {
    if (!hasDraft) return null;

    const draftData = loadDraft();
    const savedAt = draftData?.savedAt ? new Date(draftData.savedAt) : null;
    const formattedDate = savedAt ? savedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }) : '';

    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Resume your registration?</h3>
            <p className="mt-1 text-sm text-blue-700">
              You have a saved draft from {formattedDate}. Would you like to continue where you left off?
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  onResume ? onResume() : resumeDraft();
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  onDiscard ? onDiscard() : discardDraft();
                }}
                className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50 transition-colors"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [hasDraft, loadDraft, resumeDraft, discardDraft]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    resumeDraft,
    discardDraft,
    handleImportantFieldChange,
    lastSaved,
    showSavedIndicator,
    hasDraft,
    isDirty,
    DraftSavedIndicator,
    ResumeDraftPrompt,
  };
}

export default useDraftSave;
