'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { isStaffRole } from '@/lib/auth/roles';

function AdminLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isUnauthorized = searchParams.get('error') === 'unauthorized';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                toast.error(error.message);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, is_active')
                .eq('user_id', data.user.id)
                .single();

            if (!profile || !isStaffRole(profile.role) || !profile.is_active) {
                await supabase.auth.signOut();
                toast.error('You do not have admin access.');
                return;
            }

            toast.success('Login successful!');
            router.push('/admin');
            router.refresh();
        } catch {
            toast.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/30">
                        <Shield size={28} className="text-white" />
                    </div>
                    <h1 className="text-white font-brand font-black text-2xl">Admin Panel</h1>
                    <p className="text-slate-400 text-sm mt-1">Apna Bazar — Owner & Admin Access Only</p>
                </div>

                {isUnauthorized && (
                    <div className="bg-red-950/60 border border-red-800 rounded-2xl p-4 mb-4 text-center text-red-300 text-sm">
                        You do not have permission to access this area.
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl"
                >
                    <div>
                        <label htmlFor="admin-email" className="label text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@apnabazar.in"
                                className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500 pl-10 focus:ring-emerald-500"
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="label text-slate-300">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your admin password"
                                className="input bg-slate-800 border-slate-700 text-white placeholder-slate-500 pl-10 pr-10 focus:ring-emerald-500"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="btn-primary w-full btn-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            'Sign In to Admin Panel'
                        )}
                    </button>
                </form>

                <p className="text-center text-slate-600 text-xs mt-4">
                    This area is restricted to authorized administrators only.
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <AdminLoginForm />
        </Suspense>
    );
}
