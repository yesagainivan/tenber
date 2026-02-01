import { User, Settings } from 'lucide-react';
import Link from 'next/link';

interface ProfileHeaderProps {
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    reputation: number;
    stakedCount: number;
    isOwner?: boolean;
}

export function ProfileHeader({ username, bio, avatarUrl, reputation, stakedCount, isOwner }: ProfileHeaderProps) {
    return (
        <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            {isOwner && (
                <Link
                    href="/settings"
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title="Edit Profile"
                >
                    <Settings size={18} />
                </Link>
            )}

            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-xl overflow-hidden">
                {avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                    <User size={48} className="text-zinc-600" />
                )}
            </div>

            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">@{username}</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full font-mono text-xs">
                        Rep: {reputation}
                    </span>
                    <span>•</span>
                    <span>Tending {stakedCount} Fires</span>
                </div>
            </div>

            {bio && (
                <p className="text-zinc-300 max-w-sm mx-auto leading-relaxed">
                    {bio}
                </p>
            )}
        </div>
    );
}
