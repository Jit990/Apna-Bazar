import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/product/CategoryCard';

export const metadata: Metadata = { title: 'All Categories' };

const CATEGORIES = [
    { id: '1', name: 'Makeup', slug: 'makeup', image_url: null, is_active: true, parent_id: null, display_order: 1, description: 'Lipstick, Foundation, Mascara & more', created_at: '', updated_at: '' },
    { id: '2', name: 'Skin Care', slug: 'skin-care', image_url: null, is_active: true, parent_id: null, display_order: 2, description: 'Face wash, Moisturizer, Sunscreen', created_at: '', updated_at: '' },
    { id: '3', name: 'Hair Care', slug: 'hair-care', image_url: null, is_active: true, parent_id: null, display_order: 3, description: 'Shampoo, Conditioner, Hair Oil', created_at: '', updated_at: '' },
    { id: '4', name: 'Perfumes', slug: 'perfumes', image_url: null, is_active: true, parent_id: null, display_order: 4, description: 'Fragrances, Deodorants, Body Mist', created_at: '', updated_at: '' },
    { id: '5', name: 'Jewelry', slug: 'jewelry', image_url: null, is_active: true, parent_id: null, display_order: 5, description: 'Necklaces, Pendants, Traditional Sets', created_at: '', updated_at: '' },
    { id: '6', name: 'Bangles', slug: 'bangles', image_url: null, is_active: true, parent_id: null, display_order: 6, description: 'Glass, Metal, Stone Bangles', created_at: '', updated_at: '' },
    { id: '7', name: 'Earrings', slug: 'earrings', image_url: null, is_active: true, parent_id: null, display_order: 7, description: 'Studs, Drops, Jhumkas', created_at: '', updated_at: '' },
    { id: '8', name: 'Rings', slug: 'rings', image_url: null, is_active: true, parent_id: null, display_order: 8, description: 'Fashion Rings, Bands', created_at: '', updated_at: '' },
    { id: '9', name: 'Gift Items', slug: 'gift-items', image_url: null, is_active: true, parent_id: null, display_order: 9, description: 'Perfect gifts for every occasion', created_at: '', updated_at: '' },
    { id: '10', name: 'Teddy & Toys', slug: 'teddy-toys', image_url: null, is_active: true, parent_id: null, display_order: 10, description: 'Soft toys, Building blocks', created_at: '', updated_at: '' },
    { id: '11', name: 'Stationery', slug: 'stationery', image_url: null, is_active: true, parent_id: null, display_order: 11, description: 'Pens, Notebooks, Craft supplies', created_at: '', updated_at: '' },
    { id: '12', name: 'Birthday Gifts', slug: 'birthday-gifts', image_url: null, is_active: true, parent_id: null, display_order: 12, description: 'Cakes, Candles, Party supplies', created_at: '', updated_at: '' },
    { id: '13', name: 'Personal Care', slug: 'personal-care', image_url: null, is_active: true, parent_id: null, display_order: 13, description: 'Soap, Body wash, Oral care', created_at: '', updated_at: '' },
    { id: '14', name: 'Food & Grocery', slug: 'food-grocery', image_url: null, is_active: true, parent_id: null, display_order: 14, description: 'Snacks, Beverages, Essentials', created_at: '', updated_at: '' },
];

export default function CategoriesPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="px-4 py-4">
                <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <Link href="/" className="hover:text-[#C41E3A]">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900 font-medium">Categories</span>
                </nav>
                <h1 className="text-xl font-brand font-bold text-gray-900 mb-4">All Categories</h1>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {CATEGORIES.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} />
                    ))}
                </div>
            </div>
        </div>
    );
}
