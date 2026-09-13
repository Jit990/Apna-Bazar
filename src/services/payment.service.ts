import crypto from 'crypto';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not configured`);
    }
    return value;
}

export interface RazorpayOrderData {
    id: string;
    amount: number; // in paise
    currency: string;
    receipt: string;
}

function timingSafeHexEqual(expectedHex: string, provided: string): boolean {
    try {
        const expected = Buffer.from(expectedHex, 'hex');
        const actual = Buffer.from(provided, 'hex');
        if (expected.length === 0 || expected.length !== actual.length) {
            return false;
        }
        return crypto.timingSafeEqual(expected, actual);
    } catch {
        return false;
    }
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
        key_id: requireEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID'),
        key_secret: requireEnv('RAZORPAY_KEY_SECRET'),
    });

    const order = await instance.orders.create({
        amount: Math.round(amountInRupees * 100),
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
    const secret = requireEnv('RAZORPAY_KEY_SECRET');
    const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return timingSafeHexEqual(expectedSignature, params.razorpay_signature);
}

/**
 * Verify Razorpay webhook signature.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = requireEnv('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return timingSafeHexEqual(expectedSignature, signature);
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
        key_id: requireEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID'),
        key_secret: requireEnv('RAZORPAY_KEY_SECRET'),
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
