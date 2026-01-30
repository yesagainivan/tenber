'use client';

import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { addComment, fetchComments } from '@/lib/actions';
import { Comment } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './Toast';
import Link from 'next/link';

export function CommentSection({ ideaId, totalComments }: { ideaId: string, totalComments?: number }) {
    const { user, profile } = useAuth();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [hasLoaded, setHasLoaded] = useState(false);

    const toggleOpen = async () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        if (nextState && !hasLoaded) {
            setLoading(true);
            try {
                const data = await fetchComments(ideaId);
                setComments(data);
                setHasLoaded(true);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            // Optimistic update? Maybe simpler to just wait for now.
            await addComment(ideaId, newComment);

            // Create a fake comment object for immediate feedback
            const tempComment: Comment = {
                id: Math.random().toString(), // temporary
                content: newComment,
                created_at: new Date().toISOString(),
                author: {
                    username: profile?.username || 'You',
                    avatar_url: profile?.avatar_url || null
                }
            };

            setComments(prev => [...prev, tempComment]);
            setNewComment('');

            // Re-fetch in background to get real ID/timestamp
            fetchComments(ideaId).then(setComments);

        } catch (e) {
            addToast('Failed to post comment', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <button
                onClick={toggleOpen}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
            >
                <MessageSquare size={14} />
                {isOpen ? 'Hide Comments' : `Comments`}
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* List */}
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                        {loading ? (
                            <div className="flex justify-center py-4 text-zinc-600">
                                <Loader2 size={16} className="animate-spin" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 text-zinc-600 text-sm italic">
                                No thoughts yet. Share yours?
                            </div>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 text-sm">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 overflow-hidden mt-1">
                                        {comment.author.avatar_url ? <img src={comment.author.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-700" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-zinc-300 text-xs">@{comment.author.username || 'anon'}</span>
                                            <span className="text-zinc-600 text-[10px]">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    {user ? (
                        <form onSubmit={handleSubmit} className="relative flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="absolute right-1 top-1 p-1.5 text-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-2 text-xs text-zinc-600">
                            <Link href="/login" className="text-orange-500 hover:underline">Sign in</Link> to join the discussion.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
