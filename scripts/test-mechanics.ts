
import { calculateVitality, getVitalityStatus } from '../src/lib/mechanics';

console.log("=== Testing Lazy Decay Mechanics ===");

const S = 50; // Total Staked (Equilibrium point)
const V_start = 100; // Starting Vitality
const now = new Date();

// Test cases: elapsed hours -> expected direction
const scenarios = [
    { hours: 0, desc: "Immediate" },
    { hours: 1, desc: "1 Hour (Should decay)" },
    { hours: 10, desc: "10 Hours (Closer to S)" },
    { hours: 24, desc: "24 Hours (Approaching S)" },
    { hours: 100, desc: "Long Term (Should be ~S)" },
];

scenarios.forEach(({ hours, desc }) => {
    const past = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const v = calculateVitality({
        total_staked: S,
        vitality_at_last_update: V_start,
        last_decay_update: past
    }, now);

    console.log(`[${desc}] T-${hours}h: Vitality = ${v} (Status: ${getVitalityStatus(v)})`);
});

console.log("\n=== Testing Growth (Staked > Current) ===");
// Case where S > V (e.g. someone staked a lot)
const S_high = 200;
const V_low = 50;
const v_growth = calculateVitality({
    total_staked: S_high,
    vitality_at_last_update: V_low,
    last_decay_update: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
}, now);
console.log(`[Growth] T-2h, Start=50, Target=200: Vitality = ${v_growth}`);
