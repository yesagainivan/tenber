'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { calculateVitality } from './mechanics';
import { getComments } from './db';

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
                        // This can be ignored.
                    }
                },
            },
        }
    );
}

export async function createIdea(prevState: any, formData: FormData): Promise<{ error?: string; success?: boolean }> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: 'You must be logged in to create an idea.' };
        }

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!title || title.length < 3) {
            return { error: 'Title must be at least 3 characters.' };
        }

        const { error } = await supabase.from('ideas').insert({
            title,
            description,
            created_by: user.id,
            current_vitality: 100.0,
            vitality_at_last_update: 100.0,
            total_staked: 0
        });

        if (error) {
            console.error('Database Error:', error);
            return { error: `Failed to kindle idea: ${error.message}` };
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        return { error: 'Unexpected error occurred.' };
    }
}

export async function stakeIdea(ideaId: string, amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Use atomic RPC function
    const { error: rpcError } = await supabase.rpc('stake_idea', {
        p_idea_id: ideaId,
        p_user_id: user.id,
        p_amount: amount,
        p_budget_limit: 100 // Hardcoded for MVP
    });

    if (rpcError) {
        console.error("Staking RPC Error:", rpcError);
        throw new Error(rpcError.message || 'Staking failed');
    }

    revalidatePath('/');
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const username = formData.get('username') as string;
    const bio = formData.get('bio') as string;

    // Validate username (simple regex: alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
        return { error: 'Username must be 3-20 characters, alphanumeric or underscores.' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ username, bio })
        .eq('id', user.id);

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { error: 'Username already taken.' };
        }
        return { error: 'Failed to update profile.' };
    }

    revalidatePath('/settings');
    return { success: true };
}

export async function addComment(ideaId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!content || content.trim().length === 0) {
        throw new Error('Comment cannot be empty');
    }

    const { error } = await supabase.from('comments').insert({
        idea_id: ideaId,
        user_id: user.id,
        content: content.trim()
    });

    if (error) {
        console.error("Comment Error:", error);
        throw new Error('Failed to post comment');
    }

    revalidatePath('/'); // Revalidate feed (and ideally specific idea path if we had one)
}

export async function fetchComments(ideaId: string) {
    return await getComments(ideaId);
}

export async function deleteComment(commentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Redundant due to RLS but good practice

    if (error) {
        throw new Error('Failed to delete comment');
    }

    revalidatePath('/');
}
