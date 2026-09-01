'use client';

import { Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteProduct } from '@/app/actions/admin';

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${name}"?\nThis will remove it permanently, including variant data.`)) return;

        setLoading(true);
        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete product');
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
