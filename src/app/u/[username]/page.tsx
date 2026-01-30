import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getProfileByUsername, getUserStakedIdeas } from '@/lib/db';
import { ProfileHeader } from '@/components/ProfileHeader';
import { IdeaCard } from '@/components/IdeaCard';

interface Props {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `@${username} | Tenber`,
    };
}

export default async function ProfilePage({ params }: Props) {
    const { username } = await params;
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const stakedIdeas = await getUserStakedIdeas(profile.id);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors">
                    <ChevronLeft size={16} className="mr-1" /> Back to Feed
                </Link>

                <ProfileHeader
                    username={profile.username || username}
                    bio={profile.bio}
                    avatarUrl={profile.avatar_url}
                    reputation={profile.reputation}
                    stakedCount={stakedIdeas.length}
                />

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-400 uppercase tracking-wider text-xs px-1">
                        Currently Tending
                    </h2>

                    {stakedIdeas.length > 0 ? (
                        <div className="grid gap-4">
                            {stakedIdeas.map(idea => (
                                <IdeaCard
                                    key={idea.id}
                                    idea={idea}
                                    userBudget={0} // Read-only view mainly, or we could fetch viewer's budget if we wanted interactivity
                                    onStake={async () => { 'use server'; /* No-op or require login */ }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-600 italic">
                            Not tending any fires yet.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
