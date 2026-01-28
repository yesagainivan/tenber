'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function createIdea(prevState: any, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    try {
        const supabase = await createClient();

        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'You must be logged in to create an idea.' };
        }

        // 2. Validate Input
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!title || title.length < 3) {
            return { error: 'Title must be at least 3 characters.' };
        }

        // 3. Insert Idea (Initial Vitality = 100, Total Staked = 0)
        // Note: 'created_by' is required by our schema.
        const { error } = await supabase.from('ideas').insert({
            title,
            description,
            created_by: user.id,
            conviction_total: 0,
            vitality: 100.0, // Initial burst
            vitality_at_last_update: 100.0,
            total_staked: 0
        });

        if (error) {
            console.error('Database Error:', error);
            return { error: 'Failed to kindle idea. Try again.' };
        }

        // 4. Revalidate Feed
        revalidatePath('/');
        return { success: true };
    } catch (err) {
        return { error: 'Unexpected error occurred.' };
    }
}
