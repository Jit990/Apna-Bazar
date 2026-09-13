import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

const KEY_SECRET = 'test_razorpay_key_secret';
const WEBHOOK_SECRET = 'test_razorpay_webhook_secret';

describe('Razorpay signature verification', () => {
    beforeEach(() => {
        process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
        process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
    });

    afterEach(() => {
        delete process.env.RAZORPAY_KEY_SECRET;
        delete process.env.RAZORPAY_WEBHOOK_SECRET;
    });

    it('accepts a valid payment signature', async () => {
        const { verifyPaymentSignature } = await import('@/services/payment.service');
        const razorpay_order_id = 'order_ABC123';
        const razorpay_payment_id = 'pay_XYZ789';
        const razorpay_signature = crypto
            .createHmac('sha256', KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        expect(verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        })).toBe(true);
    });

    it('rejects a tampered payment signature', async () => {
        const { verifyPaymentSignature } = await import('@/services/payment.service');
        expect(verifyPaymentSignature({
            razorpay_order_id: 'order_ABC123',
            razorpay_payment_id: 'pay_XYZ789',
            razorpay_signature: '0'.repeat(64),
        })).toBe(false);
    });

    it('rejects a non-hex payment signature', async () => {
        const { verifyPaymentSignature } = await import('@/services/payment.service');
        expect(verifyPaymentSignature({
            razorpay_order_id: 'order_ABC123',
            razorpay_payment_id: 'pay_XYZ789',
            razorpay_signature: 'not-a-signature',
        })).toBe(false);
    });

    it('accepts a valid webhook signature', async () => {
        const { verifyWebhookSignature } = await import('@/services/payment.service');
        const rawBody = JSON.stringify({ event: 'payment.captured' });
        const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
        expect(verifyWebhookSignature(rawBody, signature)).toBe(true);
    });

    it('rejects an invalid webhook signature', async () => {
        const { verifyWebhookSignature } = await import('@/services/payment.service');
        const rawBody = JSON.stringify({ event: 'payment.captured' });
        expect(verifyWebhookSignature(rawBody, 'f'.repeat(64))).toBe(false);
    });
});
