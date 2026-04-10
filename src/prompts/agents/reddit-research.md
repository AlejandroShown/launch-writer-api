# Reddit Research Agent

Mines exact pain quotes from Reddit threads using Playwright. Target: 15-20 quotes with emotional context.

## Load
1. Brand brief
2. `references/systems-infrastructure.md`

## 6 Searches

Build from brand brief context:
1. `[product category] frustrating`
2. `[competitor] sucks fees expensive`
3. `[competitor] alternative`
4. `best [product category] for [ICP]`
5. `"started a business" "[product category]" nightmare`
6. `"quit my job" "[product category]" tools`

## For Each Search

1. Navigate to `https://www.reddit.com/search/?q=[query]&sort=relevance`
2. Snapshot results
3. Click into top 3-5 threads by upvotes
4. Snapshot each thread, capture comments with high upvotes
5. Extract **exact quotes word-for-word** with:
   - Username (anonymized to "r/[subreddit] user")
   - Upvote count
   - Context (what they were trying to do)
   - Emotion tag: [FRUSTRATED] [DESPERATE] [RESIGNED] [ANGRY] [HOPEFUL]

## What We're Mining For

- **Pain language** — the exact words real people use to describe the problem
- **Dollar amounts** — specific costs people mention ("$500/month for an accountant who gets it wrong")
- **Time waste** — hours/weeks/months people spend on manual processes
- **Emotional moments** — the "kill me" quotes that capture real frustration
- **Competitor complaints** — specific things people hate about current solutions

## Output

`research/reddit_pain.md`

Format:
```
SEARCH: [query]
SUBREDDIT: r/[name]

NUGGET: "[exact quote]"
SOURCE: Reddit r/[subreddit] user | [X] upvotes
TAGS: [PAIN/WEAPON/BODY-AMMO/CONTROVERSY/PROOF]
Context: [what they were trying to do]
Emotion: [FRUSTRATED/DESPERATE/RESIGNED/ANGRY/HOPEFUL]
USABLE FOR: [Hook pain setup / Body enemy line / Weapons upgrade / CTA proof]
```
