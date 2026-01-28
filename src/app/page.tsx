'use client';

import { useState } from 'react';
import { Idea, IdeaCard } from '@/components/IdeaCard';
import { Flame } from 'lucide-react';

// MOCK DATA
const INITIAL_IDEAS: Idea[] = [
    {
        id: '1',
        title: "Dark Mode for Dashboard",
        description: "The current white theme is blinding at night. We need a proper dark mode with systematic color tokens.",
        vitality: 92.5,
        totalStaked: 120,
    },
    {
        id: '2',
        title: "Mobile App Notification Fix",
        description: "Push notifications are delayed by 5-10 minutes on iOS. This is critical for real-time alerts.",
        vitality: 45.0,
        totalStaked: 60,
    },
    {
        id: '3',
        title: "Export to CSV",
        description: "Allow users to export their project data to a CSV file for external analysis.",
        vitality: 8.5,
        totalStaked: 10,
    }
];

export default function Home() {
    const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);

    const handleStake = (id: string, amount: number) => {
        console.log(`Staking ${amount} on ${id}`);
        // In reality, this would trigger a DB transaction + Vitality Recalc
        // For mock, we just loose-bump the numbers
        setIdeas(prev => prev.map(idea =>
            idea.id === id
                ? { ...idea, vitality: Math.min(idea.vitality + 5, 200), totalStaked: idea.totalStaked + amount }
                : idea
        ).sort((a, b) => b.vitality - a.vitality));
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
                        <div className="text-sm text-zinc-400">
                            Budget: <span className="font-mono text-orange-400 font-bold">80</span>/100
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
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
                    {ideas.map(idea => (
                        <IdeaCard
                            key={idea.id}
                            idea={idea}
                            onStake={(amt) => handleStake(idea.id, amt)}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
