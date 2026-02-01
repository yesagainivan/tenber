'use client';

import { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ConvictionSliderProps {
    initialStake: number;
    userBudget: number;
    onStake: (amount: number) => Promise<void>;
    disabled?: boolean;
}

export function ConvictionSlider({ initialStake, userBudget, onStake, disabled = false }: ConvictionSliderProps) {
    const [val, setVal] = useState(initialStake);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
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
        <div className={`flex flex-wrap items-center gap-4 max-w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-1.5">
                {[10, 25, 50].map((amt) => {
                    const disabled = (userBudget + initialStake < amt) || loading;
                    return (
                        <button
                            key={amt}
                            onClick={() => {
                                const newVal = amt;
                                setVal(newVal);
                                handleChange({ target: { value: newVal.toString() } } as unknown as React.ChangeEvent<HTMLInputElement>);
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

            <div className="flex flex-1 items-center gap-3 min-w-[200px]">
                <input
                    type="range"
                    min="0"
                    max="100" // Hard cap 100 for now, logic will clamp
                    value={val}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 relative z-10"
                />
                <div className="w-8 text-right font-mono text-sm text-zinc-400">
                    {loading ? <Loader2 size={12} className="animate-spin inline" /> : val}
                </div>
            </div>
        </div>
    );
}
