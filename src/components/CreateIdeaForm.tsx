'use client';

import { useActionState } from 'react';
import { createIdea } from '@/lib/actions';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface FormState {
    error?: string;
    success?: boolean;
}

const initialState: FormState = {
    error: '',
    success: false
};

interface CreateIdeaFormProps {
    onSuccess: () => void;
}

export function CreateIdeaForm({ onSuccess }: CreateIdeaFormProps) {
    const [state, formAction, isPending] = useActionState(createIdea, initialState);

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-zinc-300">
                    What is your idea?
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="e.g., Dark Mode for Dashboard"
                    required
                    minLength={3}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-zinc-300">
                    Why does it matter?
                </label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the problem this solves..."
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600 resize-none"
                />
            </div>

            {state.error && (
                <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
                {isPending ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        <Sparkles size={18} /> Kindle Idea
                    </>
                )}
            </button>
        </form>
    );
}
