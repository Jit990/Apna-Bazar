import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export interface RazorpayOrderData {
    id: string;
    amount: number; // in paise
    currency: string;
    receipt: string;
}

/**
 * Create a Razorpay order server-side.
 * Amount is in INR (rupees), converted to paise internally.
 */
export async function createRazorpayOrder(
    amountInRupees: number,
    receipt: string,
    notes?: Record<string, string>
): Promise<RazorpayOrderData> {
    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
        amount: Math.round(amountInRupees * 100), // convert to paise
        currency: 'INR',
        receipt,
        notes: notes ?? {},
    });

    return {
        id: order.id,
        amount: order.amount as number,
        currency: order.currency,
        receipt: order.receipt ?? receipt,
    };
}

/**
 * Verify Razorpay payment signature.
 * MUST be called server-side before marking payment as successful.
 */
export function verifyPaymentSignature(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): boolean {
    const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(params.razorpay_signature, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Verify Razorpay webhook signature.
 */
export function verifyWebhookSignature(
    rawBody: string,
    signature: string
): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(signature, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Initiate refund via Razorpay.
 */
export async function initiateRefund(
    paymentId: string,
    amountInRupees: number,
    notes?: Record<string, string>
): Promise<{ id: string; status: string }> {
    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    const refund = await instance.payments.refund(paymentId, {
        amount: Math.round(amountInRupees * 100),
        notes: notes ?? {},
    });

    return {
        id: refund.id,
        status: refund.status,
    };
}
