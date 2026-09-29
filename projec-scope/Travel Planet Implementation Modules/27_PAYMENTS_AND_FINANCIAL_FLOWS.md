# PAYMENT HUB

## Architecture

Payment abstraction over gateways.

## Flow

`ORDER → PAYMENT INTENT → GATEWAY → WEBHOOK → VERIFY → RECEIPT → ACCOUNTING POST`

## Requirements

Idempotency, webhook verification, retry safety, reconciliation, refunds, partial payments, failed payments, payment status history.

## Financial boundary

Payment status is operational evidence; accounting posting creates financial truth.

## Sensitive data

Do not store unnecessary card data. Use provider tokens/hosted mechanisms where appropriate.
