import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, PaginatedResponse, Product } from '@/types';

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
        const offset = (page - 1) * limit;

        const categoryId = searchParams.get('category_id');
        const subcatId = searchParams.get('subcategory_id');
        const search = searchParams.get('q');
        const brand = searchParams.get('brand');
        const minPrice = searchParams.get('min_price');
        const maxPrice = searchParams.get('max_price');
        const inStock = searchParams.get('in_stock');
        const isFeatured = searchParams.get('featured');
        const isBestseller = searchParams.get('bestseller');
        const isNewArrival = searchParams.get('new');
        const sort = searchParams.get('sort') ?? 'relevance';

        let query = supabase
            .from('products')
            .select(`
        *,
        category:categories!products_category_id_fkey(id, name, slug),
        images:product_images(id, url, alt_text, display_order, is_primary),
        variants:product_variants(id, name, value, price_modifier, stock_quantity, is_active)
      `, { count: 'exact' })
            .eq('is_active', true);

        // Filters
        if (categoryId) query = query.eq('category_id', categoryId);
        if (subcatId) query = query.eq('subcategory_id', subcatId);
        if (brand) query = query.ilike('brand', `%${brand}%`);
        if (minPrice) query = query.gte('price', parseFloat(minPrice));
        if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
        if (inStock === 'true') query = query.neq('stock_status', 'out_of_stock');
        if (isFeatured === 'true') query = query.eq('is_featured', true);
        if (isBestseller === 'true') query = query.eq('is_bestseller', true);
        if (isNewArrival === 'true') query = query.eq('is_new_arrival', true);

        // Full-text search
        if (search) {
            query = query.textSearch(
                'name',
                search.trim().split(' ').join(' & '),
                { type: 'websearch', config: 'english' }
            );
        }

        // Sorting
        switch (sort) {
            case 'price_asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price_desc':
                query = query.order('price', { ascending: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'popular':
                query = query.order('is_bestseller', { ascending: false }).order('created_at', { ascending: false });
                break;
            default: // relevance
                query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        const total = count ?? 0;
        const response: PaginatedResponse<Product> = {
            data: data as unknown as Product[],
            meta: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                has_next: page * limit < total,
                has_prev: page > 1,
            },
        };

        return NextResponse.json<ApiResponse<PaginatedResponse<Product>>>({
            success: true,
            data: response,
        });
    } catch (error) {
        console.error('[GET /api/products]', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
