'use client';

import { Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteCategory } from '@/app/actions/admin';

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you absolutely sure you want to delete the category "${name}"?\nAll associated products might lose their category reference.`)) return;

        setLoading(true);
        try {
            await deleteCategory(id);
            toast.success('Category deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
        >
            <Trash size={14} /> {loading ? 'Deleting...' : 'Delete'}
        </button>
    );
}
