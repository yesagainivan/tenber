'use client';

import { useState, useEffect } from 'react';
import { Idea, IdeaCard } from '@/components/IdeaCard';
import { Loader2 } from 'lucide-react';
import { getRemainingBudget } from '@/lib/db';
import { stakeIdea, getIdeas } from '@/lib/actions'; // Import action
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { Modal } from '@/components/Modal';
import { CreateIdeaForm } from '@/components/CreateIdeaForm';
import { Header } from '@/components/Header';

export default function Home() {
    const { user, profile, signOut } = useAuth();
    const { addToast } = useToast();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [budget, setBudget] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const categories = ['All', 'Tech', 'Art', 'Society', 'Philosophy', 'Random', 'Other'];

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await getIdeas(selectedCategory, debouncedSearch);
            setIdeas(data);

            if (user) {
                const b = await getRemainingBudget(user.id);
                setBudget(b);
            }

            setLoading(false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, selectedCategory, debouncedSearch]);

    const handleSuccess = async () => {
        setIsCreateOpen(false);
        setLoading(true);
        // Refresh list
        const data = await getIdeas(selectedCategory, debouncedSearch);
        setIdeas(data);

        if (user) {
            const b = await getRemainingBudget(user.id);
            setBudget(b);
        }

        setLoading(false);
    };


    const handleStake = async (id: string, amount: number) => {
        try {
            const result = await stakeIdea(id, amount);

            // Optimized Update:
            // 1. Update the specific idea in the list
            setIdeas(current => current.map(idea =>
                idea.id === id ? result.idea : idea
            ).sort((a, b) => b.vitality - a.vitality)); // Re-sort locally if needed

            // 2. Update budget
            setBudget(result.budget);

        } catch (e: unknown) {
            console.error(e);
            addToast((e as Error).message || "Failed to stake", 'error');
        }
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
            {/* Header */}
            {/* Header */}
            <Header budget={budget} onKindleClick={() => setIsCreateOpen(true)} />

            {/* Feed */}
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Top Conviction</h1>
                        <p className="text-zinc-500">Ideas are ranked by their current vitality. Tend to what matters.</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search ideas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-3 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-orange-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
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
                                userBudget={budget}
                                currentUserId={user?.id}
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
