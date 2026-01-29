'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ConvictionSliderProps {
    ideaId: string;
    initialStake: number;
    userBudget: number;
    onStake: (amount: number) => Promise<void>;
}

export function ConvictionSlider({ ideaId, initialStake, userBudget, onStake }: ConvictionSliderProps) {
    const [val, setVal] = useState(initialStake);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    // Max allowance is what they have left + what they already put in this idea
    const maxStake = userBudget + initialStake;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        setVal(newValue);

        // Debounce server action
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            await onStake(newValue);
            setLoading(false);
        }, 800);
    };

    return (
        <div className="flex items-center gap-3">
            <input
                type="range"
                min="0"
                max="100" // Hard cap 100 for now, logic will clamp
                value={val}
                onChange={handleChange}
                disabled={loading}
                className="w-32 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
            />
            <div className="w-8 text-right font-mono text-sm text-zinc-400">
                {loading ? <Loader2 size={12} className="animate-spin inline" /> : val}
            </div>
        </div>
    );
}
