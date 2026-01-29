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
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                {[10, 25, 50].map((amt) => {
                    const disabled = (userBudget + initialStake < amt) || loading;
                    return (
                        <button
                            key={amt}
                            onClick={() => {
                                const newVal = amt;
                                setVal(newVal);
                                handleChange({ target: { value: newVal.toString() } } as any);
                            }}
                            disabled={disabled}
                            className={`
                                text-[10px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer
                                ${disabled
                                    ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400 active:bg-orange-500/10'}
                            `}
                        >
                            {amt}
                        </button>
                    )
                })}
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min="0"
                    max="100" // Hard cap 100 for now, logic will clamp
                    value={val}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-24 sm:w-32 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 relative z-10"
                />
                <div className="w-8 text-right font-mono text-sm text-zinc-400">
                    {loading ? <Loader2 size={12} className="animate-spin inline" /> : val}
                </div>
            </div>
        </div>
    );
}
