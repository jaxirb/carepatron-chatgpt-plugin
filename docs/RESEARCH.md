# Research notes

Collected on 3 and 4 October 2026 while planning this plugin. Every claim links to a source or says it's unverified. Section numbers follow the original brief.

## 2. Platform requirements

| Requirement | Detail | Source |
|---|---|---|
| Plugin composition | A plugin can contain skills, an MCP server (UI optional), or both, plus lifecycle hooks. Only one MCP server per plugin. | [concepts/plugins](https://developers.openai.com/plugins/concepts/plugins), [submission](https://developers.openai.com/plugins/deploy/submission) |
| Transport | MCP streamable HTTP at a public HTTPS URL, "typically ending in `/mcp`". Developer mode also accepts SSE. | [build/mcp-server](https://developers.openai.com/plugins/build/mcp-server#deploy-the-endpoint), [developer-mode guide](https://developers.openai.com/api/docs/guides/developer-mode) |
| Auth | The demo can use No Authentication. If OAuth is used, it must be OAuth 2.1 with PKCE S256, and custom API keys are not supported. | [build/auth](https://developers.openai.com/plugins/build/auth), [developer-mode guide](https://developers.openai.com/api/docs/guides/developer-mode) |
| Tool shape | Each tool needs a name, title, a description saying when to use it, `inputSchema`, an `outputSchema` when it returns structured data, annotations, and a handler. | [build/mcp-server](https://developers.openai.com/plugins/build/mcp-server#define-tools-from-user-goals), [reference](https://developers.openai.com/plugins/reference) |
| Tool results | `structuredContent` goes to the model and the UI and must match `outputSchema`. `content` goes to the model and the UI. `_meta` goes to the UI only and is hidden from the model. | [reference, tool results](https://developers.openai.com/plugins/reference#tool-results) |
| Annotations | `readOnlyHint`, `destructiveHint` and `openWorldHint` are required, as explicit booleans. `idempotentHint` is optional. In developer mode, a tool without `readOnlyHint` is treated as a write action and needs confirmation. Mismatched hints are a common rejection reason. | [reference, annotations](https://developers.openai.com/plugins/reference#annotations), [guidelines](https://developers.openai.com/plugins/plugin-guidelines#correct-annotation), [developer-mode guide](https://developers.openai.com/api/docs/guides/developer-mode), [app review](https://developers.openai.com/plugins/deploy/app-review) |
| Server instructions | Put the most important details "in the first 512 characters". | [build/mcp-server](https://developers.openai.com/plugins/build/mcp-server) |
| UI resource | MIME type `text/html;profile=mcp-app` (MCP Apps standard). The tool links to it with `_meta.ui.resourceUri` set to a `ui://` URI. `openai/outputTemplate` is only a compatibility alias. | [build/chatgpt-ui](https://developers.openai.com/plugins/build/chatgpt-ui) |
| UI metadata | `ui.csp` takes `connectDomains`, `resourceDomains` and `frameDomains`. `ui.domain` is required to submit. Opening external links with `openExternal` requires `redirect_domains`, set through the legacy `openai/widgetCSP`. | [reference, resource _meta](https://developers.openai.com/plugins/reference#component-resource-_meta-fields) |
| UI bridge | `window.openai` is optional and ChatGPT-only. Feature-detect each capability rather than branching on host. | [reference, window.openai](https://developers.openai.com/plugins/reference#windowopenai-component-bridge), [build/chatgpt-ui](https://developers.openai.com/plugins/build/chatgpt-ui) |
| UI layout | Cards should have at most two actions and no nested scrolling. | [ui-guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines) |
| Developer mode, enable | Settings → Security and login → Developer mode. Available on Pro, Plus, Business, Enterprise and Education plans, on the web. | [connect-chatgpt](https://developers.openai.com/plugins/deploy/connect-chatgpt), [developer-mode guide](https://developers.openai.com/api/docs/guides/developer-mode) |
| Developer mode, register | At chatgpt.com/plugins, click **+**, enter a name, description and the URL including `/mcp` (or choose Tunnel), then Create. | [connect-chatgpt](https://developers.openai.com/plugins/deploy/connect-chatgpt) |
| Developer mode, invoke | The two quickstarts disagree. The newer one: install from the personal view, switch the homepage tab to **Work**, and type `@`. The older one: **+ → More**. | [quickstart](https://developers.openai.com/plugins/quickstart), [app-quickstart](https://developers.openai.com/plugins/build/app-quickstart) |
| Local exposure | `ngrok http <port>`, then register `https://<sub>.ngrok.app/mcp`. Secure MCP Tunnel also works in developer mode. Neither is accepted for submission. cloudflared is not named in the docs. | [app-quickstart](https://developers.openai.com/plugins/build/app-quickstart), [connect-chatgpt](https://developers.openai.com/plugins/deploy/connect-chatgpt) |
| Local testing | MCP Inspector over Streamable HTTP at `http://localhost:<port>/mcp`. The API Playground shows raw request and response logs. | [build/mcp-server](https://developers.openai.com/plugins/build/mcp-server), [connect-chatgpt](https://developers.openai.com/plugins/deploy/connect-chatgpt) |
| Metadata | Descriptions should start with "Use this when…" and name disallowed cases. Name tools as domain plus action. Use enums and examples for parameters. Keep a golden set of direct, indirect and negative prompts, and aim for high precision on negatives first. | [optimize-metadata](https://developers.openai.com/plugins/guides/optimize-metadata) |
| Data minimization | No "just in case" fields and no inputs that take conversation history. Responses must not include request or trace IDs, timestamps or debug payloads. | [guidelines, tool data handling](https://developers.openai.com/plugins/plugin-guidelines#tool-data-handling), [app review](https://developers.openai.com/plugins/deploy/app-review) |
| Security | Validate every input server-side, assume prompt injection, and redact PII from logs. | [security-privacy](https://developers.openai.com/plugins/guides/security-privacy) |
| Gotcha: stale tools | After a change, redeploy, press **Refresh** on the plugin, then start a new conversation. | [connect-chatgpt, refresh](https://developers.openai.com/plugins/deploy/connect-chatgpt#refresh-metadata) |
| Gotcha: UI caching | The resource URI acts as a cache key, so version it when making breaking changes. Content may be cached "for up to one hour". | [build/chatgpt-ui](https://developers.openai.com/plugins/build/chatgpt-ui), [app review](https://developers.openai.com/plugins/deploy/app-review) |
| Gotcha: iframe | CSP must list exact domains. Nested frames are blocked by default. `alert`, `prompt`, `confirm` and clipboard are unavailable, and `localStorage` is unreliable. | [security-privacy](https://developers.openai.com/plugins/guides/security-privacy), [build/chatgpt-ui](https://developers.openai.com/plugins/build/chatgpt-ui) |
| Gotcha: latency | The docs give no numeric timeout. UI feels sluggish beyond "a few hundred milliseconds". Buffering proxies break streaming, and ngrok tunnels time out. | [troubleshooting](https://developers.openai.com/plugins/deploy/troubleshooting) |
| Skills (optional) | A skill is a folder containing `SKILL.md`. Its name and description load first, and the full body loads when a request matches. | [concepts/skills](https://developers.openai.com/plugins/concepts/skills) |

## 3. Carepatron facts

**Template URLs and pages**
- Templates live at `https://www.carepatron.com/templates/{slug}/`, a flat structure with no category paths. The index is [/templates/](https://www.carepatron.com/templates/).
- Localized copies use a locale prefix, for example `/es/templates/{slug}/` ([sitemap](https://www.carepatron.com/sitemap.xml)).
- Some slugs are aliases. `/templates/soap-notes-template/` points its canonical tag to [/templates/soap-progress-notes-template/](https://www.carepatron.com/templates/soap-progress-notes-template/).
- Profession hubs live at `/resources/{profession}/`, for example [/resources/dietitian/](https://www.carepatron.com/resources/dietitian/).

**Library size and categories**
- Carepatron does not state a library size on the pages checked.
- The research agent counted 4,602 English template URLs in the [sitemap](https://www.carepatron.com/sitemap.xml). That is our own count, not a Carepatron figure.
- The index page has no visible category filter. Each template's page data carries profession tags (Psychology, Medical, Counselor, Physical Therapy, Dietitian, Occupational Therapist, Speech Pathologist and others) ([index](https://www.carepatron.com/templates/)).

**What a template page contains**
- Title, summary, author and reviewer.
- A table of contents leading to sections such as "What is", "How to use", "Benefits" and "References".
- A PDF preview with "PDF Template" and "Example PDF" tabs.
- FAQs.
- Source: [SOAP page](https://www.carepatron.com/templates/soap-progress-notes-template/).

**Calls to action on a template page**
- **Use Template** links to `https://app.carepatron.com/Templates?previewTemplateId={uuid}`, a deep link into the app ([SOAP page](https://www.carepatron.com/templates/soap-progress-notes-template/)). A logged-out visitor is sent to `app.carepatron.com/Login?redirect=Templates%3FpreviewTemplateId%3D…`, a "Welcome back" sign-in page (Google, Apple, or email) with a secondary "Create account" link. The template ID survives the redirect. This was checked by the builder in an incognito browser on 3 October 2026; there is no public source for it.
- **Download** links straight to a PDF with no gate, for example [/files/soap-progress-notes.pdf](https://www.carepatron.com/files/soap-progress-notes.pdf).
- **Get started for free** and **Start a free trial** go to `app.carepatron.com/Register` or a fixed template ID ([SOAP page](https://www.carepatron.com/templates/soap-progress-notes-template/)). Treat these as signup or upsell links.
- In the app, the Community library offers "Use template" and "Copy to workspace" ([help: getting started with templates](https://help.carepatron.com/en/articles/9868145-getting-started-with-templates)).

**Robots and terms**
- robots.txt disallows nothing and points to the sitemap ([robots.txt](https://www.carepatron.com/robots.txt)).
- `app.` and `developer.` subdomains returned CloudFront 403 to plain curl (observed by the research agent; no public page states this).
- The Terms of Service have no clause on scraping or automated access ([ToS](https://www.carepatron.com/terms-of-service/)).
- 15.1: Carepatron owns IP in "the Websites" and its marks.
- 15.2 bars copying "ideas, features, functions or graphics contained in the Service".
- The ToS defines "Content" as "template and template libraries provided through the Service".
- The ToS date is inconsistent: "Last updated: 26th June 2025" at the top, "September 2022" at the bottom.

**Plans and pricing**
- A free plan exists at $0 and includes AI scribe and 1M AI tokens ([pricing](https://www.carepatron.com/pricing/)).
- The API row appears to be Advanced-only. This is inferred from the pricing table; unverified.

**Public API**
- Endpoints: `/ping`, `/providers/{id}/secure-ping`, and contacts export jobs. Auth uses the `cp-api-key` header. There is no templates endpoint ([developer docs](https://developer.carepatron.com/docs)).

**Carepatron's own AI and compliance**
- AI Scribe 3.0 drafts a signable SOAP or DAP note and is included on all plans including Free ([release note](https://www.carepatron.com/product-releases/ai-scribe-3-0/)).
- Compliance claims: HIPAA, GDPR, SOC 2 Type II, and a BAA ([Carepatron AI](https://www.carepatron.com/features/carepatron-ai), [compliance](https://www.carepatron.com/features/compliance-and-security)).

## 4. Template set

Section headings come from the page where it lists them, otherwise from the linked PDF (marked "PDF"). The research agent recorded the Use Template IDs from each page's "Use Template" link.

| # | Title | URL | Profession | Type | Purpose | Section headings | Use Template ID |
|---|---|---|---|---|---|---|---|
| 1 | SOAP Progress Notes Template | [link](https://www.carepatron.com/templates/soap-progress-notes-template/) | Multi-discipline (Medical, PT, OT) | Progress note | Document a session in the four SOAP sections. | Subjective; Objective; Assessment; Plan | `e5c6f3e6-0953-4243-996e-810ca8598266` |
| 2 | DAP Notes Template | [link](https://www.carepatron.com/templates/dap-notes-template/) | Counseling, Psychology | Progress note | A shorter session note covering data, assessment and plan. | PDF: Patient information; Data; Assessment; Plan; Clinician sign-off | `69f9e432-9ae9-4286-954e-26b0deb8e2f8` |
| 3 | BIRP Notes Template | [link](https://www.carepatron.com/templates/birp-notes-template/) | Behavioral health | Progress note | Record behavior, intervention, response and plan for a session. | Behavior; Intervention; Response; Plan | `83b1a8a8-959a-4a9f-83f5-2cd7373211f1` |
| 4 | Therapy Intake Form | [link](https://www.carepatron.com/templates/therapy-intake-form/) | Psychology, Therapy | Intake form | Collect a new client's background before the first session. | PDF: Patient Information; Emergency Contact; Health and Medical Information; Insurance Information; Employment Status; Availability; Personal and Family | `eecf68f8-0a6c-4b63-8d1e-77a1b3020c62` |
| 5 | Treatment Plan Template | [link](https://www.carepatron.com/templates/treatment-plan-template/) | Psychology, Counseling, Medical | Treatment plan | Set out concerns, goals and planned interventions in one plan. | PDF: Basic Information; Patient concern; Short term goals; Long term goals; Sleeping patterns; Exercise patterns; Medications; Interventions | `bfc4c35a-6096-40ed-af0b-d7d29bcaeab2` |
| 6 | CBT Thought Record Templates | [link](https://www.carepatron.com/templates/cbt-thought-record-templates/) | Psychology | Client worksheet | The client logs and challenges unhelpful thoughts between sessions. | PDF columns: Date; Situation; Emotions/Physical Sensations; Thought; Unhelpful Thinking Styles; My Response | `220a339c-4126-4678-be6a-64fd5bd5874d` |
| 7 | Physical Therapy Evaluation Template | [link](https://www.carepatron.com/templates/physical-therapy-evaluation-template/) | Physical therapy | Evaluation | An initial PT assessment that leads into a plan of care. | PDF: Patient Information; Medical History; Referring Physician; Presenting Problem; Functional Assessment; Physical Examination; Assessment; Plan of Care | `b32d261f-1fcb-4683-b5d5-7ca090b5d5cd` |
| 8 | SOAP Notes For Occupational Therapy Template | [link](https://www.carepatron.com/templates/soap-notes-for-occupational-therapy-template/) | Occupational therapy | Progress note | A SOAP session note tailored to OT. | Subjective; Objective; Assessment; Plan | `c2564934-d3fa-4725-9208-e51dc06d2e61` |
| 9 | SOAP Notes For Speech Therapy Template | [link](https://www.carepatron.com/templates/soap-notes-for-speech-therapy-template/) | Speech pathology | Progress note | A SOAP note for speech-language therapy sessions. | Subjective; Objective; Assessment; Plan | `b964fe44-764c-4c16-a9cb-c852c44b82db` |
| 10 | Nutrition Assessment | [link](https://www.carepatron.com/templates/nutrition-assessment/) | Dietetics | Assessment form (not scored) | A structured dietitian review of measurements, diet, labs and nutritional needs. | PDF: Patient information; Anthropometric measurements; Dietary habits and nutrient intake; Biochemical data; Physical examination; Nutritional risk factors; Medical history; Nutritional needs and goals | `aafc4674-b119-4332-90e4-42666819ce93` |

Notes on the set:
- **BIRP download is broken.** The page's Download link points to `.pdff` and returns 404.
- **Excluded:** scored instruments (PHQ-9, GAD-7, BDI, MoCA and similar), on licensing and clinical-use grounds.
- **Alternates:** [Informed Consent Form](https://www.carepatron.com/templates/informed-consent-form/), [Discharge Summary](https://www.carepatron.com/templates/discharge-summary/), [Chiropractic Intake Form](https://www.carepatron.com/templates/chiropractic-intake-form/).

## 6. Test prompts

**Direct** (these name Carepatron and should trigger the plugin)
1. "Find me Carepatron's SOAP note template."
2. "Does Carepatron have a DAP note template for counselors?"
3. "Open Carepatron's therapy intake form."
4. "Show me Carepatron templates for occupational therapy."
5. "Get the Carepatron physical therapy evaluation template."

**Indirect** (a clinician describes the need without naming Carepatron; these should trigger)
1. "I'm a speech therapist and need a SOAP note format for my sessions."
2. "I need a treatment plan template for my private counseling practice."
3. "Is there a CBT thought record worksheet I can give clients?"
4. "What sections should a BIRP note have? Give me a template."
5. "I'm a dietitian looking for an initial nutrition assessment form."

**Negative** (these must not trigger the plugin)
1. "What is the first-line treatment for generalized anxiety in adults?" This asks for clinical advice.
2. "Write a SOAP note for my client Maria Lopez, 42, seen today for low back pain after a fall." This contains patient details.
3. "My client John, DOB 3 April 1988, scored 18 on the PHQ-9. What does that mean?" This contains patient details and asks for clinical interpretation.
4. "How much does Carepatron Advanced cost compared to SimplePractice?" This is a pricing question, and answering it would risk upsell.
5. "Help me write a cover letter for an occupational therapy job." This is not a template request.

## 7. Landscape

I found no practice-management or EHR product with an official ChatGPT plugin. A third-party snapshot of the ChatGPT healthcare category (about 101 apps) lists no EHR or practice-management app ([node8, Aug 2026](https://www.node8.ai/chatgpt-apps/healthcare/)). The ChatGPT directory itself returned 403, so this rests on that snapshot.

Adjacent activity:
- **Official MCP servers:** CharmHealth ([press release](https://www.charmhealth.com/ehr/press-releases/charmhealth-advances-its-ai-strategy-with-mcp-server.html)), athenahealth (pilot) ([Healthcare Finance](https://www.healthcarefinancenews.com/news/athenahealth-piloting-ai-model-clinical-decision-making)), Healthie (developer sandbox only) ([blog](https://www.gethealthie.com/blog/build-on-healthie-faster-with-ai-coding-agents-and-mcp)) and Medplum ([docs](https://www.medplum.com/docs/ai/mcp)).
- **No official plugin or MCP server found:** SimplePractice ([Carly](https://www.usecarly.com/blog/claude-simplepractice-integration/)), TherapyNotes and Jane ([Eureka directory](https://eureka.md/docs/ehr-mcp-servers)).
- **OpenAI's own products:**
  - ChatGPT for Healthcare includes templates for discharge summaries and letters ([OpenAI](https://openai.com/index/openai-for-healthcare/)).
  - ChatGPT for Clinicians offers documentation "skills" to verified US physicians, NPs, PAs and pharmacists ([help](https://help.openai.com/en/articles/20001202-chatgpt-for-clinicians)). One review says it excludes therapists and PTs ([The Rundown](https://www.therundown.ai/tools/chatgpt-for-clinicians)). Another source disagrees, so treat this as unverified.
- **Carepatron:** nothing found.

## 8. Risks and mitigations

- **Health information:** inputs are enums only, the descriptions forbid client details, the server stores no prompts, and negative prompt 2 checks this.
- **Clinical advice:** the tools return template structure only, the descriptions exclude advice, and negative prompts 1 and 3 check this.
- **Copyright:** return title, a one-line purpose written by us, section headings, and links. No body text and no re-hosted PDFs ([ToS 15.1](https://www.carepatron.com/terms-of-service/)).
- **Native capability:** ChatGPT can already draft a SOAP template. The plugin's added value is a reviewed, attributed template plus a one-click import into a Carepatron workspace (`previewTemplateId`). The guideline requires functionality "not natively supported" ([guidelines](https://developers.openai.com/plugins/plugin-guidelines)).
- **OpenAI endorsement:** use Carepatron-only branding, and keep the word "official" and OpenAI logos out of the name and copy ([guidelines](https://developers.openai.com/plugins/plugin-guidelines)).
- **Upsell and checkout:** never surface the Register, "Start a free trial" or pricing links. Link only to the template page, the Use Template link and the PDF ([guidelines, commerce](https://developers.openai.com/plugins/plugin-guidelines#commerce-and-monetization)).
- **Brand and unofficial connector:** keep the demo private in developer mode and do not submit it. Publishing is Carepatron's decision ([app review](https://developers.openai.com/plugins/deploy/app-review#organization-verification)).
