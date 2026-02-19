import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from './ui/button';

export default function ExternalLinkWarning({ 
  href, 
  children, 
  className = '',
  showIcon = true 
}) {
  const [showModal, setShowModal] = useState(false);

  const isExternalLink = (url) => {
    if (!url) return false;
    try {
      const linkUrl = new URL(url, window.location.origin);
      return linkUrl.origin !== window.location.origin;
    } catch {
      return url.startsWith('http://') || url.startsWith('https://');
    }
  };

  const handleClick = (e) => {
    if (isExternalLink(href)) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const handleContinue = () => {
    window.open(href, '_blank', 'noopener,noreferrer');
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  if (!isExternalLink(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <>
      <a 
        href={href} 
        onClick={handleClick}
        className={`inline-flex items-center gap-1 ${className}`}
        rel="noopener noreferrer"
      >
        {children}
        {showIcon && <ExternalLink className="w-3 h-3 opacity-70" />}
      </a>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="external-link-title"
          >
            <div className="bg-amber-50 border-b border-amber-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 id="external-link-title" className="font-semibold text-amber-900">
                    Leaving EarnedIT
                  </h2>
                </div>
                <button 
                  onClick={handleCancel}
                  className="p-1 hover:bg-amber-200 rounded-full transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5 text-amber-700" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700">
                You are about to leave the EarnedIT platform and navigate to an external website.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Destination:</p>
                <p className="text-sm text-slate-800 font-medium break-all">
                  {href}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 text-sm">Important Notice</p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>Our Terms of Service no longer apply</li>
                      <li>Our Privacy Policy no longer protects your data</li>
                      <li>The external site has its own terms and privacy practices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-4 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Stay on EarnedIT
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Continue to External Site
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useExternalLinkWarning() {
  const [pendingUrl, setPendingUrl] = useState(null);

  const openExternalLink = (url) => {
    setPendingUrl(url);
  };

  const confirmNavigation = () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank', 'noopener,noreferrer');
      setPendingUrl(null);
    }
  };

  const cancelNavigation = () => {
    setPendingUrl(null);
  };

  return {
    pendingUrl,
    openExternalLink,
    confirmNavigation,
    cancelNavigation
  };
}
