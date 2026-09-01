import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <Link href="/admin/products" className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 mb-4 w-fit">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <h1 className="text-2xl font-brand font-bold text-white flex items-center gap-2">
                    <Package size={24} className="text-[#C41E3A]" /> Add New Product
                </h1>
                <p className="text-gray-400 text-sm mt-1">Create a new product in your catalog.</p>
            </div>

            <ProductForm />
        </div>
    );
}
