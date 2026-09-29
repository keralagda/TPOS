# Travel Planet Connect — Integration OS

## Purpose

Create a provider-neutral integration layer.

## Connector types

1. REST/API connector
2. GraphQL connector
3. Webhook connector
4. File/feed connector
5. Authorized browser connector
6. Manual import connector

## Connector lifecycle

register
→ authenticate
→ capability discovery
→ health check
→ test
→ activate
→ sync
→ observe
→ reconcile
→ disable

## Standard interface

authenticate()
healthCheck()
discover()
search()
fetchOffers()
fetchAvailability()
fetchPricing()
fetchPolicies()
normalize()
validate()
detectChanges()
sync()
logout()

## Connector requirements

Each connector must expose:
- capabilities
- authentication method
- rate limits
- sync mode
- webhook support
- supported products
- error mapping
- retry policy
- idempotency strategy
- freshness semantics

## Credential rule

Store only a secure credential reference in application data. Secrets belong in a managed secret/credential vault.

## Browser connector rule

Only implement authenticated vendor-site automation when:
- Travel Planet is authorized
- vendor terms permit it
- credentials are lawfully supplied
- automation does not bypass access controls
- rate limits are respected
- vendor policy permits automation

Prefer API/feed integration whenever available.
