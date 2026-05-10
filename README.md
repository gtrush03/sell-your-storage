# Sell Your Storage

Three A/B-testable Instagram-ad landing pages + a private admin dashboard for lead capture.

## What it does

If you're paying $180/mo to store a couch you don't use, this funnel helps you decide to sell it. Three ad creatives → three landing pages → one shared admin.

## Pages

- `/a` — **Variant A · Direct.** "Got shit in storage you wanna sell?"
- `/b` — **Variant B · The math.** "$2,160 a year. For a closet you forgot about." (with live calculator)
- `/c` — **Variant C · The quote.** "I have stuff in storage." (everyone-does framing)
- `/admin` — Token-gated dashboard with filter, refresh, and CSV export.
- `/` — Variant index for picking which to push.

## API

- `POST /api/lead` — public, accepts `{name, phone, email, notes, variant}`, appends to a private GitHub gist.
- `GET /api/leads` — requires `Authorization: Bearer <ADMIN_TOKEN>`, returns the lead list.

## Env vars (set in Vercel)

- `GIST_ID` — id of the private gist used as the lead store
- `GH_TOKEN` — GitHub PAT with `gist` scope (writes to the gist)
- `ADMIN_TOKEN` — bearer token for admin auth

## Local dev

```bash
vercel dev
```

## Stack

Vanilla HTML/CSS/JS · Vercel functions · GitHub gist as DB. Total page weight under 250KB.

— Made by Genie for iqram. 2026-05-10.
