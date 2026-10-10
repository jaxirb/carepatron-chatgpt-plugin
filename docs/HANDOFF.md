# Handoff: for the Carepatron team

## What's included

- A working MCP server with three read-only tools and a branded template card. It runs on Node locally or on Cloudflare Workers.
- A landing page at `/` and a no-install card preview at `/demo?template=<id>`, so anyone can see the card without ChatGPT developer mode.
- 98 automated tests and a link checker.
- `DESIGN.md`, the card's design rules, taken from carepatron.com.
- [RESEARCH.md](RESEARCH.md): OpenAI's plugin requirements, the competitive landscape and the risks, with sources.

## Try it in two minutes

See [Try it](../README.md#try-it). You need a ChatGPT Plus (or higher) account with developer mode turned on.

## Run it yourself

```bash
npm install && npm test
npm run dev:worker     # local Worker at http://localhost:8787/mcp
npm run deploy         # your own Cloudflare account (free tier is plenty)
```

Point the ChatGPT plugin at your deployed `/mcp` URL.

## Publish it as Carepatron

Only Carepatron can publish this, because OpenAI requires the publisher to verify it is the business named on the plugin. Steps, from [OpenAI's plugin docs](https://developers.openai.com/plugins):

1. **Verify your OpenAI organization** as Carepatron ([app review](https://developers.openai.com/plugins/deploy/app-review#organization-verification)).
2. **Host the server on your own domain over HTTPS** (Workers, or anywhere that runs Node). Temporary tunnels aren't accepted.
3. **Publish a privacy policy** that covers the plugin. It collects no personal data, which keeps that policy short.
4. **Add `ui.domain`** to the card resource's metadata in `src/mcp.ts`. Submission requires it.
5. **Submit** with your branding, the test prompts in [RESEARCH.md](RESEARCH.md#6-test-prompts), and screenshots.

Rules that already hold and should stay that way ([plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines)):

- **No protected health information.** Inputs are fixed choices, so there's nowhere for PHI to go.
- **No selling, upsells or checkout links.** The card links to a template and the login page only. Don't add pricing or trial links to the card or the tool replies.
- **Don't imply OpenAI endorsement.**

## The third tool: intake.checklist

`src/checklist.ts` holds the content as plain data: what a new-client pack should include, by profession group (mental_health, allied_health, dietetics, general) and country (US, AU, NZ, GB, CA). Every item has a title, why it matters, wording the clinician can paste, and where relevant the Carepatron template that covers it.

Two things to keep true if you extend it:

- **Inputs stay enums.** The privacy guarantee is that no field can hold a client detail. A free-text "tell me about your practice" box would break it.
- **The consent item is the one that dates.** Guidance on AI note-taking moved through 2025 and 2026 and is still moving. The country lines came from regulators and professional bodies (APA, ACA, ASHA, APTA, RCFP recording laws, Ahpra, RACGP, APS, OAIC, MCNZ, NZ Psychologists Board, NHS England, ICO, BACP, Ontario IPC, CPA). Re-check them before each release, and keep the "not legal advice" caveat in every reply.

## Scale it

- **More templates.** 18 so far. Each template page on carepatron.com already embeds its title, profession tags and the `previewTemplateId` used by **Use Template**; the section headings for the 11 Oct batch were read off each template's own PDF. Generate `src/catalog.ts` from that data, or from a template endpoint if the public API adds one. Professions and document types are derived from the catalog automatically.
- **Keep it accurate.** `npm run check-links` confirms every page and PDF still loads. Run it in CI.

## What to measure

- Outbound links carry `utm_source=chatgpt&utm_medium=plugin&utm_campaign=templates`.
- The **Open in Carepatron** button goes to the app's login and template preview, without tracking tags until someone confirms they survive the login redirect. To attribute signups, add the same tags there once that's checked.
- Suggested funnel: card shown → Open in Carepatron → signup or login → template used in a first note.
- For the intake path specifically, the metric that matters is whether the workspace sends an intake form within two days of arriving. In the challenge's trial data that class of event (a real client touching the product) separated the practices that paid from the ones that didn't.

## Known limits

- 10 templates, chosen across 5 professions. Scored assessment instruments (PHQ-9, GAD-7 and similar) are excluded on purpose.
- The BIRP PDF link points at `/files/birp-notes-template.pdf` because the page's own Download link (`.pdff`) is broken.
- The Therapy Cancellation Policy template ships with no PDF link: its page's Download button points at `/files/ace-test.pdf`, an unrelated file. `pdf_url` is optional in the catalog for this reason, and the card hides the link when it is absent.
- ChatGPT decides when to call the plugin. When it's drafting a note for someone, it sometimes offers the template as a text link rather than the card.
