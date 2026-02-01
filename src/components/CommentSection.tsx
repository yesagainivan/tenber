'use client';

import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { addComment, fetchComments, deleteComment } from '@/lib/actions';
import { Comment } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './Toast';
import Link from 'next/link';
import { ConfirmationModal } from './ConfirmationModal';
import { CommentItem } from './CommentItem';

export function CommentSection({ ideaId, totalComments }: { ideaId: string, totalComments?: number }) {
    const { user, profile } = useAuth();
    const { addToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLoaded, setHasLoaded] = useState(false);

    const toggleOpen = async () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        if (nextState && !hasLoaded) {
            setLoading(true);
            refreshComments();
        }
    };

    const refreshComments = async () => {
        try {
            const data = await fetchComments(ideaId);
            setComments(data);
            setHasLoaded(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await addComment(ideaId, newComment);

            // Optimistic update
            const tempComment: Comment = {
                id: Math.random().toString(),
                content: newComment,
                created_at: new Date().toISOString(),
                parent_id: null,
                author: {
                    username: profile?.username || 'You',
                    avatar_url: profile?.avatar_url || null
                }
            };

            setComments(prev => [...prev, tempComment]);
            setNewComment('');

            // Re-fetch
            refreshComments();

        } catch (e) {
            addToast('Failed to post comment', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;
        const id = confirmDeleteId;
        setConfirmDeleteId(null);
        setDeletingId(id);

        try {
            await deleteComment(id);

            // Remove the deleted comment and any replies to it from local state
            setComments(prev => prev.filter(c => c.id !== id && c.parent_id !== id));

            addToast('Comment deleted', 'success');
            // Still re-fetch to ensure absolute sync with DB trigger side effects if any
            refreshComments();
        } catch (e) {
            addToast('Failed to delete comment', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    // Organize comments into threads
    const topLevelComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

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
                <div className="mt-4 space-y-6 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Input (Top Level) */}
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

                    {/* List */}
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                        {loading ? (
                            <div className="flex justify-center py-4 text-zinc-600">
                                <Loader2 size={16} className="animate-spin" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8 text-zinc-600 text-sm italic">
                                No thoughts yet. Be the first to spark a conversation.
                            </div>
                        ) : (
                            topLevelComments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    replies={getReplies(comment.id)}
                                    // Passing profile username for ownership logic
                                    currentUserId={profile?.username || undefined}
                                    ideaId={ideaId}
                                    onDelete={(id) => setConfirmDeleteId(id)}
                                    onReplySuccess={refreshComments}
                                />
                            ))
                        )}
                    </div>

                    <ConfirmationModal
                        isOpen={!!confirmDeleteId}
                        title="Delete Comment"
                        message="Are you sure you want to delete this comment? This cannot be undone."
                        confirmLabel="Delete"
                        isDanger
                        onConfirm={handleDelete}
                        onCancel={() => setConfirmDeleteId(null)}
                    />
                </div>
            )}
        </div>
    );
}
