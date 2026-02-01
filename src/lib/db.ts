import { supabase } from './supabase';
import { calculateVitality, DecayState } from './mechanics';
import { Idea } from '@/components/IdeaCard';


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

export type Profile = {
    id: string;
    username: string | null;
    bio: string | null;
    avatar_url: string | null;
    reputation: number;
    created_at?: string;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error) return null;
    return data;
}

export async function getUserStakedIdeas(userId: string): Promise<Idea[]> {
    // 1. Get stakes for this user
    const { data: stakes, error } = await supabase
        .from('stakes')
        .select('*, ideas(*, profiles!created_by(username, avatar_url))') // Join ideas AND their authors
        .eq('user_id', userId)
        .gt('amount', 0); // Only active stakes

    if (error || !stakes) return [];

    // 2. Map similarly to getIdeas with lazy decay calc
    const now = new Date();

    const ideas = stakes.map((stake) => {
        const row = stake.ideas;
        if (!row) return null;

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
            category: row.category,
            vitality: freshVitality,
            totalStaked: row.total_staked,
            userStake: stake.amount, // The amount this user staked
            author: row.profiles
        };
    }).filter(Boolean) as Idea[];

    return ideas.sort((a, b) => (b.userStake || 0) - (a.userStake || 0)); // Sort by how much THEY staked
}

export type Comment = {
    id: string;
    content: string;
    created_at: string;
    parent_id: string | null;
    author: {
        username: string | null;
        avatar_url: string | null;
    };
}

export async function getComments(ideaId: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((row: any) => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        parent_id: row.parent_id,
        author: row.profiles
    }));
}
