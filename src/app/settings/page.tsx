import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { SettingsForm } from '@/components/SettingsForm';
import { updateProfile } from '@/lib/actions';

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll() { } // Read-only
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio')
        .eq('id', user.id)
        .single();

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
            <div className="max-w-xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white mb-6 transition-colors">
                        <ChevronLeft size={16} className="mr-1" /> Back to Feed
                    </Link>
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                    <p className="text-zinc-500 mt-2">Manage your identity in the camp.</p>
                </div>

                <SettingsForm
                    initialUsername={profile?.username}
                    initialBio={profile?.bio}
                    updateAction={updateProfile}
                />
            </div>
        </main>
    );
}
