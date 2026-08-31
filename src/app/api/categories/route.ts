import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

// GET /api/categories - List all active categories
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        // const includeSubcategories = searchParams.get('include_subs') === 'true';
        const parentId = searchParams.get('parent_id');

        let query = supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (parentId === 'null') {
            query = query.is('parent_id', null);
        } else if (parentId) {
            query = query.eq('parent_id', parentId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json<ApiResponse>({ success: true, data });
    } catch (error) {
        console.error('[GET /api/categories]', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
