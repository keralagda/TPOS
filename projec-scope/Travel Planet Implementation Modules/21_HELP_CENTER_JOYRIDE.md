# HELP CENTER + IN-APP GUIDANCE

## Purpose

Reusable documentation infrastructure, not static help pages.

## Architecture

Documentation Engine, Tutorial Engine, Guide Engine, Tour Engine, Contextual Help, Search, Knowledge Registry, Versioning, Targeting, Progress, Feedback, Analytics, AI.

## Route

`/help`

Sections:
Home, Getting Started, What's New, Transition, Workspace, Role Guides, Travel, CRM, TMS, ERP, Finance, Supplier, Content, AI, Integrations, Account, Troubleshooting, FAQs, Glossary, Releases, Contact.

## Transition

“Welcome to the New Travel Planet”

Migration finder:
legacy label → new module → route → tour.

## React Joyride

Reusable TransitionTourEngine with TourRegistry.

Selectors:
`data-tour="mode-switcher"`
`workspace-sidebar`
`workspace-dashboard`
`global-search`
`crm-leads`
`crm-enquiries`
`crm-customers`
`tms-trips`
`documents`
`ai-assistant`
`help-center`

## Documentation IR

Content → Documentation IR → web renderer / in-app renderer / tour renderer / AI knowledge.

## Quality

Detect broken links, missing selectors, outdated screenshots, stale feature references and permission mismatches.
