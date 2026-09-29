# VN8 / VO8 / VOICE SEARCH

## Principle

`SPEAK → UNDERSTAND → RESOLVE → AUTHORIZE → CONFIRM → EXECUTE → RESPOND`

VN = navigation.  
VO = operation.

## Architecture

Voice Experience → Language Detection → Phrase Engine → Intent Registry → Entity Resolver → Context → Conditions → RBAC → Confirmation → Function Registry → Workflow/API → Response.

## Command types

NAVIGATION, SEARCH, FILTER, OPEN, CREATE, UPDATE, ASSIGN, APPROVE, SEND, GENERATE, WORKFLOW, HELP, AI.

## Languages

en-IN, ml-IN, hi-IN. Support code-switching.

## Context

$currentUser, $currentRole, $currentWorkspace, $currentMode, $currentRoute, $currentOrganization, $currentCustomer, $currentTrip, $currentBooking, $currentCircle.

## Command builder

Command type, intent, phrases, locales, entities, variables, function pipeline, conditions, permission, data scope, risk, confirmation, response, supported modes, roles, version.

## Function Registry

Functions are governed capabilities reusable by UI, voice, AI, automation and API.

## Voice macros

Example:
“Morning briefing” → today's tasks + follow-ups + new enquiries + pending quotes + AI summary.

## Security

Voice never bypasses RBAC or data scope. High-risk actions require confirmation.

## Events

VOICE_SESSION_STARTED, VOICE_INPUT_RECEIVED, VOICE_INTENT_RESOLVED, VOICE_SEARCH_EXECUTED, VOICE_NAVIGATION_EXECUTED, VOICE_ACTION_REQUESTED, VOICE_ACTION_CONFIRMED, VOICE_PERMISSION_DENIED, VOICE_ERROR.
