import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

// GET /api/store-settings — public store settings
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('store_settings')
            .select('is_store_open, is_delivery_available, delivery_charge, free_delivery_threshold, min_order_amount, cod_available, store_name, store_phone, store_email, store_address')
            .single();

        if (error) {
            // If store_settings table doesn't exist or no row, return defaults
            return NextResponse.json<ApiResponse>({
                success: true,
                data: {
                    is_store_open: true,
                    is_delivery_available: true,
                    delivery_charge: 30,
                    free_delivery_threshold: 499,
                    min_order_amount: 0,
                    cod_available: true,
                    store_name: 'Apna Bazar',
                    store_phone: '',
                    store_email: '',
                    store_address: 'Bajkul, West Bengal',
                },
            });
        }

        return NextResponse.json<ApiResponse>({ success: true, data });
    } catch (err) {
        console.error('[GET /api/store-settings]', err);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to load store settings' }, { status: 500 });
    }
}
