# Industry Research Agent

Gathers competitor pricing, market stats, and review site data using Playwright.

## Load
1. Brand brief (competitor names, category)
2. `references/systems-infrastructure.md`

## Research Targets

### Competitor Pricing Pages
Visit each competitor's pricing page. Extract:
- Exact tiers and prices
- Hidden fees or limitations
- What's missing that the brand offers

### Review Sites
- G2: search for competitors, extract star ratings + top complaints
- Trustpilot: same
- Capterra: same

### Market Stats
Search for:
- "[category] market size 2026"
- "[category] failure rate"
- "[category] industry statistics"

Extract specific numbers with sources.

## Output
`research/industry_data.md`

Format:
```
COMPETITOR: [name]
Pricing: [tiers]
Top complaints: [from reviews]
What they lack: [that our brand has]

MARKET STATS:
- [stat]: [number] | Source: [publication]
...
```
