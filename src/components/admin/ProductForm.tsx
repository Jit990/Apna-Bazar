'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createProduct, updateProduct } from '@/app/actions/admin';
import { toast } from 'sonner';

interface ProductFormProps {
    initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('categories').select('id, name').eq('is_active', true);
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData?.id) {
            const fetchImage = async () => {
                const supabase = createClient();
                const { data } = await supabase.from('product_images').select('url').eq('product_id', initialData.id).eq('is_primary', true).single();
                if (data) setImageUrl(data.url);
            };
            fetchImage();
        }
    }, [initialData]);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        sku: initialData?.sku || '',
        category_id: initialData?.category_id || '',
        price: initialData?.price || '',
        mrp: initialData?.mrp || '',
        cost_price: initialData?.cost_price || '',
        discount_percent: initialData?.discount_percent || '0',
        stock_quantity: initialData?.stock_quantity || '0',
        low_stock_threshold: initialData?.low_stock_threshold || '5',
        description: initialData?.description || '',
        is_active: initialData ? initialData.is_active : true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));

        if (name === 'name' && !initialData) {
            setFormData((prev) => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                sku: `SKU-${value.toUpperCase().replace(/[^A-Z0-9]+/g, '').substring(0, 6)}-${Math.floor(Math.random() * 1000)}`
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = imageUrl;

            if (imageFile) {
                const { uploadImage } = await import('@/app/actions/admin');
                const adminFormData = new FormData();
                adminFormData.append('file', imageFile);
                finalImageUrl = await uploadImage(adminFormData, 'product-images');
            }

            const payload = {
                name: formData.name,
                slug: formData.slug,
                sku: formData.sku,
                category_id: formData.category_id,
                price: parseFloat(formData.price as string),
                mrp: parseFloat(formData.mrp as string),
                cost_price: formData.cost_price ? parseFloat(formData.cost_price as string) : undefined,
                discount_percent: parseFloat(formData.discount_percent as string) || 0,
                stock_quantity: parseInt(formData.stock_quantity as string, 10),
                low_stock_threshold: parseInt(formData.low_stock_threshold as string, 10),
                description: formData.description || undefined,
                is_active: formData.is_active,
            };

            if (initialData) {
                await updateProduct(initialData.id, payload, finalImageUrl);
                toast.success('Product updated successfully');
            } else {
                await createProduct(payload, finalImageUrl);
                toast.success('Product created successfully');
            }

            router.push('/admin/products');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Basic Info</h2>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Product Name *</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Slug *</label>
                            <input required name="slug" value={formData.slug} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">SKU *</label>
                            <input required name="sku" value={formData.sku} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full text-sm font-mono uppercase" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Category *</label>
                        <select required name="category_id" value={formData.category_id} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full">
                            <option value="">Select Category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Product Image</label>
                        {imageUrl && !imageFile && (
                            <div className="mb-2">
                                <img src={imageUrl} alt="Current" className="h-16 w-16 object-cover rounded-lg border border-gray-700" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full h-24 py-3" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Pricing & Inventory</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Selling Price (₹) *</label>
                            <input required type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">MRP (₹) *</label>
                            <input required type="number" step="0.01" min="0" name="mrp" value={formData.mrp} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Cost Price (₹)</label>
                            <input type="number" step="0.01" min="0" name="cost_price" value={formData.cost_price} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Discount %</label>
                            <input required type="number" step="0.01" min="0" max="100" name="discount_percent" value={formData.discount_percent} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Stock Quantity *</label>
                            <input required type="number" min="0" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Low Stock Alert *</label>
                            <input required type="number" min="0" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleChange} className="input bg-gray-800 border-gray-700 text-white w-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active as boolean}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#C41E3A]"
                        />
                        <label htmlFor="is_active" className="text-sm font-semibold text-gray-300">
                            Product is Active (Visible to customers)
                        </label>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-800">
                <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2">
                    {loading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                    {initialData ? 'Save Changes' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
