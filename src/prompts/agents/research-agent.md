# Research Agent — Keyword Generation & Scoring

This agent handles the FIRST phase of research: generating and scoring keywords. Platform-specific research (YouTube, X, Reddit, Industry) is handled by dedicated agents.

## Load
1. Brand brief from `brief.md`
2. `references/systems-infrastructure.md` (for API reference)

## Phase 1: Generate 50 Keywords

Generate across 7 categories:

| Category | Count | What to generate |
|---|---|---|
| Product category terms | 10 | "best [category] for [ICP]", "AI [category] software" |
| Problem/pain terms | 8 | "[category] frustrating", "why [ICP] fail" |
| Competitor terms | 8 | "[Competitor] review 2026", "[Competitor] vs [Competitor]" |
| Target customer world | 8 | "[ICP] income tips", "[ICP] mistakes" |
| Industry trends | 6 | "AI replacing [role]", "future of [industry]" |
| Edgy/controversial | 5 | "why [industry] is a scam", "[industry] horror stories" |
| Launch/announcement style | 5 | "we raised million dollars", "introducing first AI [category]" |

Output: `research/keywords_50.md`

## Phase 2: Score Each Keyword (1-5 on 5 criteria, max 25)

| Criteria | What it measures |
|---|---|
| Viral Potential | Will this surface high-view outlier videos? |
| Nugget Farming Potential | Will searching this keyword surface copy fragments we can steal for hooks, body, weapons, and CTAs? Strong titles, sharp phrasing, technical moments? |
| Novelty / Trending Potential | Is this fresh, trending, news-related? Hot topics with viral energy? |
| Relevance | Direct connection to brand's product/category? |
| Diversity | Unique angle vs other selected keywords? |

Rank all 50. Select top 15 with **diversity enforcement** (no single category gets more than 4 keywords in the top 15).

Output: `research/keywords_top15.md`
