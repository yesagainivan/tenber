import { supabase } from './supabase';
import { calculateVitality, DecayState } from './mechanics';
import { Idea } from '@/components/IdeaCard';

export async function getIdeas(userId?: string): Promise<Idea[]> {
    // 1. Fetch raw ideas from DB
    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('current_vitality', { ascending: false }); // Sort by cached/last known

    if (error) {
        console.error('Error fetching ideas:', error);
        return [];
    }

    // 1.5 Fetch User Stakes if logged in
    let userStakes: Record<string, number> = {};
    if (userId) {
        const { data: stakes } = await supabase
            .from('stakes')
            .select('idea_id, amount')
            .eq('user_id', userId);

        if (stakes) {
            stakes.forEach(s => {
                userStakes[s.idea_id] = s.amount;
            });
        }
    }

    // 2. Client-side Lazy Decay Calculation
    // In a real high-scale app, this might happen via Edge Functions or on write.
    // For MVP, we calculate "fresh" vitality on read.
    const now = new Date();

    const ideas = data.map((row: any) => {
        const state: DecayState = {
            total_staked: row.total_staked,
            vitality_at_last_update: row.vitality_at_last_update,
            last_decay_update: new Date(row.last_decay_update)
        };

        const freshVitality = calculateVitality(state, now);

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            vitality: freshVitality,
            totalStaked: row.total_staked,
            userStake: userStakes[row.id] || 0
        };
    });

    // 3. Re-sort based on fresh vitality
    return ideas.sort((a, b) => b.vitality - a.vitality);
}

export async function getRemainingBudget(userId?: string): Promise<number> {
    if (!userId) return 0;

    // 1. Get total used
    const { data: stakes } = await supabase
        .from('stakes')
        .select('amount')
        .eq('user_id', userId);

    const used = stakes?.reduce((sum, s) => sum + s.amount, 0) || 0;

    // 2. Get total available (hardcoded 100 for now, or fetch from profile)
    // const { data: profile } = await supabase.from('profiles').select('conviction_budget').eq('id', userId).single();
    // const budget = profile?.conviction_budget || 100;
    const budget = 100;

    return Math.max(0, budget - used);
}
