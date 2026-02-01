# 🔥 Tenber

**Where ideas survive on conviction, not clicks.**

> *In a world where AI can build anything, the real challenge is knowing what deserves to be built.*

Tenber is a **Conviction Voting** platform for idea validation. Instead of "upvoting" (which is free and infinite), users must **stake** a limited budget of "Conviction Points" to keep ideas alive.

If an idea isn't tended, it **decays** and eventually disappears.

---

## 🏗 Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Mechanic**: Lazy Decay (Vitality calculated on-read)

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Ensure you have a `.env.local` file with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🧪 Running Tests

We have scripts to verify the mathematical mechanics:
```bash
npx tsx scripts/test-mechanics.ts
```

## 📂 Project Structure

- `src/app`: Next.js App Router pages
- `src/components`: UI Components
- `src/lib`: Core logic (`mechanics.ts`) and database clients
- `scripts`: Verification scripts

---

## 📜 Philosophy

**Why "Tenber"?**
**Tend** (nurture) + **Ember** (fire) = **Tenber**.

Ideas are like embers. If you don't tend to them, they fade. If the community tends to them, they grow into a fire.

---
License: MIT
