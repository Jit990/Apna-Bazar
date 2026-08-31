'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Address } from '@/types';

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Address>>({
        is_default: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/addresses');
            const data = await res.json();
            if (data.success) setAddresses(data.data || []);
        } catch (err) {
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const method = editingId ? 'PUT' : 'POST';
            const payload = editingId ? { ...formData, id: editingId } : formData;

            // Auto layout state
            if (!payload.state) payload.state = 'West Bengal';

            const res = await fetch('/api/addresses', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingId ? 'Address updated' : 'Address added');
                setIsFormOpen(false);
                setEditingId(null);
                setFormData({ is_default: false });
                fetchAddresses();
            } else {
                toast.error(data.error || 'Failed to save address');
            }
        } catch {
            toast.error('Network Error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Address deleted');
                fetchAddresses();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error('Network Error');
        }
    };

    const handleSetDefault = async (address: Address) => {
        if (address.is_default) return;
        try {
            const res = await fetch('/api/addresses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...address, is_default: true })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Default address updated');
                fetchAddresses();
            }
        } catch {
            toast.error('Network error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
                <Loader2 size={32} className="animate-spin text-[#1A7850]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4 safe-top sticky top-0 z-30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Saved Addresses</h1>
                </div>
                {!isFormOpen && (
                    <button
                        id="addAddressBtn"
                        onClick={() => {
                            setFormData({ is_default: addresses.length === 0 });
                            setEditingId(null);
                            setIsFormOpen(true);
                        }}
                        className="text-[#1A7850] font-semibold text-sm flex items-center gap-1"
                    >
                        <Plus size={18} /> Add New
                    </button>
                )}
            </div>

            <div className="p-4">
                {isFormOpen ? (
                    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-fade-in space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>

                        <div>
                            <label className="label">Full Name</label>
                            <input required type="text" className="input bg-gray-50" value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Receivers name" />
                        </div>

                        <div>
                            <label className="label">Mobile Number</label>
                            <input required type="tel" className="input bg-gray-50" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="10-digit mobile number" />
                        </div>

                        <div>
                            <label className="label">Flat, House no., Building, Apartment</label>
                            <input required type="text" className="input bg-gray-50" value={formData.house_flat || ''} onChange={e => setFormData({ ...formData, house_flat: e.target.value })} />
                        </div>

                        <div>
                            <label className="label">Area, Street, Locality</label>
                            <input type="text" className="input bg-gray-50" value={formData.street_locality || ''} onChange={e => setFormData({ ...formData, street_locality: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">City/Town</label>
                                <input required type="text" className="input bg-gray-50" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Pincode</label>
                                <input required type="text" className="input bg-gray-50" value={formData.pincode || ''} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 py-2 cursor-pointer mt-2">
                            <input type="checkbox" checked={formData.is_default || false} onChange={e => setFormData({ ...formData, is_default: e.target.checked })} className="w-5 h-5 text-[#1A7850] rounded" />
                            <span className="text-sm font-medium text-gray-700">Make this my default address</span>
                        </label>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 btn-outline bg-white border-gray-200 text-gray-700">Cancel</button>
                            <button type="submit" disabled={submitting} id="saveAddressBtn" className="flex-1 btn-primary bg-[#1A7850] py-3 text-white font-bold rounded-xl disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                ) : addresses.length === 0 ? (
                    <div className="empty-state bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 py-20 px-6">
                        <MapPin size={48} className="text-gray-300 mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-2">No Addresses Found</h2>
                        <p className="text-gray-500 text-sm mb-6 max-w-[250px] mx-auto text-center">Save your addresses here for a faster checkout experience.</p>
                        <button
                            id="emptyAddAddressBtn"
                            onClick={() => {
                                setFormData({ is_default: true });
                                setIsFormOpen(true);
                            }}
                            className="bg-[#1A7850] text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
                        >
                            Add New Address
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map(addr => (
                            <div key={addr.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${addr.is_default ? 'border-[#1A7850]' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700 uppercase tracking-wide">
                                            ADDRESS
                                        </div>
                                        {addr.is_default && (
                                            <div className="flex items-center gap-1 text-[#1A7850] text-xs font-bold">
                                                <CheckCircle2 size={14} /> Default
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900">{addr.full_name}</div>
                                <div className="text-gray-600 text-sm mt-1 leading-relaxed">
                                    {addr.house_flat}, {addr.street_locality && `${addr.street_locality}, `}
                                    {addr.city}, {addr.state} - <span className="font-semibold">{addr.pincode}</span>
                                </div>
                                <div className="mt-2 text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-gray-500 font-normal">Phone:</span> {addr.phone}
                                </div>

                                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setFormData(addr);
                                            setEditingId(addr.id);
                                            setIsFormOpen(true);
                                        }}
                                        className="text-sm font-semibold text-gray-600 hover:text-[#1A7850] flex items-center gap-1"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addr.id)}
                                        className="text-sm font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>

                                    {!addr.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(addr)}
                                            className="text-sm font-semibold text-[#1A7850] ml-auto hover:underline"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
