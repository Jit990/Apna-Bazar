import { Folders, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (!category) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/categories" className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 mb-4 w-fit">
                    <ArrowLeft size={16} /> Back to Categories
                </Link>
                <h1 className="text-2xl font-brand font-bold text-white flex items-center gap-2">
                    <Folders size={24} className="text-[#C41E3A]" /> Edit Category
                </h1>
                <p className="text-gray-400 text-sm mt-1">Modify category details and settings.</p>
            </div>

            <CategoryForm initialData={category} />
        </div>
    );
}
