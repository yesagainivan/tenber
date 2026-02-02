'use client';

import { Flame, Plus, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AuraAvatar } from '@yesagainivan/aura';

interface HeaderProps {
    budget?: number;
    onKindleClick?: () => void;
}

export function Header({ budget = 0, onKindleClick }: HeaderProps) {
    const { user, profile, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-10 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-600 rounded-lg">
                        <Flame size={20} className="text-white fill-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Tenber</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="text-sm text-zinc-400 hidden sm:block">
                                Budget: <span className="font-mono text-orange-400 font-bold">{budget}</span>/100
                            </div>
                            <div className="flex items-center gap-3">
                                {onKindleClick && (
                                    <button
                                        onClick={onKindleClick}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 text-orange-400 hover:bg-orange-600 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        <Plus size={16} /> Kindle Idea
                                    </button>
                                )}
                                <Link
                                    href={profile?.username ? `/u/${profile.username}` : "/settings"}
                                    title={profile?.username || "Profile"}
                                    className="block w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                                >
                                    {profile?.avatar_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={profile.avatar_url} alt={profile.username || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full">
                                            <AuraAvatar username={profile?.username || 'user'} size={32} />
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                    title="Sign Out"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-sm font-bold transition-all"
                        >
                            Sign In <LogIn size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
