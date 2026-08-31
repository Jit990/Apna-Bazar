import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { verifyOTP } from '@/services/otp.service';

// POST /api/auth/verify-otp
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, otp } = body;

        if (!phone || !otp) {
            return NextResponse.json({ success: false, error: 'Phone and OTP are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');

        // 1. Verify OTP using custom service
        const verification = await verifyOTP(cleanPhone, otp);
        if (!verification.valid) {
            return NextResponse.json({ success: false, error: verification.message }, { status: 400 });
        }

        // 2. Authenticate with Supabase using dummy password strategy
        const supabase = await createClient(); // assuming await is needed inside createClient
        const dummyPassword = `ApnaBazar#${cleanPhone}`;

        const { error: authError } = await supabase.auth.signInWithPassword({
            phone: `+91${cleanPhone}`,
            password: dummyPassword
        });

        // 3. If login fails, user might not exist, create them natively
        if (authError) {
            const adminClient = await createAdminClient();

            const { error: createError } = await adminClient.auth.admin.createUser({
                phone: `+91${cleanPhone}`,
                password: dummyPassword,
                phone_confirm: true
            });

            if (createError) {
                console.error('Failed to create user:', createError);
                return NextResponse.json({ success: false, error: 'Failed to create user account' }, { status: 500 });
            }

            // Now sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                phone: `+91${cleanPhone}`,
                password: dummyPassword
            });

            if (signInError) {
                return NextResponse.json({ success: false, error: 'Account created but failed to sign in' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, message: 'Verified successfully' });

    } catch (err) {
        console.error('[POST /api/auth/verify-otp]', err);
        return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
    }
}
