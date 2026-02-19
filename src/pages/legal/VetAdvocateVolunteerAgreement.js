import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Shield, Heart, AlertTriangle, Phone, Calendar, CheckCircle2 } from 'lucide-react';

export default function VetAdvocateVolunteerAgreement({ onAccept, signerName }) {
  const [agreed, setAgreed] = useState({
    responsibilities: false,
    confidentiality: false,
    emergencyProtocol: false,
    scheduling: false,
    termination: false,
    userPrivacyCommitment: false
  });

  const allAgreed = Object.values(agreed).every(v => v);

  const handleAccept = () => {
    if (allAgreed && onAccept) {
      onAccept({
        agreement_type: 'volunteer_agreement',
        version: '1.0',
        accepted: true,
        accepted_at: new Date().toISOString(),
        signer_name: signerName,
        sections_confirmed: agreed
      });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1B3A5F]">
          <Heart className="w-6 h-6" aria-hidden="true" />
          Vet Advocate Volunteer Agreement
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Thank you for volunteering to support fellow veterans. Please review and accept
          each section of this agreement.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#1B3A5F] mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Core Responsibilities</h3>
              <div className="text-sm text-slate-600 mt-2 space-y-2">
                <p>As a Vet Advocate, I agree to:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Treat all veterans with dignity, respect, and compassion</li>
                  <li>Advocate for assigned veterans to the best of my ability</li>
                  <li>Provide encouragement and guidance through the claims process</li>
                  <li>Proactively identify support services that may improve their quality of life</li>
                  <li>Respond to veteran communications within 48 hours</li>
                  <li>Complete required training modules before being assigned veterans</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.responsibilities}
                  onChange={(e) => setAgreed(prev => ({ ...prev, responsibilities: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm font-medium">I understand and accept these responsibilities</span>
              </label>
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Confidentiality & Privacy</h3>
              <div className="text-sm text-slate-600 mt-2 space-y-2">
                <p>I understand that:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>I will <strong>NOT</strong> have access to veteran ePHI (electronic Protected Health Information) unless the veteran expressly grants consent</li>
                  <li>Any information shared by veterans is confidential and must not be disclosed to third parties</li>
                  <li>I will not request SSN, financial information, or medical records directly from veterans</li>
                  <li>All communications should occur through the EarnedIt platform for security</li>
                  <li>Consent can be revoked by the veteran at any time</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.confidentiality}
                  onChange={(e) => setAgreed(prev => ({ ...prev, confidentiality: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm font-medium">I agree to maintain confidentiality and respect privacy boundaries</span>
              </label>
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Emergency Protocol</h3>
              <div className="text-sm text-slate-600 mt-2 space-y-2">
                <p>I agree to immediately report any of the following situations:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><strong>Mental health crisis:</strong> If a veteran expresses thoughts of self-harm or suicide, I will provide the Veterans Crisis Line (988, Press 1) and report through the platform immediately</li>
                  <li><strong>Medical emergency:</strong> Direct the veteran to call 911 and report the situation</li>
                  <li><strong>Safety concerns:</strong> Any situation where the veteran or others may be at risk</li>
                  <li><strong>Abuse or neglect:</strong> Signs of elder abuse, domestic violence, or self-neglect</li>
                </ul>
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <p className="font-medium text-red-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Veterans Crisis Line: 988 (Press 1)
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.emergencyProtocol}
                  onChange={(e) => setAgreed(prev => ({ ...prev, emergencyProtocol: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm font-medium">I understand and will follow the emergency reporting protocol</span>
              </label>
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#1B3A5F] mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Scheduling & Availability</h3>
              <div className="text-sm text-slate-600 mt-2 space-y-2">
                <p>I commit to:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Maintaining accurate availability in my profile</li>
                  <li>Honoring scheduled meetings with veterans</li>
                  <li>Providing at least 24 hours notice if I need to reschedule</li>
                  <li>Prioritizing veteran-initiated meeting requests</li>
                  <li>Conducting regular check-ins with assigned veterans (minimum monthly)</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.scheduling}
                  onChange={(e) => setAgreed(prev => ({ ...prev, scheduling: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm font-medium">I agree to maintain my schedule and honor commitments</span>
              </label>
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Termination & Suspension</h3>
              <div className="text-sm text-slate-600 mt-2 space-y-2">
                <p>I understand that:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>This is a volunteer position and I may resign at any time with proper notice</li>
                  <li>EarnedIt may suspend or terminate my advocate status for violation of this agreement</li>
                  <li>Grounds for immediate termination include: breach of confidentiality, failure to report emergencies, harassment, or conduct harmful to veterans</li>
                  <li>Upon termination, I will have no further access to the advocate portal or veteran information</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.termination}
                  onChange={(e) => setAgreed(prev => ({ ...prev, termination: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm font-medium">I understand the termination policy</span>
              </label>
            </div>
          </div>
        </section>

        <section className="border rounded-lg p-4 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">User Privacy Commitment</h3>
              <div className="text-sm text-slate-600 mt-2 space-y-2">
                <p>I agree to be bound by EarnedIT's privacy commitments to veterans:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>I will protect any veteran information I access with the same care as EarnedIT</li>
                  <li>I understand EarnedIT's Privacy Policy applies to how I handle veteran data</li>
                  <li>I will never share veteran information with unauthorized third parties</li>
                  <li>If I become aware of any data breach or security concern, I will report it immediately</li>
                </ul>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.userPrivacyCommitment}
                  onChange={(e) => setAgreed(prev => ({ ...prev, userPrivacyCommitment: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#1B3A5F] focus:ring-[#1B3A5F]"
                />
                <span className="text-sm font-medium">I agree to uphold EarnedIT's privacy commitments to veterans</span>
              </label>
            </div>
          </div>
        </section>

        <div className="border-t pt-4">
          <p className="text-sm text-slate-600 mb-4">
            By clicking "I Accept", I certify that I have read and agree to all sections of this
            Volunteer Agreement. I understand that this is a binding commitment and that I will
            be held accountable for my actions as a Vet Advocate.
          </p>
          <Button
            onClick={handleAccept}
            disabled={!allAgreed}
            className="w-full bg-[#1B3A5F] hover:bg-[#2a4a6f] disabled:opacity-50"
          >
            {allAgreed ? 'I Accept the Volunteer Agreement' : 'Please accept all sections above'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
