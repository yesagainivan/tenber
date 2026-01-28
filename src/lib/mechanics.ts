/**
 * Tenber Core Mechanics
 * 
 * Logic for "Lazy Decay" and Vitality calculation.
 * 
 * Formula:
 * Vitality decays exponentially from its last known value towards the "Target Level" (Total Staked).
 * V(t) = S + (V(t0) - S) * e^(-λ * dt)
 * 
 * where:
 * S = Total Staked Conviction (The "Sustainability Level")
 * V(t0) = Vitality at last update
 * dt = Time elapsed in hours (or arbitrary time units)
 * λ (Lambda) = Decay constant (how fast it adjusts)
 */

import { differenceInMilliseconds } from 'date-fns';

// DECAY_CONSTANT (Lambda)
// Higher = faster decay.
// 0.1 means ~10% gap closure per unit time.
// Let's Calibrate: We want ideas to react meaningfully in hours, not seconds.
// If unit is HOURS.
export const DECAY_CONSTANT = 0.5; // Half-life approx 1.4 hours

export interface DecayState {
    total_staked: number;        // S
    vitality_at_last_update: number; // V(t0)
    last_decay_update: Date;     // t0
}

/**
 * Calculates the current vitality of an idea based on its last known state and current time.
 */
export function calculateVitality(state: DecayState, now: Date = new Date()): number {
    const { total_staked: S, vitality_at_last_update: V_t0, last_decay_update: t0 } = state;

    // 1. Calculate elapsed time (dt) in HOURS
    const elapsedMs = differenceInMilliseconds(now, t0);
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    if (elapsedHours <= 0) return V_t0;

    // 2. Apply Formula: V(t) = S + (V(t0) - S) * e^(-λ * dt)
    const decayFactor = Math.exp(-DECAY_CONSTANT * elapsedHours);
    const currentVitality = S + (V_t0 - S) * decayFactor;

    // Round to 2 decimal places for sanity
    return Math.round(currentVitality * 100) / 100;
}

/**
 * Returns the text status of an idea based on vitality
 */
export function getVitalityStatus(vitality: number): 'blazing' | 'burning' | 'fading' | 'extinguished' {
    if (vitality > 80) return 'blazing';
    if (vitality > 50) return 'burning';
    if (vitality > 10) return 'fading';
    return 'extinguished';
}
