'use client';

import { useState, useEffect } from 'react';
import { Idea, IdeaCard } from '@/components/IdeaCard';
import { Flame, Loader2, LogIn, LogOut, User as UserIcon, Plus } from 'lucide-react';
import { getIdeas } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Modal } from '@/components/Modal';
import { CreateIdeaForm } from '@/components/CreateIdeaForm';

export default function Home() {
    const { user, signOut } = useAuth();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        async function load() {
            const data = await getIdeas();
            setIdeas(data);
            setLoading(false);
        }
        load();
    }, []);

    const handleSuccess = async () => {
        setIsCreateOpen(false);
        setLoading(true);
        // Refresh list
        const data = await getIdeas();
        setIdeas(data);
        setLoading(false);
    };

    const handleStake = (id: string, amount: number) => {
        console.log(`Staking ${amount} on ${id}`);
        // TODO: Implement actual staking
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-600 rounded-lg">
                            <Flame size={20} className="text-white fill-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Tenber</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="text-sm text-zinc-400 hidden sm:block">
                                    Budget: <span className="font-mono text-orange-400 font-bold">100</span>/100
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 text-orange-400 hover:bg-orange-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Plus size={16} /> Kindle Idea
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400">
                                        <UserIcon size={14} />
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-sm font-bold transition-all"
                            >
                                Sign In <LogIn size={14} />
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Feed */}
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Top Conviction</h1>
                    <p className="text-zinc-500">Ideas are ranked by their current vitality. Tend to what matters.</p>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center py-20 text-zinc-500 gap-2">
                            <Loader2 className="animate-spin" /> Loading ideas...
                        </div>
                    ) : ideas.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                            No ideas yet. Be the first to kindle one!
                        </div>
                    ) : (
                        ideas.map(idea => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                onStake={(amt) => handleStake(idea.id, amt)}
                            />
                        ))
                    )}
                </div>
            </div>

            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Kindle a New Idea">
                <CreateIdeaForm onSuccess={handleSuccess} />
            </Modal>
        </main>
    );
}
