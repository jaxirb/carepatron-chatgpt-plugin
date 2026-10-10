// What a new-client intake pack should include, by profession group and country.
// Added 11 Oct 2026 for the Carepatron growth challenge.
//
// Why this exists: in the trial data, practices whose first 14 days include a real client
// touching the product pay at about 3x the rate of those that don't, and the most common
// first client touch is an intake form. The blocker is not knowing what to put in it.
//
// Sources for the country-specific lines are in the research notes that came with the
// challenge (regulators and professional bodies: APA, ACA, ASHA, APTA, RCFP recording laws,
// Ahpra, RACGP, APS, OAIC, MCNZ, NZ Psychologists Board, NHS England, ICO, BACP,
// Ontario IPC, CPA). Every wording line below is plain English a clinician can paste and edit.
// It is not legal advice and the tool says so in every reply.

export const PROFESSION_GROUPS = ["mental_health", "allied_health", "dietetics", "general"] as const;
export const COUNTRIES = ["US", "AU", "NZ", "GB", "CA"] as const;

export type ProfessionGroup = (typeof PROFESSION_GROUPS)[number];
export type Country = (typeof COUNTRIES)[number];

export interface ChecklistItem {
  key: string;
  title: string;
  why: string;
  wording: string;
  template_id?: string;
}

const GROUP_LABEL: Record<ProfessionGroup, string> = {
  mental_health: "therapy, counselling and psychology",
  allied_health: "physio, OT and speech therapy",
  dietetics: "dietetics and nutrition",
  general: "general practice",
};

const COUNTRY_LABEL: Record<Country, string> = {
  US: "the United States",
  AU: "Australia",
  NZ: "New Zealand",
  GB: "the United Kingdom",
  CA: "Canada",
};

// The intake form template that fits each group.
const INTAKE_TEMPLATE: Record<ProfessionGroup, string> = {
  mental_health: "counseling-intake-form",
  allied_health: "physical-therapy-intake-form",
  dietetics: "nutrition-intake-form",
  general: "patient-intake-form",
};

// Everyone's pack needs these, whatever the country.
function universalItems(group: ProfessionGroup): ChecklistItem[] {
  const intake = INTAKE_TEMPLATE[group];
  return [
    {
      key: "identity_contact",
      title: "Who they are and how to reach them",
      why: "You cannot book, bill or send anything without it, and chasing it later wastes the first session.",
      wording:
        "Full name, preferred name and pronouns, date of birth, address, email, phone, and how you prefer we contact you.",
      template_id: intake,
    },
    {
      key: "emergency_contact",
      title: "Emergency contact",
      why: "Every professional body expects one on file before the first appointment.",
      wording: "Emergency contact: full name, relationship to you, and the best phone number.",
      template_id: intake,
    },
    {
      key: "presenting_concern",
      title: "What brought them in, in their own words",
      why: "It sets the first session up and it is the one answer you cannot get from a referral letter.",
      wording:
        group === "mental_health"
          ? "In a few sentences, what led you to seek support right now? What would you like to be different?"
          : "In a few sentences, what brought you in? When did it start, and what makes it better or worse?",
      template_id: intake,
    },
    {
      key: "history_medications",
      title: "Relevant history and current medications",
      why: "Safety, and it stops you asking basic questions in the session they are paying for.",
      wording:
        "Relevant medical or mental health history, current medications and doses, allergies, and other practitioners involved in your care.",
      template_id: intake,
    },
    {
      key: "consent_to_treat",
      title: "Consent to treatment, with the limits of confidentiality",
      why: "Signed before the first session, not after. It is the document a board asks for first.",
      wording:
        "What the service involves, what it costs, the benefits and risks, and the limits of confidentiality: risk of harm to you or someone else, suspected abuse of a child or vulnerable adult, and a court order.",
      template_id: group === "mental_health" ? "counseling-informed-consent" : undefined,
    },
    {
      key: "cancellation_policy",
      title: "Cancellation and no-show policy",
      why: "Agreed up front it is a boundary. Raised after a missed session it is a fight.",
      wording:
        "Please give at least 24 hours' notice to change or cancel an appointment. Sessions cancelled with less notice, or missed, are charged at the full fee. I will always tell you as early as I can if I need to change a time.",
      template_id: "therapy-cancellation-policy",
    },
    {
      key: "fees_payment",
      title: "Fees and how payment works",
      why: "The most common awkward conversation in a first session, and the easiest to avoid.",
      wording:
        "Session fee, how and when payment is taken, what happens with unpaid invoices, and (where it applies) what your insurer or funder covers and what you pay.",
    },
    {
      key: "telehealth",
      title: "Telehealth consent, if you ever work by video",
      why: "Needed before the first video session, so collect it with everything else rather than on the day.",
      wording:
        "Sessions may be held by secure video. You can ask for an in-person appointment instead at any time. Video has limits, including technical interruptions, and you should be somewhere private.",
      template_id: "telehealth-consent",
    },
    {
      key: "communication_portal",
      title: "How you will communicate between sessions",
      why: "Sets expectations about response times and keeps clinical messages out of personal email.",
      wording:
        "How we will contact you between sessions, how quickly to expect a reply, what to do in a crisis or out of hours, and whether you are happy to use the client portal.",
    },
  ];
}

// Country-specific lines: privacy regime, and consent for AI note-taking or recording.
// Written from the regulator and professional-body guidance, not from a lawyer.
function countryItems(group: ProfessionGroup, country: Country): ChecklistItem[] {
  const privacy: Record<Country, string> = {
    US:
      "A HIPAA Notice of Privacy Practices: what health information you hold, how you use and share it, and the client's rights over it. Acknowledged in writing at intake.",
    AU:
      "A privacy notice under the Australian Privacy Principles: what you collect, why, who you share it with, whether anything is stored or accessed overseas, and how to ask for access or a correction.",
    NZ:
      "A privacy notice under the Privacy Act 2020 and the Health Information Privacy Code: what you collect, why, who sees it, how long you keep it, and how to ask for access or a correction.",
    GB:
      "A UK GDPR privacy notice: your lawful basis for processing health data, what you hold, who you share it with, how long you keep it, and the client's rights including access and complaint to the ICO.",
    CA:
      "A privacy notice under your province's health privacy law (for example PHIPA in Ontario, HIA in Alberta, PIPA in BC, Law 25 in Quebec): what you collect, why, who sees it, and how to ask for access.",
  };

  // Written vs verbal, plus the one thing that trips people up in each country.
  const aiConsent: Record<Country, string> = {
    US:
      "Written consent is the safe default. Your vendor must sign a business associate agreement, and in all-party recording states (including California, Florida, Illinois, Maryland, Massachusetts, Pennsylvania and Washington) everyone in the room has to agree before any recording starts. Check your own state and your board.",
    AU:
      "Ahpra expects informed consent recorded in the health record. The psychology guidelines ask for written, tool-specific consent; the GP guidance accepts verbal consent documented in the note if your indemnity insurer agrees. A sign in the waiting room is not enough.",
    NZ:
      "The Medical Council says informed consent is specifically required for a tool that records or transcribes a consultation, and must be documented in the record. The Psychologists Board says a sign in the office does not meet the standard, and consent should be documented in writing.",
    GB:
      "For direct care, NHS England's ambient scribing guidance says explicit written consent is not required, but you must tell the person at the start of each session that a scribe is in use and give them a real chance to object. If they object, you cannot use it.",
    CA:
      "Consent is generally required under provincial health privacy law. Ontario and BC accept oral consent documented by the clinician; Alberta's HIA asks for written consent where a recording device is not visible. Vendors must not train models on identifiable audio.",
  };

  const bodyNote: Partial<Record<ProfessionGroup, Partial<Record<Country, string>>>> = {
    mental_health: {
      US: "ACA's code requires permission before recording a session by any means, and APA asks psychologists to say in the written consent when, how and which AI tools they use.",
      AU: "The APS guidelines (Feb 2026) ask for written consent that names the specific tool, and treat it as an ongoing conversation rather than a one-off tick box.",
      GB: "BACP's guidance: do not use AI in a therapeutic context without training, insurance and informed consent, and never upload identifying client information.",
    },
    allied_health: {
      US: "APTA's practice advisory and ASHA both expect you to explain how the scribe works, get consent, be able to document without it, and review and sign every note.",
    },
  };

  const note = bodyNote[group]?.[country];
  return [
    {
      key: "privacy_notice",
      title: `Privacy notice for ${COUNTRY_LABEL[country]}`,
      why: "It is the document that explains what happens to their information, and most practices forget it until an audit.",
      wording: privacy[country],
    },
    {
      key: "ai_recording_consent",
      title: "Consent for AI note-taking or recording",
      why: "This is the piece clinicians most often skip, and the one clients ask about. Getting it right up front is what makes the AI scribe usable.",
      wording:
        `${aiConsent[country]}${note ? " " + note : ""} Whatever the format, say six things: the tool listens and drafts a note; the audio is captured and when it is deleted; where the data is stored and that it is not used to train models; that you review and edit every note; that they can decline with no effect on their care; and that they can change their mind later.`,
      template_id: "ai-consent",
    },
  ];
}

export interface Checklist {
  profession_group: ProfessionGroup;
  country: Country;
  summary: string;
  items: ChecklistItem[];
  caveats: string[];
}

export function buildChecklist(group: ProfessionGroup, country: Country): Checklist {
  const all = universalItems(group);
  const extra = countryItems(group, country);
  // Country items sit with the consent block, not at the end: privacy after consent to treat,
  // AI consent after telehealth, so the pack reads in the order you would send it.
  const items: ChecklistItem[] = [];
  for (const item of all) {
    items.push(item);
    if (item.key === "consent_to_treat") items.push(extra[0]);
    if (item.key === "telehealth") items.push(extra[1]);
  }
  return {
    profession_group: group,
    country,
    summary: `A new-client intake pack for ${GROUP_LABEL[group]} in ${COUNTRY_LABEL[country]}: ${items.length} things to cover before the first session.`,
    items,
    caveats: [
      "This is a checklist, not legal advice. Your board, your insurer and your state or province may ask for more.",
      "The consent wording is a starting point. Read it, change it to match how you actually work, and keep a copy of what each client agreed to.",
      "Rules on AI note-taking changed through 2025 and 2026 and are still moving. Check your professional body's current guidance before you rely on this.",
    ],
  };
}
