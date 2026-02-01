'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Flame, Loader2, ArrowRight } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function LoginForm() {
    const { signIn } = useAuth();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            setTimeout(() => {
                setMessage({ type: 'error', text: 'Authentication failed. Please try again.' });
            }, 0);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await signIn(email);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Magic link sent! Check your email.' });
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md space-y-8">
            {/* Brand */}
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-3 bg-orange-600 rounded-xl relative group">
                    <Flame size={40} className="text-white fill-white relative z-10" />
                    <div className="absolute inset-0 bg-orange-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Welcome to Tenber</h1>
                    <p className="text-zinc-400">Sign in to tend your first idea.</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@domain.com"
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Send Magic Link <ArrowRight size={18} /></>}
                    </button>
                </form>

                {/* Messages */}
                {message && (
                    <div className={`mt-6 p-4 rounded-lg text-sm border ${message.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-900 text-emerald-400'
                        : 'bg-red-950/30 border-red-900 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6">
            <Suspense fallback={<div className="text-zinc-500"><Loader2 className="animate-spin" /> Loading...</div>}>
                <LoginForm />
            </Suspense>
        </main>
    );
}
