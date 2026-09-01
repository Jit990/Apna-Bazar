'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage, createCategory, updateCategory } from '@/app/actions/admin';
import { toast } from 'sonner';

interface CategoryFormProps {
    initialData?: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image_url: string | null;
        is_active: boolean;
    };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(initialData?.name || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [isActive, setIsActive] = useState(initialData ? initialData.is_active : true);

    const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!initialData) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = imageUrl;

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                finalImageUrl = await uploadImage(formData, 'categories');
            }

            const payload = {
                name,
                slug,
                description: description || undefined,
                image_url: finalImageUrl || undefined,
                is_active: isActive
            };

            if (initialData) {
                await updateCategory(initialData.id, payload);
                toast.success('Category updated successfully');
            } else {
                await createCategory(payload);
                toast.success('Category created successfully');
            }

            router.push('/admin/categories');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 max-w-2xl shadow-xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Category Name *</label>
                    <input
                        required
                        value={name}
                        onChange={handleNameChange}
                        className="input bg-gray-800 border-gray-700 text-white w-full focus:ring-[#C41E3A]"
                        placeholder="e.g. Fresh Vegetables"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Slug (URL friendly) *</label>
                    <input
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="input bg-gray-800 border-gray-700 text-white w-full focus:ring-[#C41E3A]"
                        placeholder="fresh-vegetables"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input bg-gray-800 border-gray-700 text-white w-full h-24 py-3 focus:ring-[#C41E3A]"
                        placeholder="Short description for SEO..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Category Image</label>
                    {imageUrl && !imageFile && (
                        <div className="mb-2">
                            <img src={imageUrl} alt="Current" className="h-20 w-20 object-cover rounded-lg border border-gray-700" />
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C41E3A]/10 file:text-[#C41E3A] hover:file:bg-[#C41E3A]/20"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#C41E3A] focus:ring-[#C41E3A] focus:ring-offset-gray-900"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-300">
                        Category is Active (Visible to customers)
                    </label>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-xl text-gray-400 font-semibold hover:bg-gray-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                    {initialData ? 'Save Changes' : 'Create Category'}
                </button>
            </div>
        </form>
    );
}
