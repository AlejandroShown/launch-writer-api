# Research Compiler Agent

Compiles raw research from YouTube, X, Reddit, and Industry agents into the structured Research Brief and Nugget Base that all writing agents consume.

## Load
- ALL files in `research/` directory (youtube_default, youtube_filtered_12mo, youtube_filtered_1mo, youtube_api, x_research, reddit_pain, industry_data)
- Brand brief

## Nugget Base Format

Extract every usable copy fragment from all research. Each nugget follows this format:

```
NUGGET: "[exact copy fragment or phrasing]"
SOURCE: [YouTube title / X post @handle / Reddit r/sub quote / Industry stat]
TAGS: [one or more of: WEAPON, HOOK-AMMO, BODY-AMMO, PAIN, TECH, CONTROVERSY, PROOF, TREND, FORMAT]
USABLE FOR: [Hook type 1-5 / Body demo step / Body pain setup / CTA proof stat / Weapons upgrade]
```

**Tag definitions:**
- WEAPON: Intense phrasing that could upgrade a body line
- HOOK-AMMO: Title structure or claim that could fuel a hook
- BODY-AMMO: Demo narration language, technical phrasing, flow patterns
- PAIN: Customer frustration language (exact words real people use)
- TECH: Technical terminology or specific technology references
- CONTROVERSY: Provocative angles, industry debates, hot takes
- PROOF: Statistics, numbers, metrics that add credibility
- TREND: Current/emerging topics with viral potential
- FORMAT: Viral video format that could be adapted for hooks

Target: 50-100 nuggets across all sources.

## Ammunition Index

After the nugget base, compile an Ammunition Index organized by what each writing agent needs:

```
AMMUNITION INDEX

HOOK AMMUNITION:
- Title patterns from ceiling videos: [list top 10 with what makes them work]
- Launch structures from X: [list top 5 high-engagement patterns]
- Viral format candidates: [list 2-3 formats that could work for this brand]
- Key numbers for hooks: [raise amount, user count, funding, speed metrics]

BODY AMMUNITION:
- Pain language (exact Reddit quotes): [top 10 quotes with emotion tags]
- Technical angles from industry research: [specific technologies, competitor gaps]
- Demo scenario ideas: [specific business types + goals from research]
- Competitor weaknesses: [what people hate about current solutions]

PROOF AMMUNITION:
- Industry stats with sources: [top 5]
- Competitor pricing: [exact tiers and gaps]
- Market size/growth: [numbers]

CTA AMMUNITION:
- Giveaway ideas from research: [tools, datasets, guides that could work]
- "Right operator" outcome ideas: [specific dollar outcomes from research]

CONTROVERSY AMMUNITION:
- Industry hot takes from X: [provocative angles with engagement data]
- Competitor criticisms from Reddit: [what people openly complain about]
- Emerging debates: [trends people are arguing about]
```

## Output
- `research/nugget_base.md` — all nuggets in standard format
- `research/research_brief.md` — ammunition index + compiled summary
- Write both to Google Doc Tab 1 (Research)
