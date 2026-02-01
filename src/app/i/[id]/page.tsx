import { getIdea } from '@/lib/actions';
import { getRemainingBudget } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { IdeaDetail } from '@/components/IdeaDetail';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const idea = await getIdea(id);
    if (!idea) return { title: 'Idea Not Found | Tenber' };
    return {
        title: `${idea.title} | Tenber`,
        description: idea.description,
    };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const idea = await getIdea(id);

    if (!idea) {
        notFound();
    }

    // Get User & Budget
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {
                    // Safe to ignore in Server Component here
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    let budget = 0;
    if (user) {
        budget = await getRemainingBudget(user.id);
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500/30">
            <IdeaDetail
                initialIdea={idea}
                initialBudget={budget}
                currentUserId={user?.id}
            />
        </main>
    );
}
