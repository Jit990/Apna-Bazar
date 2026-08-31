-- Migration: Add OTP store table for persistent, production-safe OTP storage
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS otp_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,  -- Hashed OTP using SHA-256 (never store plain text)
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(phone)  -- One active OTP per phone number
);

-- Auto-delete expired OTPs (cleanup)
CREATE INDEX IF NOT EXISTS idx_otp_store_phone ON otp_store(phone);
CREATE INDEX IF NOT EXISTS idx_otp_store_expires ON otp_store(expires_at);

-- Enable RLS (no direct client access allowed - server-side only via service role)
ALTER TABLE otp_store ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE from client (service role bypasses RLS)
-- This table is only accessed via server-side API routes using createAdminClient()
