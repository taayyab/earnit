export const plainLanguageTerms = {
  "C&P Exam": "Medical Appointment",
  "C&P": "Medical Appointment",
  "Compensation & Pension Exam": "Medical Appointment",
  "Nexus Letter": "Doctor's Connection Letter",
  "nexus letter": "doctor's connection letter",
  "Claim Phase": "Step in Your Claim",
  "claim phase": "step in your claim",
  "DBQ": "Doctor's Questionnaire",
  "Disability Benefits Questionnaire": "Doctor's Questionnaire",
  "Rating Decision": "VA's Decision",
  "rating decision": "VA's decision",
  "Supplemental Claim": "New Evidence Request",
  "supplemental claim": "new evidence request",
  "Higher Level Review": "Ask for Another Look",
  "higher level review": "ask for another look",
  "HLR": "Ask for Another Look",
  "Board Appeal": "Formal Appeal",
  "board appeal": "formal appeal",
  "BVA Appeal": "Formal Appeal",
  "VA Form 21-526EZ": "Disability Benefits Application",
  "21-526EZ": "Disability Benefits Application",
  "contention": "claimed condition",
  "Contention": "Claimed Condition",
  "contentions": "claimed conditions",
  "Contentions": "Claimed Conditions",
  "NOD": "Notice of Disagreement",
  "SOC": "Statement of the Case",
  "SSOC": "Supplemental Statement of the Case",
  "DRO": "Decision Review Officer",
  "SMC": "Special Monthly Compensation",
  "TDIU": "Unemployability Benefits",
  "IU": "Individual Unemployability",
  "VAMC": "VA Medical Center",
  "VARO": "VA Regional Office",
  "RO": "Regional Office",
  "VSO": "Veterans Service Organization",
  "POA": "Power of Attorney",
  "Effective Date": "Benefits Start Date",
  "effective date": "benefits start date",
  "Service Connection": "Condition Linked to Service",
  "service connection": "condition linked to service",
  "service-connected": "linked to service",
  "Service-Connected": "Linked to Service",
  "Presumptive Condition": "Automatically Accepted Condition",
  "presumptive condition": "automatically accepted condition",
  "Secondary Condition": "Related Health Issue",
  "secondary condition": "related health issue",
  "Intent to File": "Placeholder Application",
  "ITF": "Placeholder Application",
  "Duty to Assist": "VA's Responsibility to Help",
  "Buddy Statement": "Witness Letter",
  "buddy statement": "witness letter",
  "Lay Statement": "Personal Statement",
  "lay statement": "personal statement",
  "Favorable Finding": "Decision in Your Favor",
  "favorable finding": "decision in your favor",
  "Denial": "Claim Not Approved",
  "denial": "claim not approved",
  "Remand": "Sent Back for Review",
  "remand": "sent back for review",
  "Adjudication": "Claim Decision Process",
  "adjudication": "claim decision process"
};

export const claimPhases = {
  1: { vaName: "Claim Received", plainName: "We Got Your Claim" },
  2: { vaName: "Initial Review", plainName: "First Look at Your Claim" },
  3: { vaName: "Evidence Gathering", plainName: "Collecting Your Documents" },
  4: { vaName: "Evidence Review", plainName: "Reviewing Your Documents" },
  5: { vaName: "Rating", plainName: "Making a Decision" },
  6: { vaName: "Preparing Decision", plainName: "Writing Your Results" },
  7: { vaName: "Complete", plainName: "Done" }
};

export const termDefinitions = {
  "C&P Exam": "A medical exam ordered by the VA to assess your disability. Usually takes 30-60 minutes.",
  "Nexus Letter": "A letter from your doctor explaining how your condition is connected to your military service.",
  "DBQ": "A standardized form doctors fill out to document your disability symptoms.",
  "Rating Decision": "The official letter from the VA telling you whether your claim was approved and your disability percentage.",
  "Supplemental Claim": "A way to add new evidence to a claim that was previously denied.",
  "Higher Level Review": "Request for a senior reviewer to look at your claim again using the same evidence.",
  "Board Appeal": "Taking your case to the Board of Veterans' Appeals for a final decision.",
  "contention": "A specific health condition you're claiming is related to your military service.",
  "Service Connection": "The VA has agreed your condition is related to your military service.",
  "Effective Date": "The date your benefits payments will start from.",
  "TDIU": "Benefits for veterans who can't work due to their service-connected disabilities.",
  "VSO": "Free organizations that help veterans file claims, like DAV, VFW, or American Legion."
};

export function translateTerm(term, usePlainLanguage) {
  if (!usePlainLanguage) return term;
  return plainLanguageTerms[term] || term;
}

export function translatePhase(phase, usePlainLanguage) {
  const phaseInfo = claimPhases[phase];
  if (!phaseInfo) return `Phase ${phase}`;
  return usePlainLanguage ? phaseInfo.plainName : phaseInfo.vaName;
}

export function getTermDefinition(term) {
  const normalizedTerm = Object.keys(termDefinitions).find(
    key => key.toLowerCase() === term.toLowerCase()
  );
  return normalizedTerm ? termDefinitions[normalizedTerm] : null;
}
