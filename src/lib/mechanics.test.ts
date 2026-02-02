import { describe, it, expect } from 'vitest';
import { calculateVitality, DecayState } from './mechanics';

describe('Lazy Decay Mechanics', () => {
    // Helper to create a date hours ago
    const hoursAgo = (n: number) => {
        const d = new Date();
        d.setHours(d.getHours() - n);
        return d;
    };

    it('should not change vitality if 0 time has passed', () => {
        const now = new Date();
        const state: DecayState = {
            total_staked: 100,
            vitality_at_last_update: 100,
            last_decay_update: now,
        };
        const v = calculateVitality(state, now);
        expect(v).toBeCloseTo(100);
    });

    it('should decay towards total_staked (when V > S)', () => {
        const now = new Date();
        // Started at 100 vitality, but only 0 staked. Checks 12 hours later (one half-life).
        // Formula: V(t) = S + (V0 - S) * (1/2)^(t/12)
        // V(12) = 0 + (100 - 0) * 0.5 = 50
        const state: DecayState = {
            total_staked: 0,
            vitality_at_last_update: 100,
            last_decay_update: hoursAgo(12),
        };
        const v = calculateVitality(state, now);
        expect(v).toBeCloseTo(50, 0); // Approx 50
    });

    it('should decay towards total_staked with partial staking', () => {
        const now = new Date();
        // Started at 100, Staked is 50. 12 hours later.
        // V(12) = 50 + (100 - 50) * 0.5 = 50 + 25 = 75
        const state: DecayState = {
            total_staked: 50,
            vitality_at_last_update: 100,
            last_decay_update: hoursAgo(12),
        };
        const v = calculateVitality(state, now);
        expect(v).toBeCloseTo(75, 0);
    });

    it('should grow towards total_staked (when V < S)', () => {
        const now = new Date();
        // Started at 0 vitality, but recently staked up to 100. 12 hours later.
        // V(12) = 100 + (0 - 100) * 0.5 = 100 - 50 = 50
        // Meaning it "warms up" halfway to its potential.
        const state: DecayState = {
            total_staked: 100,
            vitality_at_last_update: 0,
            last_decay_update: hoursAgo(12),
        };
        const v = calculateVitality(state, now);
        expect(v).toBeCloseTo(50, 0);
    });

    it('should handle large time gaps (vitality converges to staked)', () => {
        const now = new Date();
        // 10 days later (240 hours = 20 half-lives)
        const state: DecayState = {
            total_staked: 42,
            vitality_at_last_update: 1000,
            last_decay_update: hoursAgo(240),
        };
        const v = calculateVitality(state, now);
        expect(v).toBeCloseTo(42, 0);
    });
});
