import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkoutSchema } from '@/lib/validations';
import { calculatePriceSummary, validateCoupon } from '@/services/pricing.service';
import { createRazorpayOrder } from '@/services/payment.service';
import { notifyOrderConfirmed } from '@/services/notification.service';
import type { ApiResponse, CartItem, Coupon } from '@/types';

// POST /api/checkout - Create an order
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupa = await createAdminClient();

        // 1. Authenticate user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        // 2. Parse & validate body
        const body = await request.json();
        const parsed = checkoutSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
                { status: 400 }
            );
        }
        const { address_id, payment_method, coupon_code, delivery_note } = parsed.data;

        // 3. Validate address belongs to user
        const { data: address, error: addrError } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', address_id)
            .eq('user_id', user.id)
            .single();

        if (addrError || !address) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid address' }, { status: 400 });
        }

        // 4. Get cart with products
        const { data: cart } = await supabase
            .from('carts')
            .select(`
        id,
        items:cart_items(
          id, quantity, unit_price, product_id, variant_id,
          product:products(
            id, name, slug, price, mrp, stock_quantity, stock_status, tax_percent,
            images:product_images(url, is_primary)
          ),
          variant:product_variants(id, name, value, price_modifier, stock_quantity)
        )
      `)
            .eq('user_id', user.id)
            .single();

        if (!cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Your cart is empty' }, { status: 400 });
        }

        const cartItems = cart.items as unknown as CartItem[];

        // 5. Validate stock for every item (prevent oversell)
        for (const item of cartItems) {
            const product = item.product;
            if (!product) continue;
            if (product.stock_status === 'out_of_stock') {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: `"${product.name}" is out of stock` },
                    { status: 400 }
                );
            }
            if (item.quantity > product.stock_quantity) {
                return NextResponse.json<ApiResponse>(
                    { success: false, error: `Only ${product.stock_quantity} unit(s) of "${product.name}" available` },
                    { status: 400 }
                );
            }
        }

        // 6. Get store settings (delivery fee, free delivery threshold)
        const { data: settings } = await supabase
            .from('store_settings')
            .select('delivery_charge, free_delivery_threshold, min_order_amount, cod_available, is_store_open, is_delivery_available')
            .single();

        if (!settings?.is_store_open) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Store is currently closed. Please try again later.' }, { status: 400 });
        }
        if (!settings?.is_delivery_available) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Delivery is not available at the moment.' }, { status: 400 });
        }
        if (payment_method === 'cod' && !settings?.cod_available) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Cash on Delivery is not available.' }, { status: 400 });
        }

        // 7. Validate coupon if provided
        let coupon: Coupon | null = null;
        if (coupon_code) {
            const { data: couponData } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', coupon_code.toUpperCase())
                .single();

            const { data: usageData } = await supabase
                .from('coupon_usage')
                .select('id')
                .eq('coupon_id', couponData?.id)
                .eq('user_id', user.id);

            const result = validateCoupon(couponData as Coupon | null, 0, usageData?.length ?? 0);
            if (!result.valid) {
                return NextResponse.json<ApiResponse>({ success: false, error: result.error }, { status: 400 });
            }
            coupon = result.coupon ?? null;
        }

        // 8. SERVER-SIDE price calculation (never trust frontend)
        const priceSummary = calculatePriceSummary(
            cartItems,
            {
                deliveryFee: settings?.delivery_charge ?? 30,
                freeDeliveryThreshold: settings?.free_delivery_threshold ?? 499,
                minOrderAmount: settings?.min_order_amount ?? 0,
            },
            coupon
        );

        if (settings?.min_order_amount && priceSummary.total < settings.min_order_amount) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: `Minimum order amount is ₹${settings.min_order_amount}` },
                { status: 400 }
            );
        }

        // 9. Create Razorpay order (if online payment)
        let razorpayOrderId: string | null = null;
        if (payment_method === 'razorpay') {
            try {
                const rzpOrder = await createRazorpayOrder(
                    priceSummary.total,
                    `order_${Date.now()}`,
                    { user_id: user.id, address_id }
                );
                razorpayOrderId = rzpOrder.id;
            } catch (err) {
                console.error('[Checkout] Razorpay order creation failed:', err);
                return NextResponse.json<ApiResponse>(
                    { success: false, error: 'Payment gateway error. Please try again.' },
                    { status: 500 }
                );
            }
        }

        // 10. Create order + deduct inventory in a transaction
        // Supabase doesn't support multi-table transactions via REST directly,
        // so we use a RPC function or sequential operations with rollback awareness.

        // Create order
        const { data: order, error: orderError } = await adminSupa
            .from('orders')
            .insert({
                user_id: user.id,
                address_snapshot: address,
                status: 'pending',
                payment_method,
                payment_status: payment_method === 'cod' ? 'pending' : 'pending',
                razorpay_order_id: razorpayOrderId,
                subtotal: priceSummary.subtotal,
                discount_amount: priceSummary.discount_amount,
                coupon_id: coupon?.id ?? null,
                coupon_discount: priceSummary.coupon_discount,
                delivery_fee: priceSummary.delivery_fee,
                tax_amount: priceSummary.tax_amount,
                total_amount: priceSummary.total,
                delivery_note: delivery_note ?? null,
            })
            .select('*')
            .single();

        if (orderError || !order) {
            console.error('[Checkout] Order creation error:', orderError);
            return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create order' }, { status: 500 });
        }

        // Create order items
        const orderItems = cartItems.map((item) => {
            const product = item.product!;
            const primaryImage = product.images?.find((i: { is_primary: boolean }) => i.is_primary);
            return {
                order_id: order.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: product.name,
                variant_name: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
                image_url: primaryImage?.url ?? null,
                quantity: item.quantity,
                unit_price: item.unit_price,
                mrp: product.mrp,
                total_price: item.unit_price * item.quantity,
            };
        });

        await adminSupa.from('order_items').insert(orderItems);

        // Deduct inventory atomically via RPC
        for (const item of cartItems) {
            // Atomic decrement using SQL function (prevents race conditions / overselling)
            await adminSupa.rpc('decrement_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
            }).throwOnError();

            // Log inventory movement
            await adminSupa.from('inventory_movements').insert({
                product_id: item.product_id,
                variant_id: item.variant_id,
                type: 'sale',
                quantity_change: -item.quantity,
                quantity_after: 0, // will be updated by trigger
                reference_id: order.id,
                note: `Sale - Order ${order.order_number}`,
            });
        }

        // Record coupon usage
        if (coupon) {
            await adminSupa.from('coupon_usage').insert({
                coupon_id: coupon.id,
                user_id: user.id,
                order_id: order.id,
            });
            await adminSupa.rpc('increment_coupon_usage', { p_coupon_id: coupon.id });
        }

        // Initial status history
        await adminSupa.from('order_status_history').insert({
            order_id: order.id,
            status: 'pending',
            note: 'Order placed',
        });

        // Create payment record
        const { data: payment } = await adminSupa
            .from('payments')
            .insert({
                order_id: order.id,
                razorpay_order_id: razorpayOrderId,
                amount: priceSummary.total,
                currency: 'INR',
                method: payment_method,
                status: 'pending',
            })
            .select('id')
            .single();

        // Link payment to order
        if (payment) {
            await adminSupa.from('orders').update({ payment_id: payment.id }).eq('id', order.id);
        }

        // Clear cart
        await adminSupa.from('cart_items').delete().eq('cart_id', cart.id);

        // Send notification (async, don't block response)
        notifyOrderConfirmed(user.id, order.order_number, order.id, priceSummary.total).catch(console.error);

        // 11. Return response
        if (payment_method === 'cod') {
            // COD - order is immediately confirmed
            await adminSupa.from('orders').update({ status: 'confirmed', payment_status: 'pending' }).eq('id', order.id);
            await adminSupa.from('order_status_history').insert({
                order_id: order.id,
                status: 'confirmed',
                note: 'COD order confirmed',
            });

            return NextResponse.json<ApiResponse>({
                success: true,
                data: { order_id: order.id, order_number: order.order_number, payment_method: 'cod' },
                message: 'Order placed successfully',
            });
        }

        // Razorpay - return payment details for frontend
        return NextResponse.json<ApiResponse>({
            success: true,
            data: {
                order_id: order.id,
                order_number: order.order_number,
                razorpay_order_id: razorpayOrderId,
                razorpay_key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: priceSummary.total,
                currency: 'INR',
                payment_method: 'razorpay',
            },
        });
    } catch (error) {
        console.error('[POST /api/checkout]', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
