// Fixed catalog of Carepatron public templates (eng review D1: no runtime fetching).
// 10 templates from 3 Oct 2026; 8 more added 11 Oct 2026 for the new-client pack (intake, consent, cancellation).
// Metadata, section headings and links only. Never template body text (Carepatron ToS 15.1).
// Re-verify links before each demo with `npm run check-links`.

export type Profession =
  | "psychology_counseling"
  | "physical_therapy"
  | "occupational_therapy"
  | "speech_pathology"
  | "dietetics"
  | "general_medical";

export type DocumentType =
  | "progress_note"
  | "intake_form"
  | "treatment_plan"
  | "evaluation"
  | "worksheet"
  | "consent_form"
  | "cancellation_policy";

export type NoteFormat = "soap" | "dap" | "birp";

export interface Template {
  id: string;
  title: string;
  professions: Profession[];
  document_type: DocumentType;
  note_format?: NoteFormat;
  purpose: string;
  section_headings: string[];
  page_url: string;
  preview_template_id: string;
  // Optional: some template pages link the wrong file (see therapy-cancellation-policy-template).
  pdf_url?: string;
  last_verified: string;
}

const SITE = "https://www.carepatron.com";

export const TEMPLATES: Template[] = [
  {
    id: "soap-progress-notes",
    title: "SOAP Progress Notes Template",
    professions: ["general_medical", "physical_therapy"],
    document_type: "progress_note",
    note_format: "soap",
    purpose: "Document a session in the four SOAP sections.",
    section_headings: ["Subjective", "Objective", "Assessment", "Plan"],
    page_url: `${SITE}/templates/soap-progress-notes-template/`,
    preview_template_id: "e5c6f3e6-0953-4243-996e-810ca8598266",
    pdf_url: `${SITE}/files/soap-progress-notes.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "dap-notes",
    title: "DAP Notes Template",
    professions: ["psychology_counseling"],
    document_type: "progress_note",
    note_format: "dap",
    purpose: "A shorter session note covering data, assessment and plan.",
    section_headings: ["Patient information", "Data", "Assessment", "Plan", "Clinician sign-off"],
    page_url: `${SITE}/templates/dap-notes-template/`,
    preview_template_id: "69f9e432-9ae9-4286-954e-26b0deb8e2f8",
    pdf_url: `${SITE}/files/dap-notes.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "birp-notes",
    title: "BIRP Notes Template",
    professions: ["psychology_counseling"],
    document_type: "progress_note",
    note_format: "birp",
    purpose: "Record behavior, intervention, response and plan for a session.",
    section_headings: ["Behavior", "Intervention", "Response", "Plan"],
    page_url: `${SITE}/templates/birp-notes-template/`,
    preview_template_id: "83b1a8a8-959a-4a9f-83f5-2cd7373211f1",
    // Not linked from Carepatron's page (its Download link points to a 404 `.pdff`).
    // Guessed URL, confirmed 200 application/pdf on 2026-10-04 (eng review D5).
    pdf_url: `${SITE}/files/birp-notes-template.pdf`,
    last_verified: "2026-10-04",
  },
  {
    id: "therapy-intake-form",
    title: "Therapy Intake Form",
    professions: ["psychology_counseling"],
    document_type: "intake_form",
    purpose: "Collect a new client's background before the first session.",
    section_headings: [
      "Patient Information",
      "Emergency Contact",
      "Health and Medical Information",
      "Insurance Information",
      "Employment Status",
      "Availability",
      "Personal and Family",
    ],
    page_url: `${SITE}/templates/therapy-intake-form/`,
    preview_template_id: "eecf68f8-0a6c-4b63-8d1e-77a1b3020c62",
    pdf_url: `${SITE}/files/therapy-intake-form.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "treatment-plan",
    title: "Treatment Plan Template",
    professions: ["psychology_counseling", "general_medical"],
    document_type: "treatment_plan",
    purpose: "Set out concerns, goals and planned interventions in one plan.",
    section_headings: [
      "Basic Information",
      "Patient concern",
      "Short term goals",
      "Long term goals",
      "Sleeping patterns",
      "Exercise patterns",
      "Medications",
      "Interventions",
    ],
    page_url: `${SITE}/templates/treatment-plan-template/`,
    preview_template_id: "bfc4c35a-6096-40ed-af0b-d7d29bcaeab2",
    pdf_url: `${SITE}/files/treatment-plan-template.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "cbt-thought-record",
    title: "CBT Thought Record Templates",
    professions: ["psychology_counseling"],
    document_type: "worksheet",
    purpose: "The client logs and challenges unhelpful thoughts between sessions.",
    section_headings: [
      "Date",
      "Situation",
      "Emotions/Physical Sensations",
      "Thought",
      "Unhelpful Thinking Styles",
      "My Response",
    ],
    page_url: `${SITE}/templates/cbt-thought-record-templates/`,
    preview_template_id: "220a339c-4126-4678-be6a-64fd5bd5874d",
    pdf_url: `${SITE}/files/cbt-thought-record-templates.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "physical-therapy-evaluation",
    title: "Physical Therapy Evaluation Template",
    professions: ["physical_therapy"],
    document_type: "evaluation",
    purpose: "An initial PT assessment that leads into a plan of care.",
    section_headings: [
      "Patient Information",
      "Medical History",
      "Referring Physician",
      "Presenting Problem",
      "Functional Assessment",
      "Physical Examination",
      "Assessment",
      "Plan of Care",
    ],
    page_url: `${SITE}/templates/physical-therapy-evaluation-template/`,
    preview_template_id: "b32d261f-1fcb-4683-b5d5-7ca090b5d5cd",
    pdf_url: `${SITE}/files/physical-therapy-evaluation.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "occupational-therapy-soap",
    title: "SOAP Notes For Occupational Therapy Template",
    professions: ["occupational_therapy"],
    document_type: "progress_note",
    note_format: "soap",
    purpose: "A SOAP session note tailored to occupational therapy.",
    section_headings: ["Subjective", "Objective", "Assessment", "Plan"],
    page_url: `${SITE}/templates/soap-notes-for-occupational-therapy-template/`,
    preview_template_id: "c2564934-d3fa-4725-9208-e51dc06d2e61",
    pdf_url: `${SITE}/files/soap-notes-for-occupational-therapy.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "speech-therapy-soap",
    title: "SOAP Notes For Speech Therapy Template",
    professions: ["speech_pathology"],
    document_type: "progress_note",
    note_format: "soap",
    purpose: "A SOAP note for speech-language therapy sessions.",
    section_headings: ["Subjective", "Objective", "Assessment", "Plan"],
    page_url: `${SITE}/templates/soap-notes-for-speech-therapy-template/`,
    preview_template_id: "b964fe44-764c-4c16-a9cb-c852c44b82db",
    pdf_url: `${SITE}/files/soap-notes-for-speech-therapy-template.pdf`,
    last_verified: "2026-10-03",
  },
  {
    id: "nutrition-assessment",
    title: "Nutrition Assessment",
    professions: ["dietetics"],
    document_type: "evaluation",
    purpose: "A structured dietitian review of measurements, diet, labs and nutritional needs.",
    section_headings: [
      "Patient information",
      "Anthropometric measurements",
      "Dietary habits and nutrient intake",
      "Biochemical data",
      "Physical examination",
      "Nutritional risk factors",
      "Medical history",
      "Nutritional needs and goals",
    ],
    page_url: `${SITE}/templates/nutrition-assessment/`,
    preview_template_id: "aafc4674-b119-4332-90e4-42666819ce93",
    pdf_url: `${SITE}/files/nutrition-assessment-form.pdf`,
    last_verified: "2026-10-03",
  },
  // --- Added 11 Oct 2026: the new-client pack. Section headings read from each PDF's first page. ---
  {
    id: "counseling-intake-form",
    title: "Counseling Intake Form",
    professions: ["psychology_counseling"],
    document_type: "intake_form",
    purpose: "Collect a new counseling client's details, history and reason for coming before the first session.",
    section_headings: [
      "Patient information",
      "Emergency contact",
      "Health and medical information",
      "Insurance information",
      "Employment status",
      "Reason(s) for seeking counseling",
    ],
    page_url: `${SITE}/templates/counseling-intake-form/`,
    preview_template_id: "1479f4ba-9aa6-433e-b347-821543730bb3",
    pdf_url: `${SITE}/files/counseling-intake-form-sample.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "physical-therapy-intake-form",
    title: "Physical Therapy Intake Form",
    professions: ["physical_therapy"],
    document_type: "intake_form",
    purpose: "Collect a new physical therapy patient's details, referrers, insurance and injury history.",
    section_headings: ["Patient information", "Emergency contacts", "Referring and family doctor", "Insurance information", "History"],
    page_url: `${SITE}/templates/physical-therapy-intake-form/`,
    preview_template_id: "2c4c9f96-4dbc-4bc9-9c6c-63198ccfc42c",
    pdf_url: `${SITE}/files/physical-therapy-intake-form.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "nutrition-intake-form",
    title: "Nutrition Intake Form",
    professions: ["dietetics"],
    document_type: "intake_form",
    purpose: "Collect a new nutrition client's details, referrals, health concerns and goals.",
    section_headings: ["Client information", "Emergency contact", "Insurance information", "Referrals and adjunctive care", "Health concerns and symptoms"],
    page_url: `${SITE}/templates/nutrition-intake-form/`,
    preview_template_id: "3e8b6480-e262-4105-8d20-9fbb1d9f9f48",
    pdf_url: `${SITE}/files/nutrition-intake-form.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "patient-intake-form",
    title: "Patient Intake Form",
    professions: ["general_medical", "occupational_therapy", "speech_pathology"],
    document_type: "intake_form",
    purpose: "A general new-patient intake covering contact details, emergency contact and medical history.",
    section_headings: ["Patient information", "Emergency contact", "Health and medical information", "Reason for today's visit"],
    page_url: `${SITE}/templates/new-patient-intake-form/`,
    preview_template_id: "7ab0ce03-5c9a-4df4-9e91-32aa20693455",
    pdf_url: `${SITE}/files/patient-intake-forms.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "counseling-informed-consent",
    title: "Professional Counseling Informed Consent Form",
    professions: ["psychology_counseling"],
    document_type: "consent_form",
    purpose: "Set out what counseling involves, confidentiality and its limits, and the client's rights before work starts.",
    section_headings: ["Client details", "Counseling services", "Confidentiality", "Limits of counseling services", "Risks and benefits"],
    page_url: `${SITE}/templates/professional-counseling-informed-consent-form/`,
    preview_template_id: "735b03e7-2443-46a9-bf9f-8106289782d5",
    pdf_url: `${SITE}/files/professional-counseling-informed-consent-form.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "telehealth-consent",
    title: "Telehealth Consent Form",
    professions: ["psychology_counseling", "physical_therapy", "occupational_therapy", "speech_pathology", "dietetics", "general_medical"],
    document_type: "consent_form",
    purpose: "Record a client's agreement to receive care by video or phone, with the benefits, limits and right to withdraw.",
    section_headings: [
      "Patient information",
      "Consent to telehealth services",
      "Acknowledgment of benefits and limitations",
      "Privacy and security",
      "Right to withdraw or modify consent",
      "Documentation and record-keeping",
      "Acknowledgment and signature",
    ],
    page_url: `${SITE}/templates/telehealth-consent-form/`,
    preview_template_id: "2dbefdae-7f6c-4de9-a361-e95127179968",
    pdf_url: `${SITE}/files/telehealth-consent-form.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "ai-consent",
    title: "Carepatron AI Consent Form",
    professions: ["psychology_counseling", "physical_therapy", "occupational_therapy", "speech_pathology", "dietetics", "general_medical"],
    document_type: "consent_form",
    purpose: "Tell a client that an AI scribe helps with notes, how their information is handled, and get their agreement.",
    section_headings: ["Effective date", "AI use in healthcare documentation", "How Carepatron AI handles your information"],
    page_url: `${SITE}/templates/carepatron-ai-consent-form/`,
    preview_template_id: "af06d527-fe2d-4733-95b0-526cabdbbe02",
    pdf_url: `${SITE}/files/carepatron-ai-consent-form.pdf`,
    last_verified: "2026-10-11",
  },
  {
    id: "therapy-cancellation-policy",
    title: "Therapy Cancellation Policy Template",
    professions: ["psychology_counseling", "physical_therapy", "occupational_therapy", "speech_pathology", "dietetics", "general_medical"],
    document_type: "cancellation_policy",
    purpose: "State the notice period, fees and exceptions for cancelled or missed sessions, with a client agreement.",
    section_headings: ["Cancellation notice", "Cancellation fees", "Exceptions", "Client agreement"],
    page_url: `${SITE}/templates/therapy-cancellation-policy-template/`,
    preview_template_id: "1e6d5eef-52a5-473f-867a-162587761893",
    // No pdf_url: the page's Download button links to files/ace-test.pdf, an unrelated file (checked 2026-10-11).
    last_verified: "2026-10-11",
  },
];

export function openInCarepatronUrl(t: Template): string {
  return `https://app.carepatron.com/Templates?previewTemplateId=${t.preview_template_id}`;
}

// Tool enums are derived from the catalog so they can't drift from it (eng review, Section 2 #2).
function unique<T>(values: T[]): [T, ...T[]] {
  return [...new Set(values)] as [T, ...T[]];
}

export const PROFESSIONS = unique(TEMPLATES.flatMap((t) => t.professions));
export const DOCUMENT_TYPES = unique(TEMPLATES.map((t) => t.document_type));
export const NOTE_FORMATS = unique(TEMPLATES.flatMap((t) => (t.note_format ? [t.note_format] : [])));
export const TEMPLATE_IDS = unique(TEMPLATES.map((t) => t.id));
