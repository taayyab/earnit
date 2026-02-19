import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle,
  Building2,
  Gavel,
  CheckCircle2
} from 'lucide-react';

const CURRENT_VERSION = '1.0.0';
const EFFECTIVE_DATE = 'December 10, 2025';

export default function PartnerTermsOfService({ onAccept, isRegistration = false }) {
  const [acceptances, setAcceptances] = useState({
    readTerms: false,
    arbitrationClause: false,
    liabilityLimitation: false,
    vaCompliance: false,
    texasJurisdiction: false,
    malpracticeInsurance: false
  });

  const allAccepted = Object.values(acceptances).every(v => v);

  const handleAccept = () => {
    if (allAccepted && onAccept) {
      onAccept({
        agreement_type: 'partner_tos',
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
              <div className="w-12 h-12 bg-[#1B3A5F] rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Partner Terms of Service</CardTitle>
                <p className="text-sm text-slate-600">EarnedIT Platform Partner Agreement</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Version {CURRENT_VERSION}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 prose prose-slate max-w-none">
          <p className="text-sm text-slate-500 mb-6">
            Effective Date: {EFFECTIVE_DATE}
          </p>

          <section aria-labelledby="introduction">
            <h2 id="introduction">1. Introduction and Acceptance</h2>
            <p>
              This Partner Terms of Service Agreement ("Agreement") is a legally binding contract between your 
              organization ("Partner," "you," or "your") and EarnedIT, LLC ("EarnedIT," "we," "us," or "our"), 
              a Texas limited liability company. By registering as a Partner on the EarnedIT Platform 
              ("Platform"), you agree to be bound by these terms.
            </p>
            <p>
              <strong>IMPORTANT:</strong> This Agreement contains a mandatory arbitration provision and class 
              action waiver that affects your legal rights. Please read Section 12 carefully.
            </p>
          </section>

          <section aria-labelledby="eligibility">
            <h2 id="eligibility">2. Partner Eligibility Requirements</h2>
            <p>To become a Partner, your organization must:</p>
            <ul>
              <li>Be a Veterans Service Organization (VSO), law firm, or claims agent</li>
              <li>Maintain current VA Office of General Counsel (OGC) accreditation per 38 CFR 14.629</li>
              <li>Employ only VA-accredited representatives to assist veterans with claims</li>
              <li>Maintain professional liability/malpractice insurance with minimum coverage of $1,000,000 per occurrence</li>
              <li>Be in good standing with all applicable state bar associations (if a law firm)</li>
              <li>Comply with all applicable federal, state, and local laws</li>
            </ul>
          </section>

          <section aria-labelledby="va-compliance">
            <h2 id="va-compliance">3. VA Regulatory Compliance (38 CFR Part 14)</h2>
            <p>Partner agrees to comply with all VA regulations, including but not limited to:</p>
            
            <h3>3.1 Accreditation (38 CFR 14.629)</h3>
            <ul>
              <li>Maintain valid VA OGC accreditation for all representatives</li>
              <li>Promptly notify EarnedIT of any accreditation status changes</li>
              <li>Ensure representatives complete required continuing education</li>
            </ul>

            <h3>3.2 Fee Limitations (38 CFR 14.636)</h3>
            <ul>
              <li><strong>Original Claims:</strong> NO fees may be charged for original disability claim preparation. This is federal law.</li>
              <li><strong>Direct-Pay Agreements:</strong> Maximum 20% of past-due benefits, must be contingent on success</li>
              <li><strong>Non-Direct-Pay Agreements:</strong> Maximum 33.33% of past-due benefits</li>
              <li>Fees apply ONLY to past-due (retroactive) benefits, NEVER to ongoing monthly payments</li>
              <li>Fee agreements must be filed with VA within 30 days of execution</li>
              <li>VA assesses 5% fee (maximum $100) on direct-pay arrangements</li>
            </ul>

            <h3>3.3 Prohibited Conduct (38 CFR 14.632)</h3>
            <p>Partner shall NOT:</p>
            <ul>
              <li>Charge fees for original claim preparation</li>
              <li>Engage in conduct unbecoming a representative</li>
              <li>Violate confidentiality requirements</li>
              <li>Make false statements or misrepresentations</li>
              <li>Solicit claims improperly</li>
            </ul>
          </section>

          <section aria-labelledby="texas-law">
            <h2 id="texas-law">4. Texas Law Compliance</h2>
            <p>
              This Agreement is governed by the laws of the State of Texas. Partner acknowledges and agrees to:
            </p>

            <h3>4.1 Texas Deceptive Trade Practices Act (DTPA)</h3>
            <p>
              Partner agrees not to engage in any false, misleading, or deceptive acts or practices in 
              providing services through the Platform. Violations may result in immediate termination 
              and liability under Texas Business & Commerce Code Chapter 17.
            </p>

            <h3>4.2 Consumer Protection Disclosures</h3>
            <p>Partner shall provide all required disclosures to veteran clients, including:</p>
            <ul>
              <li>Clear explanation of services and fees before engagement</li>
              <li>Written fee agreements in plain language</li>
              <li>Right to cancel within legally required timeframes</li>
              <li>Complaint procedures and contact information</li>
            </ul>

            <h3>4.3 Professional Responsibility</h3>
            <p>
              Law firm Partners must comply with the Texas Disciplinary Rules of Professional Conduct. 
              Non-attorney Partners must comply with applicable professional standards for claims agents.
            </p>
          </section>

          <section aria-labelledby="license-fees">
            <h2 id="license-fees">5. License Fees and Payment Terms</h2>
            <p>Partner agrees to pay the applicable license fees based on selected tier:</p>
            <ul>
              <li><strong>Basic Tier:</strong> $6,000 annually, up to 50 veterans/month, 10% platform fee</li>
              <li><strong>Professional Tier:</strong> $24,000 annually, up to 500 veterans/month, 8% platform fee</li>
              <li><strong>Enterprise Tier:</strong> $60,000 annually, unlimited veterans, 5% platform fee</li>
            </ul>
            <p>
              Platform fees are calculated as a percentage of approved claim fees paid to Partner by VA.
              License fees are billed annually and are non-refundable.
            </p>
          </section>

          <section aria-labelledby="hipaa">
            <h2 id="hipaa">6. HIPAA Compliance and Business Associate Obligations</h2>
            <p>
              Partner acknowledges that it will have access to Protected Health Information (PHI) and agrees 
              to execute a separate HIPAA Business Associate Agreement (BAA). Partner shall:
            </p>
            <ul>
              <li>Implement appropriate administrative, physical, and technical safeguards</li>
              <li>Report any security incidents or breaches within 24 hours</li>
              <li>Train all staff on HIPAA requirements</li>
              <li>Maintain documentation of compliance efforts</li>
            </ul>
          </section>

          <section aria-labelledby="data-security">
            <h2 id="data-security">7. Data Security and Privacy</h2>
            <p>Partner shall:</p>
            <ul>
              <li>Access veteran data only as necessary to provide authorized services</li>
              <li>Maintain strict data isolation between veteran clients</li>
              <li>Not export or copy veteran data outside the Platform without authorization</li>
              <li>Immediately notify EarnedIT of any suspected data breach</li>
              <li>Comply with all applicable privacy laws, including Texas Identity Theft Enforcement and Protection Act</li>
            </ul>
          </section>

          <section aria-labelledby="malpractice">
            <h2 id="malpractice">8. Professional Liability and Malpractice Insurance</h2>
            <p>
              <strong>REQUIRED COVERAGE:</strong> Partner must maintain professional liability/errors and 
              omissions insurance with minimum limits of $1,000,000 per occurrence and $3,000,000 aggregate.
            </p>
            <ul>
              <li>Coverage must include claims arising from VA disability representation</li>
              <li>Partner shall provide certificate of insurance upon request</li>
              <li>Partner shall notify EarnedIT of any policy cancellation or material change</li>
              <li>Failure to maintain coverage may result in immediate suspension</li>
            </ul>
          </section>

          <section aria-labelledby="limitation-liability">
            <h2 id="limitation-liability">9. Limitation of Liability</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-amber-900">IMPORTANT LIMITATION</p>
                  <p className="text-sm text-amber-800">
                    TO THE MAXIMUM EXTENT PERMITTED BY TEXAS LAW, EARNEDIT'S TOTAL LIABILITY TO PARTNER 
                    FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED 
                    THE TOTAL LICENSE FEES PAID BY PARTNER TO EARNEDIT IN THE TWELVE (12) MONTHS 
                    PRECEDING THE CLAIM.
                  </p>
                </div>
              </div>
            </div>
            <p>
              IN NO EVENT SHALL EARNEDIT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, OR 
              BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              Partner acknowledges that EarnedIT provides a software platform and is not responsible for 
              the professional judgment, advice, or services rendered by Partner to veteran clients.
            </p>
          </section>

          <section aria-labelledby="indemnification">
            <h2 id="indemnification">10. Indemnification</h2>
            <p>
              Partner agrees to indemnify, defend, and hold harmless EarnedIT, its officers, directors, 
              employees, agents, and affiliates from and against any and all claims, damages, losses, 
              liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or 
              related to:
            </p>
            <ul>
              <li>Partner's breach of this Agreement</li>
              <li>Partner's violation of any law or regulation</li>
              <li>Partner's provision of professional services to veterans</li>
              <li>Claims of malpractice, negligence, or professional misconduct</li>
              <li>Any claim by a veteran client relating to Partner's services</li>
              <li>Partner's unauthorized use of the Platform</li>
            </ul>
          </section>

          <section aria-labelledby="disclaimer">
            <h2 id="disclaimer">11. Disclaimer of Warranties</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED. EARNEDIT DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED 
              TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
              NON-INFRINGEMENT.
            </p>
            <p>
              EARNEDIT DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR 
              COMPLETELY SECURE. PARTNER USES THE PLATFORM AT ITS OWN RISK.
            </p>
          </section>

          <section aria-labelledby="arbitration">
            <h2 id="arbitration">12. Mandatory Binding Arbitration and Class Action Waiver</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <Gavel className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-red-900">PLEASE READ CAREFULLY - AFFECTS YOUR LEGAL RIGHTS</p>
                </div>
              </div>
            </div>

            <h3>12.1 Agreement to Arbitrate</h3>
            <p>
              Partner and EarnedIT agree that any dispute, claim, or controversy arising out of or 
              relating to this Agreement or the Platform ("Disputes") shall be resolved exclusively 
              through final and binding arbitration, rather than in court.
            </p>

            <h3>12.2 Arbitration Rules and Procedure</h3>
            <ul>
              <li>Arbitration shall be conducted by the American Arbitration Association (AAA) under its Commercial Arbitration Rules</li>
              <li>The arbitration shall be held in Houston, Texas</li>
              <li>The arbitrator's decision shall be final and binding</li>
              <li>Judgment on the arbitration award may be entered in any court of competent jurisdiction</li>
            </ul>

            <h3>12.3 Class Action Waiver</h3>
            <p>
              <strong>PARTNER WAIVES ANY RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, 
              OR OTHER REPRESENTATIVE ACTION.</strong> All Disputes must be brought in Partner's 
              individual capacity, not as a plaintiff or class member in any purported class or 
              representative proceeding.
            </p>

            <h3>12.4 Exceptions</h3>
            <p>
              Notwithstanding the foregoing, either party may seek injunctive relief in any court of 
              competent jurisdiction to prevent irreparable harm pending arbitration.
            </p>

            <h3>12.5 Opt-Out Right</h3>
            <p>
              Partner may opt out of this arbitration provision by providing written notice to EarnedIT 
              within 30 days of accepting this Agreement. The opt-out notice must be sent to: 
              legal@earnedit.com
            </p>
          </section>

          <section aria-labelledby="jurisdiction">
            <h2 id="jurisdiction">13. Governing Law and Jurisdiction</h2>
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of the 
              State of Texas, without regard to its conflicts of law principles. Subject to the 
              arbitration provision above, Partner consents to the exclusive jurisdiction of the 
              state and federal courts located in Harris County, Texas.
            </p>
          </section>

          <section aria-labelledby="termination">
            <h2 id="termination">14. Termination</h2>
            <p>
              Either party may terminate this Agreement with 30 days written notice. EarnedIT may 
              terminate immediately if Partner:
            </p>
            <ul>
              <li>Violates VA regulations or loses accreditation</li>
              <li>Fails to maintain required insurance</li>
              <li>Engages in fraudulent or unethical conduct</li>
              <li>Materially breaches this Agreement</li>
            </ul>
            <p>
              Upon termination, Partner must cease using the Platform and ensure orderly transition of 
              any pending veteran cases.
            </p>
          </section>

          <section aria-labelledby="miscellaneous">
            <h2 id="miscellaneous">15. Miscellaneous</h2>
            <p>
              <strong>Entire Agreement:</strong> This Agreement, together with the HIPAA BAA and any 
              exhibits, constitutes the entire agreement between the parties.
            </p>
            <p>
              <strong>Severability:</strong> If any provision is held invalid, the remaining provisions 
              shall continue in full force and effect.
            </p>
            <p>
              <strong>No Waiver:</strong> Failure to enforce any provision shall not constitute a 
              waiver of that provision.
            </p>
            <p>
              <strong>Assignment:</strong> Partner may not assign this Agreement without prior written consent.
            </p>
          </section>

          {isRegistration && (
            <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Agreement Acceptance</h3>
              <p className="text-sm text-slate-600 mb-4">
                Please review and accept each of the following to continue:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="readTerms"
                    checked={acceptances.readTerms}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, readTerms: checked }))}
                    aria-describedby="readTerms-desc"
                  />
                  <label htmlFor="readTerms" className="text-sm text-slate-700 cursor-pointer">
                    <span id="readTerms-desc">
                      I have read and understand this entire Partner Terms of Service Agreement.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="arbitrationClause"
                    checked={acceptances.arbitrationClause}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, arbitrationClause: checked }))}
                    aria-describedby="arbitration-desc"
                  />
                  <label htmlFor="arbitrationClause" className="text-sm text-slate-700 cursor-pointer">
                    <span id="arbitration-desc">
                      I understand and agree to the <strong>mandatory binding arbitration provision</strong> and 
                      <strong> class action waiver</strong> in Section 12. I understand I am waiving my right 
                      to a jury trial and to participate in class actions.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="liabilityLimitation"
                    checked={acceptances.liabilityLimitation}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, liabilityLimitation: checked }))}
                    aria-describedby="liability-desc"
                  />
                  <label htmlFor="liabilityLimitation" className="text-sm text-slate-700 cursor-pointer">
                    <span id="liability-desc">
                      I understand and agree to the <strong>limitation of liability</strong> provisions in 
                      Section 9, including that EarnedIT's liability is capped at license fees paid.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="vaCompliance"
                    checked={acceptances.vaCompliance}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, vaCompliance: checked }))}
                    aria-describedby="va-desc"
                  />
                  <label htmlFor="vaCompliance" className="text-sm text-slate-700 cursor-pointer">
                    <span id="va-desc">
                      I confirm that my organization maintains valid <strong>VA OGC accreditation</strong> per 
                      38 CFR 14.629 and will comply with all VA fee regulations in 38 CFR 14.636.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="texasJurisdiction"
                    checked={acceptances.texasJurisdiction}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, texasJurisdiction: checked }))}
                    aria-describedby="texas-desc"
                  />
                  <label htmlFor="texasJurisdiction" className="text-sm text-slate-700 cursor-pointer">
                    <span id="texas-desc">
                      I agree that this Agreement is governed by <strong>Texas law</strong> and consent to 
                      jurisdiction in Harris County, Texas.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="malpracticeInsurance"
                    checked={acceptances.malpracticeInsurance}
                    onCheckedChange={(checked) => setAcceptances(prev => ({ ...prev, malpracticeInsurance: checked }))}
                    aria-describedby="insurance-desc"
                  />
                  <label htmlFor="malpracticeInsurance" className="text-sm text-slate-700 cursor-pointer">
                    <span id="insurance-desc">
                      I confirm that my organization maintains <strong>professional liability insurance</strong> with 
                      minimum coverage of $1,000,000 per occurrence and $3,000,000 aggregate.
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleAccept}
                  disabled={!allAccepted}
                  className="w-full bg-[#1B3A5F] hover:bg-[#152d4a] text-white"
                  aria-label="Accept Partner Terms of Service"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  I Accept the Partner Terms of Service
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
              <strong>Questions?</strong> Contact our Partner Support team at partners@earnedit.com 
              or call (888) 555-VETS.
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
