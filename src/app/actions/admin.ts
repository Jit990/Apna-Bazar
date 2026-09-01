'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ----------------------------------------------------------------------
// Auth Check
// ----------------------------------------------------------------------
export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const { data: profile } = await supabase.from('profiles').select('role, is_active').eq('user_id', user.id).single();
    if (!profile || !['admin', 'manager', 'staff'].includes(profile.role) || !profile.is_active) {
        throw new Error('Forbidden: Admin access required');
    }
    return user;
}

// ----------------------------------------------------------------------
// Storage Upload
// ----------------------------------------------------------------------
export async function uploadImage(formData: FormData, bucketName: string): Promise<string> {
    await requireAdmin();
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided');

    const admin = await createAdminClient();

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await admin.storage
        .from(bucketName)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw new Error(`Failed to upload to ${bucketName}`);
    }

    const { data: publicUrlData } = admin.storage.from(bucketName).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
}

// ----------------------------------------------------------------------
// Categories CRUD
// ----------------------------------------------------------------------

export async function createCategory(data: { name: string; slug: string; description?: string; image_url?: string; is_active: boolean }) {
    await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin.from('categories').insert([data]);
    if (error) {
        if (error.code === '23505') throw new Error('Category slug already exists');
        throw new Error(error.message);
    }

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
    return { success: true };
}

export async function updateCategory(id: string, data: { name: string; slug: string; description?: string; image_url?: string; is_active: boolean }) {
    await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin.from('categories').update(data).eq('id', id);
    if (error) {
        if (error.code === '23505') throw new Error('Category slug already exists');
        throw new Error(error.message);
    }

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
    return { success: true };
}

export async function deleteCategory(id: string) {
    await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
    return { success: true };
}

// ----------------------------------------------------------------------
// Products CRUD
// ----------------------------------------------------------------------

export async function createProduct(data: any, primary_image_url?: string) {
    await requireAdmin();
    const admin = await createAdminClient();

    if (data.stock_quantity <= 0) {
        data.stock_status = 'out_of_stock';
    } else if (data.stock_quantity <= (data.low_stock_threshold || 5)) {
        data.stock_status = 'low_stock';
    } else {
        data.stock_status = 'in_stock';
    }

    const { data: newProduct, error } = await admin.from('products').insert([data]).select('id').single();
    if (error) {
        if (error.code === '23505') throw new Error('Product slug or SKU already exists');
        console.error('Product Error:', error);
        throw new Error(error.message);
    }

    if (primary_image_url && newProduct) {
        await admin.from('product_images').insert([{
            product_id: newProduct.id,
            url: primary_image_url,
            is_primary: true
        }]);
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
}

export async function updateProduct(id: string, data: any, primary_image_url?: string) {
    await requireAdmin();
    const admin = await createAdminClient();

    if (data.stock_quantity <= 0) {
        data.stock_status = 'out_of_stock';
    } else if (data.stock_quantity <= (data.low_stock_threshold || 5)) {
        data.stock_status = 'low_stock';
    } else {
        data.stock_status = 'in_stock';
    }

    const { error } = await admin.from('products').update(data).eq('id', id);
    if (error) {
        if (error.code === '23505') throw new Error('Product slug or SKU already exists');
        throw new Error(error.message);
    }

    if (primary_image_url) {
        const { data: existingImage } = await admin.from('product_images').select('id').eq('product_id', id).eq('is_primary', true).single();
        if (existingImage) {
            await admin.from('product_images').update({ url: primary_image_url }).eq('id', existingImage.id);
        } else {
            await admin.from('product_images').insert([{ product_id: id, url: primary_image_url, is_primary: true }]);
        }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
}

export async function deleteProduct(id: string) {
    await requireAdmin();
    const admin = await createAdminClient();

    const { error } = await admin.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
}
