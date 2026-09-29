# PLATFORM ARCHITECTURE

## Stack principle

One Platform Shell → Multiple Role Workspaces → Modes → Modules → Shared Engines.

## Core layers

`Identity → Tenancy → RBAC → Workspace → Mode → Registry → Domain Engines → Workflow → Events → Integrations → Experience`

## Primary workspaces

`executive, operations, agent, crm, finance, supplier, support, marketing, content, analytics, integrations, ai, corporate, tms, erp, social`

## Stable routes

Public:
`/`

Workspace:
`/workspace/{workspace}`

Admin:
`/admin/...`

Vendor:
`/vendor/...`

Partner:
`/partner/...`

Customer:
`/account/...`

## Route doctrine

Filesystem defines stable route boundaries. Registry defines who can enter and what is rendered.

Do not manufacture the entire route system dynamically from database records.

## Shared shell

AppShell, WorkspaceShell, Sidebar, Topbar, ModeSwitcher, WorkspaceSwitcher, Breadcrumbs, CommandPalette, GlobalSearch, VoiceSearch, NotificationCenter, UserMenu, MobileNavigation.

## Mode contract

`Mode → Workspace → Navigation → Dashboard → Widgets → Actions → Search Profile → AI Profile → Data Scope → Permissions → Voice Commands → Help`

## Primary modes

CRM, TMS, ERP, Finance, Supplier, Content, Social, Admin, AI, Analytics, Marketing, Corporate.

## Cross-cutting engines

Auth, RBAC, workflow, approvals, search, notifications, automation, documents, payments, integrations, localization, analytics, audit, feature flags, schedules, rollout, AI, voice.
