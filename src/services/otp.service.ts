/**
 * OTP Service - Abstracted so SMS provider can be swapped easily.
 * In development (OTP_CONSOLE_MODE=true), OTPs are printed to console.
 * NEVER use console mode in production.
 */

export interface OTPResult {
    success: boolean;
    message: string;
    // Dev only - never expose in production
    devOtp?: string;
}

// In-memory OTP store for development mode
// Production: Use Redis or a database table
const otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(phone: string): Promise<OTPResult> {
    const cleanPhone = phone.replace(/\D/g, '');

    // Rate limiting: don't allow resend within 60 seconds
    const existing = otpStore.get(cleanPhone);
    if (existing) {
        const timeSinceCreation = Date.now() - (existing.expiresAt.getTime() - OTP_EXPIRY_MINUTES * 60 * 1000);
        if (timeSinceCreation < 60 * 1000) {
            return { success: false, message: 'Please wait 60 seconds before requesting another OTP' };
        }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    otpStore.set(cleanPhone, { otp, expiresAt, attempts: 0 });

    const isConsoleFallback = process.env.OTP_CONSOLE_MODE === 'true' || process.env.APP_ENV === 'development';

    if (isConsoleFallback) {
        // Development mode
        console.log(`\n[DEV OTP] Phone: ${cleanPhone}, OTP: ${otp}\n`);
        return {
            success: true,
            message: 'OTP sent (check server console in development mode)',
            devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
        };
    }

    // Production: delegate to configured provider
    const provider = process.env.SMS_PROVIDER ?? 'console';

    try {
        if (provider === 'msg91') {
            return await sendViaMSG91(cleanPhone, otp);
        } else if (provider === 'twilio') {
            return await sendViaTwilio(cleanPhone, otp);
        } else {
            console.error('[OTP] No valid SMS provider configured');
            return { success: false, message: 'SMS service not configured' };
        }
    } catch (err) {
        console.error('[OTP] Failed to send OTP:', err);
        return { success: false, message: 'Failed to send OTP. Please try again.' };
    }
}

export function verifyOTP(phone: string, otp: string): { valid: boolean; message: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    const record = otpStore.get(cleanPhone);

    if (!record) {
        return { valid: false, message: 'OTP not found or expired. Please request a new OTP.' };
    }

    if (new Date() > record.expiresAt) {
        otpStore.delete(cleanPhone);
        return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    record.attempts++;
    if (record.attempts > MAX_ATTEMPTS) {
        otpStore.delete(cleanPhone);
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (record.otp !== otp) {
        return { valid: false, message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` };
    }

    // Valid - consume the OTP
    otpStore.delete(cleanPhone);
    return { valid: true, message: 'OTP verified successfully' };
}

// ---- Provider implementations ----

async function sendViaMSG91(phone: string, otp: string): Promise<OTPResult> {
    const url = `https://api.msg91.com/api/v5/otp`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_API_KEY! },
        body: JSON.stringify({
            template_id: process.env.MSG91_TEMPLATE_ID,
            mobile: `91${phone}`,
            authkey: process.env.MSG91_API_KEY,
            otp,
        }),
    });

    if (!response.ok) {
        throw new Error(`MSG91 error: ${response.statusText}`);
    }

    return { success: true, message: 'OTP sent successfully' };
}

async function sendViaTwilio(phone: string, otp: string): Promise<OTPResult> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require('twilio') as { (accountSid: string, authToken: string): { messages: { create: (opts: Record<string, string>) => Promise<unknown> } } };
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
    );

    await client.messages.create({
        body: `Your Apna Bazar OTP is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: `+91${phone}`,
    });

    return { success: true, message: 'OTP sent successfully' };
}
