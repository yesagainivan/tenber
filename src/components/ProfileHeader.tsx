import { User } from 'lucide-react';

interface ProfileHeaderProps {
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    reputation: number;
    stakedCount: number;
}

export function ProfileHeader({ username, bio, avatarUrl, reputation, stakedCount }: ProfileHeaderProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-xl overflow-hidden">
                {avatarUrl ? (
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
