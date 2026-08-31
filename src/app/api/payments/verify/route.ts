import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { paymentVerificationSchema } from '@/lib/validations';
import { verifyPaymentSignature } from '@/services/payment.service';
import { notifyPaymentSuccess } from '@/services/notification.service';
import type { ApiResponse } from '@/types';

// POST /api/payments/verify - Verify Razorpay payment signature
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupa = await createAdminClient();

        // 1. Authenticate
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        // 2. Validate input
        const body = await request.json();
        const parsed = paymentVerificationSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Invalid payment data' },
                { status: 400 }
            );
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = parsed.data;

        // 3. Verify the order belongs to this user
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, order_number, user_id, total_amount, status, payment_status, razorpay_order_id')
            .eq('id', order_id)
            .eq('user_id', user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // 4. Prevent duplicate verification
        if (order.payment_status === 'paid') {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { order_id: order.id, order_number: order.order_number },
                message: 'Payment already verified',
            });
        }

        // 5. Verify Razorpay order ID matches (prevents IDOR)
        if (order.razorpay_order_id !== razorpay_order_id) {
            console.error('[PaymentVerify] Order ID mismatch for order:', order_id);
            return NextResponse.json<ApiResponse>({ success: false, error: 'Payment verification failed' }, { status: 400 });
        }

        // 6. Cryptographic signature verification (server-side, timing-safe)
        const isValid = verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValid) {
            console.error('[PaymentVerify] Invalid signature for order:', order_id);

            // Mark payment as failed
            await adminSupa.from('orders').update({
                status: 'payment_failed',
                payment_status: 'failed',
            }).eq('id', order_id);

            await adminSupa.from('payments').update({
                status: 'failed',
                razorpay_payment_id,
                razorpay_signature,
                updated_at: new Date().toISOString(),
            }).eq('order_id', order_id);

            await adminSupa.from('order_status_history').insert({
                order_id,
                status: 'payment_failed',
                note: 'Payment signature verification failed',
            });

            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Payment verification failed. Please contact support.' },
                { status: 400 }
            );
        }

        // 7. Payment verified — update records
        await adminSupa.from('orders').update({
            status: 'confirmed',
            payment_status: 'paid',
        }).eq('id', order_id);

        await adminSupa.from('payments').update({
            status: 'paid',
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            gateway_response: { razorpay_payment_id, razorpay_order_id, razorpay_signature },
            updated_at: new Date().toISOString(),
        }).eq('order_id', order_id);

        await adminSupa.from('order_status_history').insert({
            order_id,
            status: 'confirmed',
            note: 'Payment verified successfully',
        });

        // 8. Send notifications (non-blocking)
        Promise.all([
            notifyPaymentSuccess(user.id, order.order_number, order.id, order.total_amount),
        ]).catch(console.error);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { order_id: order.id, order_number: order.order_number },
            message: 'Payment verified successfully',
        });
    } catch (error) {
        console.error('[POST /api/payments/verify]', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Payment verification error' },
            { status: 500 }
        );
    }
}
