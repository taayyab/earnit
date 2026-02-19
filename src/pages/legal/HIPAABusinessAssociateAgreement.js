import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  Shield, 
  Lock, 
  AlertTriangle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

const CURRENT_VERSION = '1.0.0';
const EFFECTIVE_DATE = 'December 10, 2025';

export default function HIPAABusinessAssociateAgreement({ onAccept, isRegistration = false }) {
  const [acceptances, setAcceptances] = useState({
    readAgreement: false,
    understandObligations: false,
    implementSafeguards: false,
    reportBreaches: false,
    trainStaff: false,
    userPrivacyCommitment: false
  });

  const allAccepted = Object.values(acceptances).every(v => v);

  const handleAccept = () => {
    if (allAccepted && onAccept) {
      onAccept({
        agreement_type: 'hipaa_baa',
        agreement_version: CURRENT_VERSION,
        acceptances
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-slate-200">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">HIPAA Business Associate Agreement</CardTitle>
                <p className="text-sm text-slate-600">Protected Health Information Compliance</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">Version {CURRENT_VERSION}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-6">
            Effective Date: {EFFECTIVE_DATE}
          </p>

          <section aria-labelledby="baa-intro">
            <h2 id="baa-intro">1. Purpose and Scope</h2>
            <p>
              This HIPAA Business Associate Agreement ("BAA") is entered into between EarnedIT, LLC 
              ("Covered Entity" or "EarnedIT") and the Partner organization ("Business Associate" or "Partner") 
              as part of the Partner Terms of Service.
            </p>
            <p>
              This BAA ensures compliance with the Health Insurance Portability and Accountability Act of 1996 
              ("HIPAA"), the Health Information Technology for Economic and Clinical Health Act ("HITECH Act"), 
              and their implementing regulations, including the Privacy Rule (45 CFR Part 160 and Subparts A and E 
              of Part 164) and Security Rule (45 CFR Part 160 and Subparts A and C of Part 164).
            </p>
          </section>

          <section aria-labelledby="definitions">
            <h2 id="definitions">2. Definitions</h2>
            <p>
              Terms used in this BAA shall have the same meanings as in HIPAA and HITECH Act regulations. 
              Key definitions include:
            </p>
            <ul>
              <li><strong>Protected Health Information (PHI):</strong> Individually identifiable health information 
              transmitted or maintained in any form or medium, including electronic PHI (ePHI)</li>
              <li><strong>Breach:</strong> Acquisition, access, use, or disclosure of PHI in a manner not permitted 
              by the Privacy Rule that compromises the security or privacy of the PHI</li>
              <li><strong>Security Incident:</strong> Attempted or successful unauthorized access, use, disclosure, 
              modification, or destruction of information or interference with system operations</li>
            </ul>
          </section>

          <section aria-labelledby="obligations">
            <h2 id="obligations">3. Business Associate Obligations</h2>
            
            <h3>3.1 Permitted Uses and Disclosures</h3>
            <p>Business Associate may use or disclose PHI only as permitted or required by this BAA, or as 
            required by law. Specifically, Business Associate may:</p>
            <ul>
              <li>Use PHI to perform functions, activities, or services for or on behalf of veterans as authorized</li>
              <li>Use PHI for proper management and administration of Business Associate</li>
              <li>Disclose PHI as required by law</li>
              <li>Use PHI to de-identify information in accordance with 45 CFR 164.514(a)-(c)</li>
            </ul>

            <h3>3.2 Safeguards</h3>
            <p>Business Associate shall implement and maintain appropriate safeguards to prevent unauthorized use 
            or disclosure of PHI, including:</p>
            <ul>
              <li><strong>Administrative Safeguards:</strong> Security management processes, workforce security, 
              information access management, security awareness training, security incident procedures, 
              contingency planning, and periodic evaluations</li>
              <li><strong>Physical Safeguards:</strong> Facility access controls, workstation use policies, 
              workstation security, and device and media controls</li>
              <li><strong>Technical Safeguards:</strong> Access controls, audit controls, integrity controls, 
              person or entity authentication, and transmission security</li>
            </ul>

            <h3>3.3 Subcontractors</h3>
            <p>Business Associate shall ensure that any subcontractors that create, receive, maintain, or transmit 
            PHI agree to the same restrictions and conditions that apply to Business Associate, including 
            execution of a BAA.</p>

            <h3>3.4 Individual Rights</h3>
            <p>Business Associate shall:</p>
            <ul>
              <li>Make PHI available to individuals for access rights per 45 CFR 164.524</li>
              <li>Make PHI available for amendment per 45 CFR 164.526</li>
              <li>Provide accounting of disclosures per 45 CFR 164.528</li>
            </ul>

            <h3>3.5 Documentation</h3>
            <p>Business Associate shall maintain all required documentation for six (6) years from the date of 
            creation or when the policy/procedure was last in effect, whichever is later.</p>
          </section>

          <section aria-labelledby="breach-notification">
            <h2 id="breach-notification">4. Breach Notification Requirements</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-red-900">CRITICAL REQUIREMENT</p>
                  <p className="text-sm text-red-800">
                    Business Associate must report any Breach or suspected Breach of PHI to EarnedIT within 
                    <strong> 24 hours</strong> of discovery.
                  </p>
                </div>
              </div>
            </div>

            <h3>4.1 Discovery of Breach</h3>
            <p>A Breach shall be treated as discovered as of the first day on which the Breach is known, or 
            reasonably should have been known, to Business Associate or any employee, officer, or agent 
            of Business Associate.</p>

            <h3>4.2 Notification Content</h3>
            <p>Upon discovery of a Breach, Business Associate shall provide EarnedIT with:</p>
            <ul>
              <li>Identification of each individual whose PHI has been, or is reasonably believed to have been, 
              accessed, acquired, used, or disclosed</li>
              <li>Description of what happened, including dates of the Breach and discovery</li>
              <li>Description of the types of PHI involved</li>
              <li>Description of investigation and mitigation steps taken</li>
              <li>Contact information for further inquiries</li>
            </ul>

            <h3>4.3 Security Incidents</h3>
            <p>Business Associate shall report any Security Incident of which it becomes aware, including 
            unsuccessful attempts to access systems containing PHI, within 48 hours.</p>
          </section>

          <section aria-labelledby="termination">
            <h2 id="termination">5. Termination</h2>
            
            <h3>5.1 Termination for Cause</h3>
            <p>EarnedIT may immediately terminate this BAA and the Partner Agreement if EarnedIT determines 
            that Business Associate has violated a material term of this BAA.</p>

            <h3>5.2 Obligations Upon Termination</h3>
            <p>Upon termination, Business Associate shall:</p>
            <ul>
              <li>Return or destroy all PHI received from EarnedIT or created on behalf of EarnedIT</li>
              <li>Retain no copies of PHI in any form</li>
              <li>If return or destruction is not feasible, extend the protections of this BAA to retained PHI</li>
              <li>Certify in writing the destruction or return of all PHI</li>
            </ul>
          </section>

          <section aria-labelledby="liability">
            <h2 id="liability">6. Liability and Indemnification</h2>
            <p>
              Business Associate shall indemnify and hold harmless EarnedIT from any claims, damages, or 
              penalties arising from Business Associate's violation of this BAA or HIPAA/HITECH requirements, 
              including:
            </p>
            <ul>
              <li>Civil monetary penalties imposed by HHS</li>
              <li>Costs of breach notification to affected individuals</li>
              <li>Costs of credit monitoring services provided to affected individuals</li>
              <li>Legal fees and costs of defense</li>
              <li>Damages awarded to affected individuals</li>
            </ul>
          </section>

          <section aria-labelledby="compliance-requirements">
            <h2 id="compliance-requirements">7. Compliance Requirements</h2>
            
            <h3>7.1 Training</h3>
            <p>Business Associate shall train all workforce members who have access to PHI on:</p>
            <ul>
              <li>HIPAA Privacy Rule requirements</li>
              <li>HIPAA Security Rule requirements</li>
              <li>Business Associate's policies and procedures</li>
              <li>Consequences of non-compliance</li>
            </ul>
            <p>Training must be completed upon hire and annually thereafter, with documentation retained.</p>

            <h3>7.2 Risk Analysis</h3>
            <p>Business Associate shall conduct and document an accurate and thorough risk analysis of 
            potential risks and vulnerabilities to the confidentiality, integrity, and availability of 
            ePHI at least annually.</p>

            <h3>7.3 Audit Rights</h3>
            <p>EarnedIT reserves the right to audit Business Associate's compliance with this BAA upon 
            reasonable notice. Business Associate shall cooperate fully with any such audit.</p>
          </section>

          <section aria-labelledby="amendments">
            <h2 id="amendments">8. Regulatory Changes</h2>
            <p>
              The parties agree to take such action as is necessary to amend this BAA from time to time 
              as necessary for EarnedIT to comply with HIPAA, HITECH Act, and any other applicable law or 
              regulation. Business Associate shall comply with any amendments within 30 days of notice.
            </p>
          </section>

          <section aria-labelledby="miscellaneous-baa">
            <h2 id="miscellaneous-baa">9. Miscellaneous Provisions</h2>
            <p>
              <strong>Interpretation:</strong> Any ambiguity in this BAA shall be resolved in favor of a 
              meaning that permits EarnedIT to comply with HIPAA and HITECH requirements.
            </p>
            <p>
              <strong>Survival:</strong> The respective rights and obligations of Business Associate under 
              Sections 5.2 (Obligations Upon Termination) and 6 (Liability) shall survive termination of 
              this BAA.
            </p>
            <p>
              <strong>No Third Party Beneficiaries:</strong> Nothing in this BAA shall confer upon any 
              person other than the parties any rights, remedies, obligations, or liabilities.
            </p>
          </section>

          {isRegistration && (
            <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Associate Agreement Acceptance</h3>
              <p className="text-sm text-slate-600 mb-4">
                Please review and accept each of the following to continue:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="readAgreement"
                    checked={acceptances.readAgreement}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, readAgreement: checked }))}
                    aria-describedby="read-baa-desc"
                  />
                  <label htmlFor="readAgreement" className="text-sm text-slate-700 cursor-pointer">
                    <span id="read-baa-desc">
                      I have read and understand this entire HIPAA Business Associate Agreement.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="understandObligations"
                    checked={acceptances.understandObligations}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, understandObligations: checked }))}
                    aria-describedby="obligations-desc"
                  />
                  <label htmlFor="understandObligations" className="text-sm text-slate-700 cursor-pointer">
                    <span id="obligations-desc">
                      I understand my organization's obligations as a <strong>Business Associate</strong> under 
                      HIPAA and HITECH, including permitted uses and disclosures of PHI.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="implementSafeguards"
                    checked={acceptances.implementSafeguards}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, implementSafeguards: checked }))}
                    aria-describedby="safeguards-desc"
                  />
                  <label htmlFor="implementSafeguards" className="text-sm text-slate-700 cursor-pointer">
                    <span id="safeguards-desc">
                      My organization has implemented or will implement appropriate <strong>administrative, 
                      physical, and technical safeguards</strong> to protect PHI as required by Section 3.2.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="reportBreaches"
                    checked={acceptances.reportBreaches}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, reportBreaches: checked }))}
                    aria-describedby="breaches-desc"
                  />
                  <label htmlFor="reportBreaches" className="text-sm text-slate-700 cursor-pointer">
                    <span id="breaches-desc">
                      I understand and agree to report any Breach or suspected Breach of PHI to EarnedIT 
                      <strong> within 24 hours</strong> of discovery as required by Section 4.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="trainStaff"
                    checked={acceptances.trainStaff}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, trainStaff: checked }))}
                    aria-describedby="training-desc"
                  />
                  <label htmlFor="trainStaff" className="text-sm text-slate-700 cursor-pointer">
                    <span id="training-desc">
                      My organization will ensure all workforce members with PHI access receive 
                      <strong> HIPAA training</strong> upon hire and annually thereafter.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Checkbox
                    id="userPrivacyCommitment"
                    checked={acceptances.userPrivacyCommitment}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, userPrivacyCommitment: checked }))}
                    aria-describedby="privacy-commitment-desc"
                  />
                  <label htmlFor="userPrivacyCommitment" className="text-sm text-slate-700 cursor-pointer">
                    <span id="privacy-commitment-desc">
                      <strong>User Privacy Commitment:</strong> My organization agrees to be bound by equivalent 
                      privacy protections as EarnedIT when handling veteran data. This includes following EarnedIT's 
                      Privacy Policy standards, providing breach notifications with protective instructions, and 
                      ensuring any subcontractors we use are also bound by these same commitments.
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleAccept}
                  disabled={!allAccepted}
                  className="w-full bg-green-700 hover:bg-green-800 text-white"
                  aria-label="Accept HIPAA Business Associate Agreement"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  I Accept the HIPAA Business Associate Agreement
                </Button>
                {!allAccepted && (
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Please review and accept all terms above to continue.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-slate-500">
            <p>
              <strong>HIPAA Privacy Officer:</strong> privacy@earnedit.com
            </p>
            <p className="mt-2">
              EarnedIT, LLC | Houston, Texas | Version {CURRENT_VERSION}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
