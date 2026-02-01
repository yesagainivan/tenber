
import React from 'react';
import { getVitalityStatus, Idea } from '@/lib/mechanics';
import { Flame } from 'lucide-react';
import { ConvictionSlider } from './ConvictionSlider';
import Link from 'next/link';
import { CommentSection } from './CommentSection';

export type { Idea }; // Re-export for page.tsx

interface IdeaCardProps {
    idea: Idea;
    userBudget: number;
    currentUserId?: string;
    onStake: (amount: number) => Promise<void>;
}

export function IdeaCard({ idea, userBudget, currentUserId, onStake }: IdeaCardProps) {
    const status = getVitalityStatus(idea.vitality);

    const statusColors = {
        blazing: "text-orange-500 from-orange-500/20 to-orange-500/5",
        burning: "text-amber-500 from-amber-500/20 to-amber-500/5",
        smoldering: "text-rose-500 from-rose-500/20 to-rose-500/5",
        dying: "text-zinc-600 from-zinc-500/10 to-transparent",
    };

    return (
        <div className={`group relative p-6 rounded-xl border border-white/5 bg-zinc-900 overflow-hidden transition-all hover:border-white/10`}>
            {/* Vitality Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${statusColors[status]}`} />

            <div className="relative flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 border border-white/5">
                            {idea.category}
                        </span>
                        {idea.author?.username && (
                            <Link
                                href={`/u/${idea.author.username}`}
                                className="text-xs text-zinc-500 hover:text-orange-400 transition-colors"
                            >
                                @{idea.author.username}
                            </Link>
                        )}
                    </div>
                    <h3 className="text-xl font-medium text-zinc-100">{idea.title}</h3>
                    <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{idea.description}</p>
                </div>

                {/* Vitality Indicator */}
                <div className="flex flex-col items-end gap-1">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/50 border border-white/5 backdrop-blur-sm ${statusColors[status].split(" ")[0]}`}>
                        <Flame size={16} className={status === 'blazing' || status === 'burning' ? "fill-current animate-pulse" : ""} />
                        <span className="font-mono font-bold">{idea.vitality.toFixed(0)}</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">{status}</span>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Total Conviction</span>
                        <span className="font-mono text-zinc-300">{idea.totalStaked.toFixed(0)} pts</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* User's current stake if any */}
                        {currentUserId && idea.userStake ? (
                            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                                You: <span className="font-bold">{idea.userStake}</span>
                            </div>
                        ) : null}

                        <ConvictionSlider
                            ideaId={idea.id}
                            initialStake={idea.userStake || 0}
                            userBudget={userBudget}
                            onStake={onStake}
                            disabled={!currentUserId}
                        />
                    </div>
                </div>

                <CommentSection ideaId={idea.id} />
            </div>
        </div>
    );
}
