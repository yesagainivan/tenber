'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface SettingsFormProps {
    initialUsername?: string;
    initialBio?: string;
    updateAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function SettingsForm({ initialUsername, initialBio, updateAction }: SettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        try {
            const result = await updateAction(formData);
            if (result.error) {
                addToast(result.error, 'error');
            } else {
                addToast('Profile updated successfully', 'success');
            }
        } catch {
            addToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-zinc-400">Username</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500">@</span>
                    <input
                        name="username"
                        defaultValue={initialUsername || ''}
                        pattern="[a-zA-Z0-9_]{3,20}"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-8 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600"
                        placeholder="username"
                    />
                </div>
                <p className="text-xs text-zinc-500">Unique handle. 3-20 chars.</p>
            </div>

            <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-zinc-400">Bio</label>
                <textarea
                    name="bio"
                    defaultValue={initialBio || ''}
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600 resize-none"
                    placeholder="Tell us what you tend to..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Profile
            </button>
        </form>
    );
}
