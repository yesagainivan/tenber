
import React from 'react';
import { getVitalityStatus } from '@/lib/mechanics';
import { Flame, ArrowUp } from 'lucide-react';

export interface Idea {
    id: string;
    title: string;
    description: string;
    vitality: number; // Calculated on read
    totalStaked: number; // The "Target"
    userStake?: number; // What the current user has put in
}

interface IdeaCardProps {
    idea: Idea;
    onStake: (amount: number) => void;
}

export function IdeaCard({ idea, onStake }: IdeaCardProps) {
    const status = getVitalityStatus(idea.vitality);

    const statusColors = {
        blazing: "text-orange-500 from-orange-500/20 to-orange-500/5",
        burning: "text-amber-500 from-amber-500/20 to-amber-500/5",
        fading: "text-slate-500 from-slate-500/20 to-slate-500/5",
        extinguished: "text-gray-300 from-gray-500/10 to-transparent",
    };

    return (
        <div className={`group relative p-6 rounded-xl border border-white/5 bg-zinc-900 overflow-hidden transition-all hover:border-white/10`}>
            {/* Vitality Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${statusColors[status]}`} />

            <div className="relative flex justify-between items-start gap-4">
                <div className="flex-1">
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

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-500">Total Conviction</span>
                    <span className="font-mono text-zinc-300">{idea.totalStaked} pts</span>
                </div>

                {/* Action (Mock Staking) */}
                <button
                    onClick={() => onStake(10)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                >
                    <ArrowUp size={16} /> Stake
                </button>
            </div>
        </div>
    );
}
