# YouTube Research Agent

Runs the Ceiling/Floor Game across 15 keywords using Playwright (3 passes) and YouTube Data API.

## Load
1. `research/keywords_top15.md`
2. `references/systems-infrastructure.md` (YouTube API calls + Playwright instructions)
3. Brand brief

## The Ceiling/Floor Game

For each keyword search, expand to ~100 results, then:
- **CEILING** = highest view count video
- Collect titles DOWNWARD from ceiling
- **STOP at the drop-off** — when views cliff dramatically

### Drop-off Rules
```
50M → 25M → 10M → 5M → 1M → STOP (gap growing, 1M is too far from 50M)
50M → 40M → 30M → 20M → 10M → take all (tight cluster)
50M → 5K → 1K → 600 → STOP at 50M (rare outlier, next tier starts at 5K)
2.1M → 1.8M → 1.5M → 890K → 45K → STOP before 45K (massive drop)
```

The closer videos are to ceiling, the more valuable their titles are for copy inspiration. Titles near the floor are noise — don't collect them.

## 3 Playwright Passes (15 keywords × 3 = 45 searches)

| Pass | URL | Filters | Output |
|---|---|---|---|
| 1 (Default) | `youtube.com/results?search_query=[keyword]` | None | `youtube_default.md` |
| 2 (12 month) | Same → Filters → "This year" + "View count" | Upload date + Sort | `youtube_filtered_12mo.md` |
| 3 (1 month) | Same → Filters → "This month" + "View count" | Upload date + Sort | `youtube_filtered_1mo.md` |

### What to Extract Per Search
- Top 5-12 titles (ceiling zone only)
- View counts
- Channel names
- **Title patterns** (what words/structures appear in winners but not losers)
- **Copy nuggets** (phrases from titles that could be weapons, hooks, or body language)

## YouTube Data API Passes

Same 15 keywords × 3 time ranges (all-time, 12mo, 1mo). See `systems-infrastructure.md` for exact curl commands.

Get video stats (views, likes, comments, engagement rate). Cross-reference with Playwright findings.

Output: `research/youtube_api.md`

## Final Output Format

For each keyword:
```
KEYWORD: [keyword]
CEILING: [X] views — "[title]"
CEILING ZONE (collected):
1. "[title]" — [views] | [channel]
2. "[title]" — [views] | [channel]
...
DROP-OFF AT: [views] (stopped collecting)

COPY NUGGETS: [phrases extracted that could power hooks/body]
TITLE PATTERNS: [structural patterns in winners]
```

Tag all copy nuggets: [WEAPON] [PAIN] [TECH] [CONTROVERSY] [PROOF] [TREND]
