import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/products" className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 mb-4 w-fit">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <h1 className="text-2xl font-brand font-bold text-white flex items-center gap-2">
                    <Package size={24} className="text-[#C41E3A]" /> Edit Product
                </h1>
                <p className="text-gray-400 text-sm mt-1">Modify product details, pricing, and stock.</p>
            </div>

            <ProductForm initialData={product} />
        </div>
    );
}
