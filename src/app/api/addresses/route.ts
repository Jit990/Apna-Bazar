import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';
import { z } from 'zod';

const addressSchema = z.object({
    full_name: z.string().min(2, 'Full name is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
    house_flat: z.string().min(1, 'House/Flat number is required'),
    street_locality: z.string().min(2, 'Street/Locality is required'),
    landmark: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required').default('West Bengal'),
    pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit PIN code required'),
    delivery_instructions: z.string().optional(),
    is_default: z.boolean().optional().default(false),
});

// GET /api/addresses — list user's addresses
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json<ApiResponse>({ success: true, data: data ?? [] });
    } catch (err) {
        console.error('[GET /api/addresses]', err);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to load addresses' }, { status: 500 });
    }
}

// POST /api/addresses — create new address
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupa = await createAdminClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = addressSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
                { status: 400 }
            );
        }

        const { is_default, ...rest } = parsed.data;

        // If setting as default, unset other defaults first
        if (is_default) {
            await adminSupa.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        }

        const { data, error } = await adminSupa
            .from('addresses')
            .insert({ ...rest, user_id: user.id, is_default: is_default ?? false })
            .select('*')
            .single();

        if (error) throw error;

        return NextResponse.json<ApiResponse>({ success: true, data }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/addresses]', err);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create address' }, { status: 500 });
    }
}

// PUT /api/addresses — update address
export async function PUT(req: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupa = await createAdminClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...rest } = body;
        if (!id) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Address ID required' }, { status: 400 });
        }

        const parsed = addressSchema.partial().safeParse(rest);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
                { status: 400 }
            );
        }

        // Verify ownership
        const { data: existing } = await supabase
            .from('addresses')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Address not found' }, { status: 404 });
        }

        if (parsed.data.is_default) {
            await adminSupa.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        }

        const { data, error } = await adminSupa
            .from('addresses')
            .update(parsed.data)
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;

        return NextResponse.json<ApiResponse>({ success: true, data });
    } catch (err) {
        console.error('[PUT /api/addresses]', err);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to update address' }, { status: 500 });
    }
}

// DELETE /api/addresses?id=xxx — delete address
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const adminSupa = await createAdminClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Address ID required' }, { status: 400 });
        }

        // Verify ownership before deleting
        const { data: existing } = await supabase
            .from('addresses')
            .select('id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            return NextResponse.json<ApiResponse>({ success: false, error: 'Address not found' }, { status: 404 });
        }

        const { error } = await adminSupa.from('addresses').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json<ApiResponse>({ success: true, message: 'Address deleted' });
    } catch (err) {
        console.error('[DELETE /api/addresses]', err);
        return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to delete address' }, { status: 500 });
    }
}
