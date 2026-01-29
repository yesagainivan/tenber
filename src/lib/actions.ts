'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { calculateVitality } from './mechanics';

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

    // 1. Get Idea State & User Budget
    const { data: idea } = await supabase.from('ideas').select('*').eq('id', ideaId).single();
    const { data: profile } = await supabase.from('profiles').select('conviction_budget').eq('id', user.id).single();
    const { data: currentStake } = await supabase.from('stakes').select('amount').eq('idea_id', ideaId).eq('user_id', user.id).single();

    const oldUserStake = currentStake?.amount || 0;
    const budget = profile?.conviction_budget || 0;

    // Check Budget
    // Available = Budget + OldStake
    // New Cost = amount
    // If amount > available, error
    if (amount > (budget + oldUserStake)) {
        throw new Error('Insufficient conviction budget');
    }

    // 2. Calculate New Vitality (Lazy Update)
    // We must "catch up" the vitality to NOW before applying the new stake
    const now = new Date();
    const freshVitality = calculateVitality({
        total_staked: idea.total_staked,
        vitality_at_last_update: idea.vitality_at_last_update,
        last_decay_update: new Date(idea.last_decay_update)
    }, now);

    // 3. Update Stakes Table
    if (amount === 0) {
        await supabase.from('stakes').delete().eq('idea_id', ideaId).eq('user_id', user.id);
    } else {
        await supabase.from('stakes').upsert({
            idea_id: ideaId,
            user_id: user.id,
            amount: amount,
            created_at: new Date().toISOString()
        }, { onConflict: 'user_id,idea_id' });
    }

    // 4. Update Idea Table
    const diff = amount - oldUserStake;
    const newTotalStaked = idea.total_staked + diff;

    await supabase.from('ideas').update({
        current_vitality: freshVitality, // Snapshot current value
        vitality_at_last_update: freshVitality,
        total_staked: newTotalStaked,
        last_decay_update: now.toISOString()
    }).eq('id', ideaId);

    // 5. Update User Profile Budget?
    // Wait, the 'conviction_budget' in profile is likely the TOTAL cap (100).
    // The "Used" amount is sum(stakes).
    // Or is it "Remaining"?
    // The implementation plan says "Allocated their 100 points".
    // Usually convenient to store "Remaining" or just calculate "Used" on the fly?
    // For MVP, let's assume 'conviction_budget' is the MAX (100).
    // We verify sum(stakes) <= 100.

    // Stricter Check:
    const { data: allStakes } = await supabase.from('stakes').select('amount').eq('user_id', user.id);
    const totalUsed = (allStakes?.reduce((sum, s) => sum + s.amount, 0) || 0) - oldUserStake + amount;

    if (totalUsed > 100) {
        throw new Error('Over conviction budget (Max 100)');
    }

    revalidatePath('/');
}
