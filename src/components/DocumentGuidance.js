import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, FileText, Clock, CheckCircle, HelpCircle } from 'lucide-react';

const DOCUMENT_GUIDES = {
  dd214: {
    title: 'DD-214 (Discharge Papers)',
    icon: '📋',
    description: 'Your Certificate of Release or Discharge from Active Duty - this proves your military service.',
    whyNeeded: 'This document proves when and where you served, which is essential for connecting your conditions to your military service.',
    whereToFind: [
      'Check your personal records - you should have received a copy at discharge',
      'Look in your Veterans Affairs (VA) online account at VA.gov',
      'Contact your county Veterans Service Officer - they often have copies on file'
    ],
    howToRequest: {
      title: 'Request from National Personnel Records Center (NPRC)',
      steps: [
        'Go to eVetRecs at www.archives.gov/veterans',
        'Create an account or sign in',
        'Fill out Standard Form 180 online',
        'You\'ll receive it by mail in 2-4 weeks (or faster with premium service)'
      ],
      timeframe: '2-4 weeks by mail, or request expedited service',
      link: 'https://www.archives.gov/veterans/military-service-records'
    },
    tips: [
      'Request multiple certified copies while you\'re at it',
      'If you have a Member 4 copy, that works too',
      'Veterans discharged after 2000 may find records online at milConnect'
    ]
  },
  medical_records: {
    title: 'Medical Records',
    icon: '🏥',
    description: 'Current medical records showing your diagnoses and treatments.',
    whyNeeded: 'These prove your current conditions exist and their severity, which determines your disability rating.',
    whereToFind: [
      'Request from your current doctor or healthcare provider',
      'Download from VA Blue Button at VA.gov (if you use VA healthcare)',
      'Request from any hospital or clinic where you\'ve been treated'
    ],
    howToRequest: {
      title: 'How to Get Your Medical Records',
      steps: [
        'VA Records: Log into VA.gov → Health → Get Medical Records',
        'Private Doctor: Call their office and request copies (they may charge a small fee)',
        'Hospital: Contact their Medical Records department'
      ],
      timeframe: 'VA: Instant online. Private: 1-2 weeks',
      link: 'https://www.va.gov/health-care/get-medical-records/'
    },
    tips: [
      'Get records from the last 2-3 years if possible',
      'Include any specialist visits related to your conditions',
      'Mental health records are especially important for PTSD claims'
    ]
  },
  service_treatment_records: {
    title: 'Service Treatment Records (STRs)',
    icon: '📁',
    description: 'Medical records from when you were in the military.',
    whyNeeded: 'These can show that your condition started or was caused by events during your service - a key requirement for VA claims.',
    whereToFind: [
      'You may have received copies at separation',
      'Check if you kept any records in your personal files',
      'Some are available through VA.gov if you\'ve previously filed a claim'
    ],
    howToRequest: {
      title: 'Request from NPRC',
      steps: [
        'Go to eVetRecs at www.archives.gov/veterans',
        'Specifically request "Service Treatment Records"',
        'Include as much detail as possible about your service dates'
      ],
      timeframe: '2-6 weeks (varies based on record availability)',
      link: 'https://www.archives.gov/veterans/military-service-records'
    },
    tips: [
      'Don\'t worry if you can\'t find these - many veterans don\'t have them',
      'The VA will request these records as part of your claim',
      'If you remember specific incidents, note the dates for the VA'
    ]
  },
  buddy_statement: {
    title: 'Buddy Statements',
    icon: '👥',
    description: 'Written statements from fellow service members, family, or friends who witnessed your condition or its effects.',
    whyNeeded: 'If official records don\'t document an incident or condition, buddy statements can fill the gap and support your claim.',
    whereToFind: [
      'Reach out to people who served with you',
      'Family members who\'ve seen your symptoms',
      'Friends who knew you before and after service'
    ],
    howToRequest: {
      title: 'How to Get Buddy Statements',
      steps: [
        'Contact people who can verify your condition or service events',
        'Explain what you need them to write about',
        'Have them describe what they personally witnessed',
        'They should sign and date the statement'
      ],
      timeframe: 'Depends on your contacts - typically 1-2 weeks',
      link: null
    },
    tips: [
      'Statements should be specific with dates and details',
      'The writer should describe what they personally saw, not hearsay',
      'These are very powerful for PTSD, MST, and hard-to-document conditions'
    ]
  }
};

function DocumentGuideCard({ docType, isOpen, onToggle }) {
  const guide = DOCUMENT_GUIDES[docType];
  if (!guide) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{guide.icon}</span>
          <div className="text-left">
            <h4 className="font-medium text-gray-900">{guide.title}</h4>
            <p className="text-sm text-gray-500">{guide.description}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 text-sm">Why do you need this?</p>
                  <p className="text-sm text-blue-700 mt-1">{guide.whyNeeded}</p>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Where to Find It
              </h5>
              <ul className="space-y-2">
                {guide.whereToFind.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">{guide.howToRequest.title}</h5>
              <ol className="space-y-2 mb-3">
                {guide.howToRequest.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Typical timeframe: {guide.howToRequest.timeframe}</span>
              </div>
              {guide.howToRequest.link && (
                <a
                  href={guide.howToRequest.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Official Website
                </a>
              )}
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Helpful Tips</h5>
              <ul className="space-y-1">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-yellow-500">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentGuidance({ onClose }) {
  const [openDocs, setOpenDocs] = useState({ dd214: true });

  const toggleDoc = (docType) => {
    setOpenDocs(prev => ({ ...prev, [docType]: !prev[docType] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">How to Get Your Documents</h2>
          <p className="text-gray-600 mt-1">
            We'll help you gather everything you need for a strong claim. Click each document to learn more.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {Object.keys(DOCUMENT_GUIDES).map(docType => (
              <DocumentGuideCard
                key={docType}
                docType={docType}
                isOpen={openDocs[docType]}
                onToggle={() => toggleDoc(docType)}
              />
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Don't have everything yet? That's okay!</h4>
            <p className="text-sm text-green-700">
              Upload what you have now, and we'll tell you what else might help your claim. 
              The VA will also request some records on your behalf. You can always add more documents later.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Got It - Let's Upload Documents
          </button>
        </div>
      </div>
    </div>
  );
}

export function DocumentHelpButton({ docType, className = '' }) {
  const [showGuide, setShowGuide] = useState(false);
  const guide = DOCUMENT_GUIDES[docType];

  if (!guide) return null;

  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className={`text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 ${className}`}
      >
        <HelpCircle className="h-4 w-4" />
        How to get this
      </button>

      {showGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <DocumentGuideCard docType={docType} isOpen={true} onToggle={() => {}} />
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
