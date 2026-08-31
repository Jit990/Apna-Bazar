import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/services/payment.service';
import { notifyOrderStatusUpdate, notifyPaymentSuccess } from '@/services/notification.service';

// POST /api/payments/webhook - Razorpay Webhook Handler
export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return new NextResponse('Missing signature', { status: 400 });
        }

        // 1. Verify webhook signature
        const isValid = verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            console.error('[Webhook] Invalid signature');
            return new NextResponse('Invalid signature', { status: 400 });
        }

        const event = JSON.parse(rawBody);
        const { event: eventName, payload } = event;

        const adminSupa = await createAdminClient();

        console.log(`[Webhook] Received event: ${eventName}`);

        switch (eventName) {
            case 'payment.captured': {
                const rzpPayment = payload.payment?.entity;
                if (!rzpPayment) break;

                const razorpayOrderId = rzpPayment.order_id;
                const razorpayPaymentId = rzpPayment.id;

                // Find order by Razorpay order ID
                const { data: order } = await adminSupa
                    .from('orders')
                    .select('id, order_number, user_id, total_amount, payment_status')
                    .eq('razorpay_order_id', razorpayOrderId)
                    .single() as { data: { id: string; order_number: string; user_id: string; total_amount: number; payment_status: string } | null; error: unknown };

                if (!order) {
                    console.error('[Webhook] Order not found for razorpay_order_id:', razorpayOrderId);
                    break;
                }

                // Prevent duplicate processing
                if (order.payment_status === 'paid') {
                    console.log('[Webhook] Payment already processed for order:', order.id);
                    break;
                }

                // Update order
                await adminSupa.from('orders').update({
                    status: 'confirmed',
                    payment_status: 'paid',
                }).eq('id', order.id);

                await adminSupa.from('payments').update({
                    status: 'paid',
                    razorpay_payment_id: razorpayPaymentId,
                    gateway_response: rzpPayment,
                }).eq('order_id', order.id);

                await adminSupa.from('order_status_history').insert({
                    order_id: order.id,
                    status: 'confirmed',
                    note: 'Payment captured via webhook',
                });

                notifyPaymentSuccess(order.user_id, order.order_number, order.id, order.total_amount).catch(console.error);
                break;
            }

            case 'payment.failed': {
                const rzpPayment = payload.payment?.entity;
                if (!rzpPayment) break;

                const { data: order } = await adminSupa
                    .from('orders')
                    .select('id, user_id, order_number')
                    .eq('razorpay_order_id', rzpPayment.order_id)
                    .single();

                if (!order) break;

                await adminSupa.from('orders').update({
                    status: 'payment_failed',
                    payment_status: 'failed',
                }).eq('id', order.id);

                await adminSupa.from('order_status_history').insert({
                    order_id: order.id,
                    status: 'payment_failed',
                    note: `Payment failed: ${rzpPayment.error_description ?? 'Unknown error'}`,
                });
                break;
            }

            case 'refund.processed': {
                const rzpRefund = payload.refund?.entity;
                if (!rzpRefund) break;

                await adminSupa
                    .from('refunds')
                    .update({ status: 'completed', razorpay_refund_id: rzpRefund.id })
                    .eq('razorpay_refund_id', rzpRefund.id);

                // Find order and notify
                const { data: payment } = await adminSupa
                    .from('payments')
                    .select('order_id, order:orders(id, user_id, order_number)')
                    .eq('razorpay_payment_id', rzpRefund.payment_id)
                    .single();

                if (payment?.order) {
                    const order = (payment.order as unknown) as { id: string; user_id: string; order_number: string };
                    notifyOrderStatusUpdate(order.user_id, order.order_number, order.id, 'refunded').catch(console.error);
                }
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event: ${eventName}`);
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('[POST /api/payments/webhook]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
