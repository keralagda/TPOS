# Travel Planet — Operations Runbook

## Daily checks

- booking failures
- payment failures
- pending supplier confirmations
- stale offers
- connector health
- webhook failures
- refund queue
- cancellation queue
- today's departures
- visa/document exceptions
- customer support escalations

## Connector incident

1. identify connector
2. inspect health
3. inspect latest sync
4. inspect error logs
5. determine source/system failure
6. disable affected capability if required
7. prevent stale offers from being presented as live
8. retry safely
9. reconcile
10. document incident

## Booking incident

Never manually alter booking state without:
- authorization
- audit event
- source evidence
- financial review where applicable

## Payment incident

Use gateway verification and internal ledger state.

Never mark paid based only on a client-side redirect.

## Vendor incident

Check:
- contract
- connector status
- credential state
- API response
- sync freshness
- availability
- pricing
- booking confirmation

## AI incident

If AI produces an incorrect operational recommendation:
- preserve the original recommendation
- identify evidence used
- prevent consequential execution
- correct source data if needed
- record review
