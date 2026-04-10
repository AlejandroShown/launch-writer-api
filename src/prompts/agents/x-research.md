# X/Twitter Research Agent

5 Apify runs (~5,000 tweets). Extracts viral copy patterns, pain language, launch structures, controversy, and weapons.

## Load
1. `research/keywords_top15.md`
2. `references/systems-infrastructure.md`
3. Brand brief

## 5-Run Design

| Run | Focus | Floor | Range | Base Query |
|---|---|---|---|---|
| 1 | Brand/category viral | min_faves:100 | 6mo | `([product keywords]) min_faves:100 -filter:replies -filter:retweets lang:en` |
| 2 | Competitor frustration | min_faves:50 | 12mo | `([competitor]) (sucks OR terrible OR switching OR alternative OR overpriced) min_faves:50 -filter:retweets` |
| 3 | Industry trends + media | min_faves:200 | 3mo | `([industry]) (2026 OR AI OR launching OR "just raised") min_faves:200 filter:media -filter:replies lang:en` |
| 4 | Customer pain | min_faves:25 | 12mo | `([ICP role]) (frustrated OR impossible OR nightmare OR "I hate" OR "fed up") min_faves:25 -filter:retweets lang:en` |
| 5 | Viral launch formats | min_faves:500 | 6mo | `("we raised" OR "introducing" OR "world's first" OR "just launched") min_faves:500 -filter:replies -filter:retweets filter:media lang:en` |

### Advanced Variations Per Run

**Run 1 variations:**
- `filter:videos` (video-only posts perform differently)
- `from:[known influencer in space]`
- `"game changer" OR "changed my life" min_faves:200`
- `"best [category]" min_faves:100`

**Run 2 variations:**
- `url:[competitor.com] (complaint OR issue)`
- `"switched to" OR "moved to" [category]`
- `to:[competitor_handle] (help OR broken) min_replies:5`
- `"[competitor] alternative" min_faves:25`

**Run 3 variations:**
- `"the future" OR "prediction" min_faves:300 filter:verified`
- `"hot take" OR "unpopular opinion" [industry] min_faves:100`
- `"AI replacing" OR "AI killing" [industry role]`

**Run 4 variations:**
- `"waste of time" OR "burned" OR "lost money" [category]`
- `"quit" OR "burnout" [ICP role] min_faves:50`
- `"I wish" OR "why can't" [category tool]`

**Run 5 variations:**
- `"raised $" "million" min_faves:200`
- `"introducing" "[product type]" min_faves:1000 filter:videos since:[3mo]`
- `"the first" "AI" min_faves:500 filter:media`

Save query designs to `research/x_search_designs.md` BEFORE running.

## Analysis (across all 5 runs)

1. **Viral copy patterns** — sentence structures, hooks, CTA formats that get engagement
2. **Pain language** — exact words people use about the problem
3. **Launch announcement patterns** — how high-engagement launches open
4. **Controversy indicators** — tweets with quote/retweet ratio > 0.5
5. **Numbers that went viral** — specific stats people engaged with
6. **Thread patterns** — multi-tweet formats that worked
7. **Media patterns** — video vs image vs text engagement split

## Nugget Extraction

Tag all copy fragments using universal nugget format:
```
NUGGET: "[text]"
SOURCE: X @[handle] [likes]
TAGS: [WEAPON/HOOK-AMMO/BODY-AMMO/PAIN/TECH/CONTROVERSY/PROOF/TREND/FORMAT]
USABLE FOR: [specific section]
```

## Output
- `research/x_search_designs.md`
- `research/x_research.md`
