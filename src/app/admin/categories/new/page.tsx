import { Folders, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/categories" className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 mb-4 w-fit">
                    <ArrowLeft size={16} /> Back to Categories
                </Link>
                <h1 className="text-2xl font-brand font-bold text-white flex items-center gap-2">
                    <Folders size={24} className="text-[#C41E3A]" /> Add New Category
                </h1>
                <p className="text-gray-400 text-sm mt-1">Create a new product category for your store.</p>
            </div>

            <CategoryForm />
        </div>
    );
}
