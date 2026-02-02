export interface Idea {
    id: string;
    title: string;
    description: string;
    category: string;
    vitality: number;
    totalStaked: number;
    userStake?: number;
    authorId?: string;
    author?: {
        username: string | null;
        avatar_url: string | null;
    };
}

export interface DecayState {
    total_staked: number;
    vitality_at_last_update: number;
    last_decay_update: Date;
}

// Half-life of 12 hours? 
// N(t) = N0 * (1/2)^(t / t_half)
const HALF_LIFE_HOURS = 12;

export function calculateVitality(state: DecayState, now: Date): number {
    const elapsedHours = (now.getTime() - state.last_decay_update.getTime()) / (1000 * 60 * 60);

    // Lazy Decay Formula:
    // Vitality tends towards Total Staked over time.
    // If V > S, it decays down.
    // If V < S, it grows up (if staked).

    // Simple Exponential Decay towards Target (S)
    // V(t) = S + (V0 - S) * e^(-lambda * t)

    const lambda = Math.log(2) / HALF_LIFE_HOURS; // Decay constant
    const currentParam = Math.exp(-lambda * elapsedHours);

    const currentVitality = state.total_staked + (state.vitality_at_last_update - state.total_staked) * currentParam;

    return Math.max(0, currentVitality);
}

export function getVitalityStatus(vitality: number): 'blazing' | 'burning' | 'smoldering' | 'dying' {
    if (vitality > 80) return 'blazing';
    if (vitality > 50) return 'burning';
    if (vitality > 20) return 'smoldering';
    return 'dying';
}
