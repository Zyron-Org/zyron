# Zyron — Frontend Context

## Product
Smart contract security & auditing platform. Four functional areas, in build order:
1. Public marketing site — Landing/Home, Pricing & Services, Login/Sign Up
2. Client portal — Registration/Password Reset, Client Dashboard, New Audit Request
   (with .sol upload), Payment/Checkout, Audit Status Tracker, Document Vault,
   Account Settings
3. Internal auditor workspace — Auditor Login, Ticket Queue Dashboard, Dual-Pane
   Code Review, Vulnerability Triage, Annotation Editor, Report Generation
4. Platform admin — User & Role Management, Global Ticket Oversight

## Brand mood
Clinical, precise, a security lab / terminal — the opposite of a crypto-hype
landing page or a soft consumer SaaS dashboard. Think diagnostic tooling, not
marketing gloss.

## Color tokens (use exclusively — never invent new brand colors)
bg-void:        #0B0D10   page background, near-black not pure black
bg-panel:       #14171C   cards, panels, code-review surface
bg-panel-raised:#1B1F26   modals, dropdowns, hover states
border-hairline:#262B33   1px dividers and table rules — used constantly
text-primary:   #E8EAED   body/headline text
text-muted:     #8B93A1   secondary text, timestamps, captions
accent-scan:    #5EC8FF   the one brand accent — links, active states, hero scan-line
signal-critical:#FF5468   severity: Critical
signal-high:    #FF9F43   severity: High
signal-medium:  #FFD166   severity: Medium
signal-low:     #6C9EFF   severity: Low
signal-resolved:#3DDC97   passed check / resolved finding — the ONLY place green appears

Severity colors are functional, not palette filler — they only ever appear next to
a real severity or status. They never appear on buttons, nav, or decoration.

## Typography
- Display (headings only, large sizes, tight tracking): Neue Montreal or General Sans
- Body (dense UI text, 14–16px): Inter or Public Sans
- Mono (structural, not just code): JetBrains Mono or IBM Plex Mono — used for
  contract addresses, severity labels, timestamps, ticket IDs, nav eyebrows.
  This is the connective tissue of the whole UI, not a code-block-only font.

## Layout rules
- Hairline grid throughout, 1px border-hairline — this is the primary structural device
- Depth comes from background layering (bg-void → bg-panel → bg-panel-raised), never
  drop shadows
- Border radius small and consistent: 4–6px everywhere, nothing soft/pill-shaped
- Labels/eyebrows are mono and must encode real data (a ticket ID, a status enum, a
  severity code) — never decorative "01 / 02 / 03" markers UNLESS the content is a
  real sequence. The Audit Status Tracker IS a real sequence
  (Pending → Scanning → In Manual Review → Completed) — stage and number it clearly.
  Nothing else gets numbered markers.

## Signature element — the one thing to spend animation budget on
The landing page hero is a live-typing terminal scan simulation, not a headline +
illustration. Typewriter-effect lines appearing next to/behind the headline, e.g.:
  Parsing contract bytecode...
  Checking reentrancy guards...
  ⚠ Unchecked external call — Line 142
Loop or settle on a finished-scan state after ~4-6 lines. This is the one orchestrated
animation moment in the whole product. Everywhere else: quiet. No scroll-jacking, no
parallax, no gratuitous entrance animations — hover-only micro-interactions at most.

## Voice & copy rules
- Write from the reader's side of the screen: what they get, not how the system
  is built. Never sell — describe plainly.
- Active voice. A button's label matches the toast/confirmation it produces
  (e.g. a "Submit for Review" button leads to a status that says "Submitted for review",
  not "Success!").
- No filler adjectives, no emoji anywhere in UI copy or headings.
- Errors: state what happened and how to fix it, in the interface's voice — never
  apologize, never be vague.
- Empty states: an invitation to act, not a mood ("No audits yet — start a new
  request" not "It's quiet here...").
- Draft hero copy (iterate on this, don't ship verbatim):
  Headline: "Ship contracts you'd stake your own funds on."
  Subhead: "Zyron pairs automated vulnerability scanning with manual review from
  auditors who've broken production protocols. Upload a contract, get a scoped
  quote, track the review live."

## Explicit "don't" list — things that read as generic AI-generated output
- No purple-to-blue gradients anywhere
- No acid-green or vermilion accents (accent-scan is a cold blue, not either)
- No numbered 01/02/03 markers unless the content is a genuine sequence
- No stock SaaS copy ("Streamline your workflow!", "Unlock your potential")
- No emoji in UI copy or headings
- No drop shadows for elevation — use the bg-void/bg-panel/bg-panel-raised layers

## Stack
Next.js App Router, TypeScript, Tailwind (configured with the exact tokens above —
see tailwind.config.ts), shadcn/ui as headless primitives only (restyle every
component, don't ship default shadcn styling), Framer Motion used ONLY for the hero
scan and the status-tracker stage transitions. Mock data lives in lib/mock-data.ts,
fully typed, with 3–4 example audit requests in different pipeline states.

## Workflow rules
- Build one functional area at a time, in the order listed under Product — don't
  jump between areas or build screens out of order.
- Prefer the smallest change that solves the requested screen; reuse existing
  primitives and tokens before adding new ones.
- Before presenting any screen, self-critique it against the Brand mood, Layout
  rules, and "don't" list above, and flag anything that reads as a generic default
  rather than a choice made for Zyron specifically.