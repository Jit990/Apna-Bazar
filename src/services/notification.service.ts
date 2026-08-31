import type { NotificationType } from '@/types';

interface NotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Create notification in database.
 * This is decoupled from the actual delivery channel.
 */
export async function createNotification(payload: NotificationPayload): Promise<void> {
    try {
        // Avoid importing server-only modules at module level
        const { createAdminClient } = await import('@/lib/supabase/server');
        const supabase = await createAdminClient();

        await supabase.from('notifications').insert({
            user_id: payload.userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            link: payload.link,
            metadata: payload.metadata ?? {},
        });
    } catch (err) {
        // Notification failures should never break the main flow
        console.error('[Notification] Failed to create notification:', err);
    }
}

/**
 * Create order confirmation notification.
 */
export async function notifyOrderConfirmed(
    userId: string,
    orderNumber: string,
    orderId: string,
    total: number
): Promise<void> {
    await createNotification({
        userId,
        type: 'order_confirmed',
        title: 'Order Confirmed! 🎉',
        message: `Your order #${orderNumber} for ₹${total} has been confirmed.`,
        link: `/account/orders/${orderId}`,
        metadata: { order_number: orderNumber, total },
    });
}

/**
 * Create order status update notification.
 */
export async function notifyOrderStatusUpdate(
    userId: string,
    orderNumber: string,
    orderId: string,
    status: string
): Promise<void> {
    const statusMessages: Record<string, { title: string; message: string }> = {
        confirmed: { title: 'Order Confirmed ✅', message: `Your order #${orderNumber} has been confirmed.` },
        preparing: { title: 'Order Being Prepared 👨‍🍳', message: `Your order #${orderNumber} is being prepared.` },
        ready_for_delivery: { title: 'Ready for Pickup 📦', message: `Your order #${orderNumber} is ready for delivery.` },
        out_for_delivery: { title: 'Out for Delivery 🛵', message: `Hang tight! Your order #${orderNumber} is on its way.` },
        delivered: { title: 'Order Delivered 🎉', message: `Your order #${orderNumber} has been delivered. Enjoy!` },
        cancelled: { title: 'Order Cancelled', message: `Your order #${orderNumber} has been cancelled.` },
        refunded: { title: 'Refund Initiated', message: `A refund for order #${orderNumber} has been initiated.` },
    };

    const info = statusMessages[status];
    if (!info) return;

    await createNotification({
        userId,
        type: 'order_status',
        title: info.title,
        message: info.message,
        link: `/account/orders/${orderId}`,
        metadata: { order_number: orderNumber, status },
    });
}

/**
 * Create payment notification.
 */
export async function notifyPaymentSuccess(
    userId: string,
    orderNumber: string,
    orderId: string,
    amount: number
): Promise<void> {
    await createNotification({
        userId,
        type: 'payment_success',
        title: 'Payment Successful 💰',
        message: `Payment of ₹${amount} received for order #${orderNumber}.`,
        link: `/account/orders/${orderId}`,
        metadata: { order_number: orderNumber, amount },
    });
}
