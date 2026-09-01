import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
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

        // 2. Use admin client to find or create the user
        const adminClient = await createAdminClient();

        // Secure deterministic password generation (prevents brute forcing Supabase directly)
        const crypto = await import('crypto');
        const secret = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret-50212391';
        const securePassword = crypto.createHmac('sha256', secret).update(cleanPhone).digest('hex').slice(0, 32);

        const phoneWithCountry = `+91${cleanPhone}`;

        // Try to find existing user by phone
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
            (u) => u.phone === phoneWithCountry || u.phone === cleanPhone
        );

        let userId: string;

        if (existingUser) {
            userId = existingUser.id;
            // Update password in case it was changed
            await adminClient.auth.admin.updateUserById(userId, {
                password: securePassword,
                phone_confirm: true,
            });
        } else {
            // Create new user
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
                phone: phoneWithCountry,
                password: securePassword,
                phone_confirm: true,
                user_metadata: {
                    phone: cleanPhone,
                    full_name: '',
                },
            });

            if (createError || !newUser?.user) {
                console.error('Failed to create user:', createError);
                return NextResponse.json({ success: false, error: 'Failed to create user account' }, { status: 500 });
            }

            userId = newUser.user.id;

            // Create profile row for new user
            const { error: profileError } = await adminClient
                .from('profiles')
                .upsert({
                    user_id: userId,
                    phone: cleanPhone,
                    role: 'customer',
                    is_active: true,
                    full_name: '',
                }, { onConflict: 'user_id' });

            if (profileError) {
                console.error('Failed to create profile:', profileError);
                // Non-fatal — continue with login
            }
        }

        // 3. Ensure profile exists for existing users too
        const { data: existingProfile } = await adminClient
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!existingProfile) {
            await adminClient.from('profiles').upsert({
                user_id: userId,
                phone: cleanPhone,
                role: 'customer',
                is_active: true,
                full_name: '',
            }, { onConflict: 'user_id' });
        }

        // 4. Sign in using the Supabase server client that writes cookies to the response
        let response = NextResponse.json({ success: true, message: 'Verified successfully' });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        // Set on the request for downstream reads
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        // Set on the response so the browser gets them
                        response = NextResponse.json({ success: true, message: 'Verified successfully' });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { error: signInError } = await supabase.auth.signInWithPassword({
            phone: phoneWithCountry,
            password: securePassword,
        });

        if (signInError) {
            console.error('Sign in error after verification:', signInError);
            return NextResponse.json({ success: false, error: 'Account verified but failed to sign in. Please try again.' }, { status: 500 });
        }

        return response;

    } catch (err) {
        console.error('[POST /api/auth/verify-otp]', err);
        return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
    }
}
