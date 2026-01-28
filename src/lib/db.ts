import { supabase } from './supabase';
import { calculateVitality, DecayState } from './mechanics';
import { Idea } from '@/components/IdeaCard';

export async function getIdeas(): Promise<Idea[]> {
    // 1. Fetch raw ideas from DB
    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('current_vitality', { ascending: false }); // Sort by cached/last known

    if (error) {
        console.error('Error fetching ideas:', error);
        return [];
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
            // userStake: 0 // TODO: Fetch user specific stake
        };
    });

    // 3. Re-sort based on fresh vitality
    return ideas.sort((a, b) => b.vitality - a.vitality);
}
