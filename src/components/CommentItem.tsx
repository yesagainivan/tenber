'use client';

import { useState } from 'react';
import { MessageSquare, Trash2, Loader2, Send, CornerDownRight } from 'lucide-react';
import { Comment } from '@/lib/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ConfirmationModal } from './ConfirmationModal';
import { addComment } from '@/lib/actions';

interface CommentItemProps {
    comment: Comment;
    replies: Comment[];
    currentUserId?: string;
    ideaId: string;
    onDelete: (id: string) => void;
    onReplySuccess: () => void;
}

export function CommentItem({
    comment,
    replies,
    currentUserId,
    ideaId,
    onDelete,
    onReplySuccess
}: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isOwner = currentUserId === comment.author.username; // Note: currentUserId in props seems to be username based on usage in CommentSection, need to verify. 
    // Actually CommentSection uses: user && profile?.username === comment.author.username. 
    // Let's pass `isOwner` directly or pass `currentUserProfile`. 
    // Let's pass `currentUser` object or similar.
    // Re-checking CommentSection: const { user, profile } = useAuth();

    // Let's simplify props:
    // isOwner: boolean

    async function handleReply(e: React.FormEvent) {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmittingReply(true);
        try {
            await addComment(ideaId, replyContent, comment.id);
            setReplyContent('');
            setIsReplying(false);
            onReplySuccess();
        } catch (error) {
            console.error(error);
            // toast handled by parent? No, we should probably have toast here or pass it down.
            // For now, let's keep it simple.
        } finally {
            setSubmittingReply(false);
        }
    }

    return (
        <div className="group animate-in fade-in duration-300">
            <div className="flex gap-3 text-sm">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-800 overflow-hidden mt-1">
                    {comment.author.avatar_url ? (
                        <img src={comment.author.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-zinc-700" />
                    )}
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href={comment.author.username ? `/u/${comment.author.username}` : '#'} className="font-bold text-zinc-300 text-xs hover:text-white transition-colors">
                                @{comment.author.username || 'anon'}
                            </Link>
                            <span className="text-zinc-600 text-[10px]">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {currentUserId && (
                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="text-zinc-600 hover:text-zinc-300 p-1"
                                >
                                    <MessageSquare size={12} />
                                </button>
                            )}
                            {/* We need to pass isOwner correctly. Let's assume currentUserId is the user's ID and we compare with something? 
                                Actually CommentSection compares username. 
                            */}
                        </div>
                    </div>

                    <p className="text-zinc-400 leading-relaxed break-words">
                        {comment.content}
                    </p>

                    {/* Reply Form */}
                    {isReplying && (
                        <form onSubmit={handleReply} className="mt-2 flex gap-2 animate-in slide-in-from-top-1 duration-200">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Reply to @${comment.author.username || 'anon'}...`}
                                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg py-1.5 pl-3 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={submittingReply || !replyContent.trim()}
                                className="p-1.5 text-orange-500 hover:text-orange-400 disabled:opacity-50"
                            >
                                {submittingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {replies.length > 0 && (
                <div className="pl-9 mt-3 space-y-3 relative">
                    {/* Thread line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800/50" />

                    {replies.map(reply => (
                        <div key={reply.id} className="relative">
                            {/* Curve connector */}
                            <div className="absolute -left-5 top-3 w-4 h-4 border-b border-l border-zinc-800/50 rounded-bl-xl" />

                            <CommentItem
                                comment={reply}
                                replies={[]} // Max 2 levels for now
                                currentUserId={currentUserId}
                                ideaId={ideaId}
                                onDelete={onDelete}
                                onReplySuccess={onReplySuccess}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
