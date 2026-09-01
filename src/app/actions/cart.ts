'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get current user's cart
export async function getDbCart() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // Guest user
    }

    let { data: cart } = await supabase.from('carts').select('*').eq('user_id', user.id).single();

    if (!cart) {
        // Create cart if not exists
        const { data: newCart, error } = await supabase.from('carts').insert([{ user_id: user.id }]).select().single();
        if (error) {
            console.error('Error creating cart:', error);
            return null;
        }
        cart = newCart;
    }

    const { data: items } = await supabase
        .from('cart_items')
        .select(`
            id, quantity, unit_price, product_id,
            product:products(id, name, slug, price, mrp, stock_quantity, stock_status, metadata, product_images(url))
        `)
        .eq('cart_id', cart.id);

    return items || [];
}

// Sync local items to DB
export async function syncLocalToDbCart(localItems: any[]) {
    if (!localItems || localItems.length === 0) return { success: true };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not logged in' };

    // Get or create cart
    let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
    if (!cart) {
        const { data: newCart, error } = await supabase.from('carts').insert([{ user_id: user.id }]).select('id').single();
        if (error) throw new Error('Could not create cart');
        cart = newCart;
    }

    // Efficiently fetch validated prices for all incoming products at once to prevent SQL N+1
    const productIds = localItems.map(item => item.product_id);
    const { data: validProducts } = await supabase.from('products').select('id, price').in('id', productIds);
    const priceMap = new Map(validProducts?.map(p => [p.id, p.price]) || []);

    // Process each item (upsert based on UNIQUE (cart_id, product_id, variant_id))
    for (const item of localItems) {
        const validatedPrice = priceMap.get(item.product_id);
        if (validatedPrice === undefined) continue; // Skip invalid products that don't exist in DB

        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('product_id', item.product_id)
            .single();

        if (existingItem) {
            // Update quantity & synchronize to latest pricing
            await supabase
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + item.quantity,
                    unit_price: validatedPrice
                })
                .eq('id', existingItem.id);
        } else {
            // Insert new synchronized item
            await supabase.from('cart_items').insert([{
                cart_id: cart.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: validatedPrice,
            }]);
        }
    }

    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true };
}

// Add/Update single item
export async function updateDbCartItem(productId: string, quantity: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
    if (!cart) {
        const { data: newCart } = await supabase.from('carts').insert([{ user_id: user.id }]).select('id').single();
        cart = newCart;
    }

    if (!cart) return { success: false };

    if (quantity <= 0) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', productId);
    } else {
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .single();

        if (existingItem) {
            await supabase.from('cart_items').update({ quantity }).eq('id', existingItem.id);
        } else {
            // need price
            const { data: product } = await supabase.from('products').select('price').eq('id', productId).single();
            if (product) {
                await supabase.from('cart_items').insert([{
                    cart_id: cart.id,
                    product_id: productId,
                    quantity,
                    unit_price: product.price
                }]);
            }
        }
    }

    revalidatePath('/cart');
    revalidatePath('/checkout');
    return { success: true };
}

export async function clearDbCart() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
    if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    }
    revalidatePath('/cart');
    revalidatePath('/checkout');
}
