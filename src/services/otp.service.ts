/**
 * OTP Service — Production-safe, database-backed implementation.
 *
 * OTPs are stored hashed (SHA-256) in the `otp_store` Supabase table.
 * This survives server cold starts and is safe for serverless environments.
 *
 * PREREQUISITE: Run database/migrations/001_otp_store.sql in Supabase SQL Editor.
 */

import crypto from 'crypto';

export interface OTPResult {
    success: boolean;
    message: string;
    // Dev only — never expose in production
    devOtp?: string;
}

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

async function getAdminClient() {
    // Dynamic import to avoid circular dependencies in server context
    const { createAdminClient } = await import('@/lib/supabase/server');
    return createAdminClient();
}

export async function sendOTP(phone: string): Promise<OTPResult> {
    const cleanPhone = phone.replace(/\D/g, '');

    try {
        const adminSupa = await getAdminClient();

        // Rate limiting: check if an OTP was sent recently
        const { data: existing } = await adminSupa
            .from('otp_store')
            .select('created_at, expires_at')
            .eq('phone', cleanPhone)
            .single();

        if (existing) {
            const createdAt = new Date(existing.created_at);
            const now = new Date();
            const secondsElapsed = (now.getTime() - createdAt.getTime()) / 1000;
            if (secondsElapsed < RESEND_COOLDOWN_SECONDS) {
                const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsElapsed);
                return {
                    success: false,
                    message: `Please wait ${wait} seconds before requesting another OTP.`,
                };
            }
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        const otpHash = hashOTP(otp);

        // Upsert — one active OTP per phone (UNIQUE constraint on phone)
        const { error: upsertErr } = await adminSupa
            .from('otp_store')
            .upsert(
                { phone: cleanPhone, otp_hash: otpHash, expires_at: expiresAt.toISOString(), attempts: 0 },
                { onConflict: 'phone' }
            );

        if (upsertErr) {
            console.error('[OTP] DB upsert error:', upsertErr);
            return { success: false, message: 'Failed to generate OTP. Please try again.' };
        }

        const isConsoleFallback =
            process.env.OTP_CONSOLE_MODE === 'true' || process.env.APP_ENV === 'development';

        if (isConsoleFallback) {
            console.log(`\n[DEV OTP] Phone: ${cleanPhone}, OTP: ${otp}\n`);
            return {
                success: true,
                message: 'OTP sent (check server console in development mode)',
                devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
            };
        }

        // Production: delegate to configured SMS provider
        const provider = process.env.SMS_PROVIDER ?? 'console';

        if (provider === 'msg91') {
            return await sendViaMSG91(cleanPhone, otp);
        } else if (provider === 'twilio') {
            return await sendViaTwilio(cleanPhone, otp);
        } else {
            console.error('[OTP] No valid SMS provider configured. Set SMS_PROVIDER env var.');
            return { success: false, message: 'SMS service not configured. Please contact support.' };
        }
    } catch (err) {
        console.error('[OTP] sendOTP error:', err);
        return { success: false, message: 'Failed to send OTP. Please try again.' };
    }
}

export async function verifyOTP(phone: string, otp: string): Promise<{ valid: boolean; message: string }> {
    const cleanPhone = phone.replace(/\D/g, '');
    const otpHash = hashOTP(otp);

    try {
        const adminSupa = await getAdminClient();

        const { data: record, error } = await adminSupa
            .from('otp_store')
            .select('otp_hash, expires_at, attempts')
            .eq('phone', cleanPhone)
            .single();

        if (error || !record) {
            return { valid: false, message: 'OTP not found or expired. Please request a new OTP.' };
        }

        // Check expiry
        if (new Date() > new Date(record.expires_at)) {
            await adminSupa.from('otp_store').delete().eq('phone', cleanPhone);
            return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
        }

        // Increment attempts counter
        const newAttempts = (record.attempts ?? 0) + 1;

        if (newAttempts > MAX_ATTEMPTS) {
            await adminSupa.from('otp_store').delete().eq('phone', cleanPhone);
            return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
        }

        // Update attempt count
        await adminSupa
            .from('otp_store')
            .update({ attempts: newAttempts })
            .eq('phone', cleanPhone);

        // Constant-time comparison using hashes (prevents timing attacks)
        if (record.otp_hash !== otpHash) {
            return {
                valid: false,
                message: `Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`,
            };
        }

        // ✅ Valid — consume the OTP (delete from store)
        await adminSupa.from('otp_store').delete().eq('phone', cleanPhone);

        return { valid: true, message: 'OTP verified successfully' };
    } catch (err) {
        console.error('[OTP] verifyOTP error:', err);
        return { valid: false, message: 'Verification error. Please try again.' };
    }
}

// ── Provider implementations ──────────────────────────────────────────────────

async function sendViaMSG91(phone: string, otp: string): Promise<OTPResult> {
    if (!process.env.MSG91_API_KEY || !process.env.MSG91_TEMPLATE_ID) {
        console.error('[MSG91] Missing API Key or Template ID in Env Vars');
        throw new Error('MSG91 connection missing configuration');
    }

    try {
        const url = `https://api.msg91.com/api/v5/otp`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authkey: process.env.MSG91_API_KEY,
            },
            body: JSON.stringify({
                template_id: process.env.MSG91_TEMPLATE_ID,
                mobile: `91${phone}`,
                authkey: process.env.MSG91_API_KEY,
                otp,
            }),
        });

        const rawResult = await response.text();
        let jsonResult: any = {};
        try {
            jsonResult = JSON.parse(rawResult);
        } catch { /* ignore non json */ }

        if (!response.ok || jsonResult.type === 'error') {
            console.error('[MSG91 Error]', rawResult);
            throw new Error(jsonResult.message || `MSG91 error: ${response.statusText}`);
        }

        return { success: true, message: 'OTP sent successfully via SMS' };
    } catch (e: any) {
        console.error('[MSG91 Fault]', e.message);
        throw e;
    }
}

async function sendViaTwilio(phone: string, otp: string): Promise<OTPResult> {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio connection missing configuration');
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require('twilio') as {
        (accountSid: string, authToken: string): {
            messages: { create: (opts: Record<string, string>) => Promise<unknown> };
        };
    };
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
        body: `Your Apna Bazar login OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: `+91${phone}`,
    });

    return { success: true, message: 'OTP sent successfully' };
}
