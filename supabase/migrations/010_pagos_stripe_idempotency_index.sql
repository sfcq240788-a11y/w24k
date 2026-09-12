-- Migration 010: Unique partial index for Stripe payment idempotency
--
-- Safety check executed before creating this migration:
--   SELECT referencia_externa, COUNT(*) FROM pagos
--   WHERE pasarela = 'stripe'
--   GROUP BY referencia_externa
--   HAVING COUNT(*) > 1 OR referencia_externa IS NULL;
-- Result: 0 rows -- no duplicates or NULLs found. Safe to create.
--
-- This index enforces that the same Stripe PaymentIntent ID cannot be
-- inserted twice into pagos, preventing duplicate records when Stripe
-- retries the webhook. The WHERE clause limits scope to stripe rows only,
-- leaving manual and mercado_pago rows unaffected.

CREATE UNIQUE INDEX IF NOT EXISTS idx_pagos_stripe_referencia_externa
  ON pagos (referencia_externa)
  WHERE pasarela = 'stripe';
