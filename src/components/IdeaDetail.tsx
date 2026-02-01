'use client';

import { Idea } from '@/lib/mechanics';
import { useState } from 'react';
import { Flame, Share2, ArrowLeft } from 'lucide-react';
import { ConvictionSlider } from './ConvictionSlider';
import { CommentSection } from './CommentSection';
import Link from 'next/link';
import { stakeIdea } from '@/lib/actions';
import { getVitalityStatus } from '@/lib/mechanics';
import { useToast } from './Toast';

interface IdeaDetailProps {
    initialIdea: Idea;
    initialBudget: number;
    currentUserId?: string;
}

export function IdeaDetail({ initialIdea, initialBudget, currentUserId }: IdeaDetailProps) {
    const [idea, setIdea] = useState(initialIdea);
    const [budget, setBudget] = useState(initialBudget);
    const { addToast } = useToast();

    const status = getVitalityStatus(idea.vitality);
    const statusColors = {
        blazing: "text-orange-500 from-orange-500/20 to-orange-500/5",
        burning: "text-amber-500 from-amber-500/20 to-amber-500/5",
        smoldering: "text-rose-500 from-rose-500/20 to-rose-500/5",
        dying: "text-zinc-600 from-zinc-500/10 to-transparent",
    };

    const handleStake = async (amount: number) => {
        try {
            const result = await stakeIdea(idea.id, amount);
            setIdea(result.idea);
            setBudget(result.budget);
            addToast("Staked successfully!", "success");
        } catch (e: unknown) {
            console.error(e);
            addToast((e as Error).message || "Failed to stake", 'error');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        addToast("Link copied to clipboard", "success");
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Feed
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/10 text-zinc-300 border border-white/5 shadow-sm backdrop-blur-md">
                                {idea.category}
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400 font-medium">
                                Posted by <Link href={`/u/${idea.author?.username}`} className="text-white hover:underline transition-all decoration-orange-500/50 underline-offset-4">@{idea.author?.username}</Link>
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                            {idea.title}
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-light border-l-2 border-orange-500/50 pl-6 py-2">
                            {idea.description}
                        </p>
                    </div>

                    {/* Meta / Stats for Mobile (Hidden on Desktop?) - Actually keep them here or move? 
                        Let's put the main visualizations here.
                    */}

                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-full bg-zinc-950 border border-white/5 ${statusColors[status].split(" ")[0]}`}>
                                <Flame size={32} className={status === 'blazing' || status === 'burning' ? "fill-current animate-pulse" : ""} />
                            </div>
                            <div>
                                <div className="text-3xl font-mono font-bold text-white">
                                    {idea.vitality.toFixed(1)}
                                </div>
                                <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">
                                    Current Vitality
                                </div>
                            </div>
                        </div>

                        <div className="h-12 w-px bg-white/10 hidden sm:block" />

                        <div className="flex flex-col items-center sm:items-start">
                            <div className="text-2xl font-mono text-zinc-300">
                                {idea.totalStaked.toFixed(0)}
                            </div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider">
                                Total Staked
                            </div>
                        </div>
                    </div>

                    <CommentSection ideaId={idea.id} defaultOpen={true} />
                </div>

                {/* Right Col: Actions (Sticky) */}
                <div className="md:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        {/* Staking Card */}
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-zinc-200">Tend to this Idea</h3>
                                <button onClick={handleShare} className="text-zinc-500 hover:text-white transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>

                            {currentUserId ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Your Budget</span>
                                        <span className="font-mono text-orange-400">{budget}/100</span>
                                    </div>

                                    <div className="pt-2">
                                        <ConvictionSlider
                                            initialStake={idea.userStake || 0}
                                            userBudget={budget}
                                            onStake={handleStake}
                                        />
                                    </div>

                                    {idea.userStake ? (
                                        <div className="text-center text-xs text-emerald-400 bg-emerald-400/10 py-2 rounded-lg border border-emerald-400/20">
                                            You are contributing <b>{idea.userStake}</b> points
                                        </div>
                                    ) : (
                                        <div className="text-center text-xs text-zinc-500 italic">
                                            You haven&apos;t staked on this yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 space-y-3">
                                    <p className="text-sm text-zinc-500">Sign in to stake your conviction.</p>
                                    <Link href="/login" className="block w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors">
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Additional Info / Prompt */}
                        <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/30 text-xs text-zinc-500 leading-relaxed">
                            <p>
                                <b>Conviction Voting</b>: Your points represent a continuous flow of support.
                                Removing your stake will cause the idea&apos;s vitality to decay faster.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
