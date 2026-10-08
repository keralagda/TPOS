# Travel Planet (Voyage8) — Resend DNS & Domain Verification

This document specifies the exact DNS records required by Resend to verify sending from `travelplanet.tours` and `no-reply@travelplanet.tours`.

---

## 1. Sending Domain Configuration

- **Domain:** `travelplanet.tours`
- **Sender Address:** `Travel Planet <no-reply@travelplanet.tours>`
- **Support / Reply-To:** `support@travelplanet.tours`
- **Development Sandbox (Pre-verification):** `Travel Planet <onboarding@resend.dev>`

---

## 2. DNS Records for Domain Verification

Add the following records to your DNS provider (e.g., Cloudflare, Route53, Namecheap) for `travelplanet.tours`:

### Record 1: DKIM (DomainKeys Identified Mail)
- **Type:** `TXT`
- **Name / Host:** `resend._domainkey` (or `resend._domainkey.travelplanet.tours`)
- **TTL:** Auto or 3600
- **Value:** Provided in the Resend Dashboard under Domains -> `travelplanet.tours` -> DKIM key (`k=rsa; p=...`)

### Record 2: Return-Path / SPF (Sender Policy Framework)
- **Type:** `MX`
- **Name / Host:** `bounces` (or `bounces.travelplanet.tours`)
- **Priority:** `10`
- **Value:** `feedback-smtp.us-east-1.amazonses.com`

- **Type:** `TXT`
- **Name / Host:** `bounces` (or `bounces.travelplanet.tours`)
- **TTL:** Auto or 3600
- **Value:** `v=spf1 include:amazonses.com ~all`

### Record 3: DMARC (Domain-based Message Authentication)
- **Type:** `TXT`
- **Name / Host:** `_dmarc` (or `_dmarc.travelplanet.tours`)
- **TTL:** Auto or 3600
- **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@travelplanet.tours`

---

## 3. Environment Variable Activation

Once the domain shows as **Verified** in your Resend Dashboard:

Update `.env` (or Vercel Environment Variables):

```bash
# Production verified sender
EMAIL_FROM="Travel Planet <no-reply@travelplanet.tours>"
EMAIL_REPLY_TO="support@travelplanet.tours"
```

During development or before DNS propagation:
```bash
# Development sandbox sender
EMAIL_FROM="Travel Planet <onboarding@resend.dev>"
```
