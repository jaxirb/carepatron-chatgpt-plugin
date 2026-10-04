# Handoff: for the Carepatron team

## What's included

- A working MCP server with two read-only tools and a branded template card. It runs on Node locally or on Cloudflare Workers.
- 37 automated tests and a link checker.
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

## Scale it

- **More templates.** Each template page on carepatron.com already embeds its title, section headings, profession tags and the `previewTemplateId` used by **Use Template**. Generate `src/catalog.ts` from that data, or from a template endpoint if the public API adds one. Professions and document types are derived from the catalog automatically.
- **Keep it accurate.** `npm run check-links` confirms every page and PDF still loads. Run it in CI.

## What to measure

- Outbound links carry `utm_source=chatgpt&utm_medium=plugin&utm_campaign=templates`.
- The **Open in Carepatron** button goes to the app's login and template preview, without tracking tags until someone confirms they survive the login redirect. To attribute signups, add the same tags there once that's checked.
- Suggested funnel: card shown → Open in Carepatron → signup or login → template used in a first note.

## Known limits

- 10 templates, chosen across 5 professions. Scored assessment instruments (PHQ-9, GAD-7 and similar) are excluded on purpose.
- The BIRP PDF link points at `/files/birp-notes-template.pdf` because the page's own Download link (`.pdff`) is broken.
- ChatGPT decides when to call the plugin. When it's drafting a note for someone, it sometimes offers the template as a text link rather than the card.
