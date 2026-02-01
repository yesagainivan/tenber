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
        const category = (formData.get('category') as string) || 'Random';

        if (!title || title.length < 3) {
            return { error: 'Title must be at least 3 characters.' };
        }

        const { error } = await supabase.from('ideas').insert({
            title,
            description,
            category,
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

    // Fetch the specific updated idea to return to client (avoids full refetch)
    // We reuse the logic from getIdeas but for a single ID
    // Note: This is efficient because we drive the UI state update directly

    // 1. Fetch updated row
    const { data: row } = await supabase
        .from('ideas')
        .select('*, profiles!created_by(username, avatar_url)')
        .eq('id', ideaId)
        .single();

    if (!row) throw new Error('Idea not found after staking');

    // 2. Fetch User Stake for this idea
    const { data: stake } = await supabase
        .from('stakes')
        .select('amount')
        .eq('user_id', user.id)
        .eq('idea_id', ideaId)
        .single();

    // 3. Calculate Decay
    const now = new Date();
    const state = {
        total_staked: row.total_staked,
        vitality_at_last_update: row.vitality_at_last_update,
        last_decay_update: new Date(row.last_decay_update)
    };
    const freshVitality = calculateVitality(state, now);

    const updatedIdea: Idea = {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        vitality: freshVitality,
        totalStaked: row.total_staked,
        userStake: stake?.amount || 0,
        author: row.profiles
    };

    // 4. Calculate Budget
    const remainingBudget = await getRemainingBudget(user.id);

    revalidatePath('/');
    return { success: true, idea: updatedIdea, budget: remainingBudget };
}

// Helper for internal use if needed (duplicating getRemainingBudget logic for scope)
async function getRemainingBudget(userId: string): Promise<number> {
    const supabase = await createClient();
    const { data: stakes } = await supabase.from('stakes').select('amount').eq('user_id', userId);
    const used = stakes?.reduce((sum, s) => sum + s.amount, 0) || 0;
    return Math.max(0, 100 - used);
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

export async function addComment(ideaId: string, content: string, parentId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!content || content.trim().length === 0) {
        throw new Error('Comment cannot be empty');
    }

    const { error } = await supabase.from('comments').insert({
        idea_id: ideaId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null // Explicitly handle undefined -> null
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

// -----------------------------------------------------------------------------
// Server Actions for Data Fetching (Secure & Consistent Time)
// -----------------------------------------------------------------------------

import { Idea } from '@/lib/mechanics';

export async function getIdeas(currentUserId_unused?: string, category?: string, search?: string): Promise<Idea[]> {
    // Note: currentUserId_unused is preserved for signature compatibility but ignored for security.
    // We derive identity from the session cookie.

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch raw ideas from DB
    let query = supabase
        .from('ideas')
        .select('*, profiles!created_by(username, avatar_url)')
        .order('current_vitality', { ascending: false });

    if (category && category !== 'All') {
        query = query.eq('category', category);
    }

    if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
    }

    const { data: ideasData, error } = await query;

    if (error) {
        console.error('Error fetching ideas:', error);
        return [];
    }

    // 1.5 Fetch User Stakes if logged in
    let userStakes: Record<string, number> = {};
    if (user) {
        const { data: stakes } = await supabase
            .from('stakes')
            .select('idea_id, amount')
            .eq('user_id', user.id);

        if (stakes) {
            stakes.forEach(s => {
                userStakes[s.idea_id] = s.amount;
            });
        }
    }

    // 2. Server-side Lazy Decay Calculation
    // Uses server time to prevent client drift.
    // Logic remains "fresh on read".
    const now = new Date();

    const ideas = ideasData.map((row) => {
        const state = {
            total_staked: row.total_staked,
            vitality_at_last_update: row.vitality_at_last_update,
            last_decay_update: new Date(row.last_decay_update)
        };

        const freshVitality = calculateVitality(state, now);

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            vitality: freshVitality,
            totalStaked: row.total_staked,
            userStake: userStakes[row.id] || 0,
            author: row.profiles
        };
    });

    // 3. Re-sort based on fresh vitality
    return ideas.sort((a, b) => b.vitality - a.vitality);
}
