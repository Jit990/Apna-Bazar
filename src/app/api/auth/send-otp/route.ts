import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/services/otp.service';
import type { ApiResponse } from '@/types';

// POST /api/auth/send-otp
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Phone number is required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid Indian mobile number' }, { status: 400 });
        }

        const result = await sendOTP(cleanPhone);

        if (!result.success) {
            return NextResponse.json<ApiResponse>({ success: false, error: result.message }, { status: 400 });
        }

        // In development, include OTP in response so we don't need a real SMS service
        return NextResponse.json<ApiResponse>({
            success: true,
            message: result.message,
            // Only include devOtp in development
            data: process.env.NODE_ENV === 'development' ? { devOtp: result.devOtp } : undefined,
        });
    } catch (error) {
        console.error('[POST /api/auth/send-otp]', error);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to send OTP' }, { status: 500 });
    }
}
