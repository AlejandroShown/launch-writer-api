# Systems & Infrastructure Reference

> Exact API calls, file structures, tooling checks, and data flow.
> Every agent that needs to make API calls or write to Google Docs reads this file.

---

## ENVIRONMENT VARIABLES REQUIRED

| Variable | Purpose | Used By |
|---|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 | YouTube Research Agent |
| `APIFY_TOKEN` | Apify actor runs (X/Twitter scraping) | X Research Agent, Giveaway Manager |

### Values (export these at pipeline start)
```bash
export YOUTUBE_API_KEY="AIzaSyClLg3JytasKVLNTcrVqh1yLi1K08Zi4x8"
export APIFY_TOKEN="apify_api_CooXecXKKdlzLLNM497UKhoqRBn3Tf3Iq0vI"
export APIFY_TOKEN_REDDIT="apify_api_FeAloh4dkrZ9Qq87iu9fndHzuYvMch3yH1Nl"
```

**Note:** Reddit research uses a separate Apify token (`APIFY_TOKEN_REDDIT`), not Playwright.

### Apify Actor IDs (ALWAYS use these — never guess)
- **X/Twitter:** `scrape.badger/twitter-tweets-scraper` (mode: `"Advanced Search"`)
- **Reddit:** `harshmaur/reddit-scraper` (token: `APIFY_TOKEN_REDDIT`)

### Budget Constraints
- **Reddit:** 1,000 results total across all runs, max spend $0.80 per launch
- Distribute across 6 searches (~166 results each)

---

## TOOL DEPENDENCIES

| Tool | Purpose | Check Command |
|---|---|---|
| **Playwright MCP** | Browser research (YouTube, Reddit, industry sites) | Look for `browser_navigate`, `browser_click`, `browser_snapshot` in tools |
| **gws CLI** | Google Docs create/read/write | `gws auth status` → must show `token_valid: true` |
| **Node.js** | JSON processing, data extraction | `node -v` |
| **curl** | HTTP calls to YouTube API and Apify API | `curl --version` |

**Tooling check runs at Step -1.** Pipeline does NOT start without all tools confirmed.

---

## FILE STRUCTURE (Local — Every Launch)

```
~/Desktop/[BRAND]-launch/
├── INDEX.md                    (file manifest, doc IDs, run status)
├── brief.md                    (extracted brand brief)
├── research/
│   ├── keywords_50.md          (all 50 keywords scored)
│   ├── keywords_top15.md       (selected 15 + reasoning)
│   ├── youtube_default.md      (Playwright pass 1: default sort)
│   ├── youtube_filtered_12mo.md (Playwright pass 2: this year + view count)
│   ├── youtube_filtered_1mo.md  (Playwright pass 3: this month + view count)
│   ├── youtube_api.md          (API results with stats)
│   ├── reddit_pain.md          (exact quotes from threads)
│   ├── industry_data.md        (competitor pricing, stats, reviews)
│   ├── x_search_designs.md     (5 search query designs)
│   ├── x_research.md           (processed tweet results)
│   └── research_brief.md       (compiled ammunition index)
├── hooks/
│   ├── hooks_draft.md
│   └── hooks_approved.md
├── body/
│   ├── body_draft.md
│   ├── body_approved.md
│   ├── weapons_done.md
│   ├── controversy_done.md
│   ├── technical_done.md
│   ├── flow_done.md
│   └── body_final.md
├── giveaway/
│   ├── giveaway_draft.md
│   ├── giveaway_approved.md
│   └── x_giveaway_reference.md
└── final/
    └── final_script.md
```

**Temp files:** `/tmp/yt_search_[N].json`, `/tmp/yt_stats_[N].json`, `/tmp/x_run_[N].json`, `/tmp/x_run_[N]_processed.txt`, `/tmp/giveaway_run_[N].json`, `/tmp/output.txt`, `/tmp/payload.json`

**Rule:** Write local .md file FIRST, then write to Google Doc. Local file = source of truth.

---

## GOOGLE DOC PROTOCOL (gws CLI)

### Create doc
```bash
gws docs documents create --json '{"title": "[BRAND NAME]: LAUNCH SCRIPT"}'
```
Extract `documentId` → save as `DOC_ID` in INDEX.md.

### Move to Drive folder
```bash
gws drive files update --params '{"fileId": "[DOC_ID]", "addParents": "1fLHLA9efC1joVuMJns-pE_sBRb5pi5ZO", "removeParents": "root"}'
```

### Get end index (for appending)
```bash
END_INDEX=$(gws docs documents get --params "{\"documentId\": \"$DOC_ID\"}" 2>/dev/null | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));const body=d.body||d.tabs?.[0]?.documentTab?.body;console.log(body.content[body.content.length-1].endIndex-1)")
```

### Append content
```bash
gws docs documents batchUpdate --params "{\"documentId\": \"$DOC_ID\"}" --json "{\"requests\":[{\"insertText\":{\"location\":{\"index\":$END_INDEX},\"text\":\"[CONTENT]\"}}]}"
```

### Replace all content (Final Review uses this)
```bash
END_INDEX=$(gws docs documents get --params "{\"documentId\": \"$DOC_ID\"}" 2>/dev/null | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));const body=d.body||d.tabs?.[0]?.documentTab?.body;console.log(body.content[body.content.length-1].endIndex-1)")
gws docs documents batchUpdate --params "{\"documentId\": \"$DOC_ID\"}" --json "{\"requests\":[{\"deleteContentRange\":{\"range\":{\"startIndex\":1,\"endIndex\":$END_INDEX}}},{\"insertText\":{\"location\":{\"index\":1},\"text\":\"[CLEAN CONTENT]\"}}]}"
```

### Safe JSON escaping
```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('/tmp/output.txt', 'utf8');
const payload = JSON.stringify({requests: [{insertText: {location: {index: 1}, text: content}}]});
fs.writeFileSync('/tmp/payload.json', payload);
"
gws docs documents batchUpdate --params "{\"documentId\": \"$DOC_ID\"}" --json "$(cat /tmp/payload.json)"
```

**Doc structure:** 1 doc with 4 tabs — Research, Working Script, Final Script, Second Draft.
**Drive folder ID:** `1fLHLA9efC1joVuMJns-pE_sBRb5pi5ZO`

---

## YOUTUBE DATA API CALLS

### Search endpoint
```bash
curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&q=[keyword]&type=video&maxResults=50&order=viewCount&key=$YOUTUBE_API_KEY" > /tmp/yt_search_[N].json
```

### Get video stats
```bash
VIDEO_IDS=$(node -e "const d=JSON.parse(require('fs').readFileSync('/tmp/yt_search_[N].json','utf8'));console.log(d.items.map(i=>i.id.videoId).join(','))")
curl -s "https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=$VIDEO_IDS&key=$YOUTUBE_API_KEY" > /tmp/yt_stats_[N].json
```

### Process stats
```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('/tmp/yt_stats_[N].json', 'utf8'));
const results = data.items.map(v => ({
  title: v.snippet.title,
  channel: v.snippet.channelTitle,
  views: parseInt(v.statistics.viewCount || 0),
  likes: parseInt(v.statistics.likeCount || 0),
  comments: parseInt(v.statistics.commentCount || 0),
  published: v.snippet.publishedAt,
  engagementRate: (parseInt(v.statistics.likeCount||0) + parseInt(v.statistics.commentCount||0)) / Math.max(parseInt(v.statistics.viewCount||1), 1)
})).sort((a,b) => b.views - a.views);
results.forEach((v,i) => {
  console.log('---');
  console.log('RANK: ' + (i+1));
  console.log('TITLE: ' + v.title);
  console.log('VIEWS: ' + v.views.toLocaleString());
  console.log('CHANNEL: ' + v.channel);
  console.log('ENGAGEMENT: ' + (v.engagementRate * 100).toFixed(2) + '%');
});
"
```

### Filtered searches
```bash
# Last 12 months
curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&q=[keyword]&type=video&maxResults=50&order=viewCount&publishedAfter=[ISO_DATE]&key=$YOUTUBE_API_KEY"
# Last month
curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&q=[keyword]&type=video&maxResults=50&order=viewCount&publishedAfter=[ISO_DATE]&key=$YOUTUBE_API_KEY"
```

---

## APIFY API CALLS (X/Twitter)

### Start actor run
```bash
curl -s -X POST "https://api.apify.com/v2/acts/[ACTOR_ID]/runs?token=$APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"searchTerms": ["[QUERY]"], "maxTweets": 1000, "sort": "Top"}'
```

### Poll for completion
```bash
curl -s "https://api.apify.com/v2/actor-runs/[RUN_ID]?token=$APIFY_TOKEN" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
console.log(d.status);
"
```

### Fetch results
```bash
curl -s "https://api.apify.com/v2/datasets/[DATASET_ID]/items?token=$APIFY_TOKEN&limit=1000" > /tmp/x_run_[N].json
```

### Process results (extract top 50)
```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('/tmp/x_run_[N].json', 'utf8'));
const results = data.map(t => ({
  text: t.full_text || t.text,
  likes: t.favorite_count || t.public_metrics?.like_count || 0,
  retweets: t.retweet_count || t.public_metrics?.retweet_count || 0,
  replies: t.reply_count || t.public_metrics?.reply_count || 0,
  quotes: t.quote_count || t.public_metrics?.quote_count || 0,
  author: t.user?.screen_name || t.author?.username || 'unknown',
  followers: t.user?.followers_count || 0,
  verified: t.user?.verified || t.author?.verified || false,
  date: t.created_at,
  hasMedia: !!(t.entities?.media || t.attachments?.media_keys)
})).sort((a,b) => (b.likes + b.retweets) - (a.likes + a.retweets));
const top = results.slice(0, 50);
top.forEach((t,i) => {
  console.log('---');
  console.log('RANK: ' + (i+1));
  console.log('LIKES: ' + t.likes + ' | RT: ' + t.retweets);
  console.log('AUTHOR: @' + t.author + (t.verified ? ' [V]' : ''));
  console.log('TEXT: ' + t.text.replace(/\\\\n/g, ' '));
});
console.log('\\n=== SUMMARY: ' + results.length + ' results ===');
"
```

### X Search Operators Reference
`min_faves:N`, `min_retweets:N`, `since:YYYY-MM-DD`, `until:YYYY-MM-DD`, `filter:links`, `filter:media`, `filter:videos`, `-filter:replies`, `-filter:retweets`, `filter:verified`, `lang:en`, `OR`, `"exact phrase"`, `()` grouping, `-keyword`, `from:username`

### 5-Run Design
| Run | Focus | Floor | Range | Pattern |
|---|---|---|---|---|
| 1 | Brand/category viral | min_faves:100 | 6mo | `([product keywords]) min_faves:100 -filter:replies -filter:retweets lang:en` |
| 2 | Competitor frustration | min_faves:50 | 12mo | `([competitor]) (sucks OR terrible OR switching) min_faves:50 -filter:retweets` |
| 3 | Industry trends | min_faves:200 | 3mo | `([industry]) (AI OR launching OR "just raised") min_faves:200 filter:media lang:en` |
| 4 | Customer pain | min_faves:25 | 12mo | `([role]) (frustrated OR impossible OR nightmare) min_faves:25 -filter:retweets lang:en` |
| 5 | Viral launch formats | min_faves:500 | 6mo | `("we raised" OR "introducing" OR "world's first") min_faves:500 filter:media lang:en` |

### Giveaway Manager Additional Runs (2 runs)
```
Run 1: "and i'll send you" "comment" min_faves:500 -filter:replies -filter:retweets lang:en
Run 2: "retweet" "comment" "giving away" min_faves:500 -filter:replies -filter:retweets lang:en
```

---

## API TOTALS PER LAUNCH

| Source | Calls | Results |
|---|---|---|
| YouTube Playwright | 45 (15 keywords × 3 passes) | ~100 each |
| YouTube Data API | up to 90 | 50 videos per search |
| Apify (X Research) | 5 runs × 1000 tweets | ~5,000 tweets |
| Apify (Giveaway) | 2 runs × 500 tweets | ~1,000 tweets |
| Reddit Playwright | 6 searches + 18-30 thread clicks | 15-20 quotes |
| Industry Playwright | 3-5 sites | Pricing, stats, reviews |

---

## CONTEXT RETENTION PROTOCOL

- **Filesystem IS shared memory** — agents communicate via file paths, not content summaries
- **Orchestrator passes file PATHS, not content** — never summarize agent output to pass to next agent
- **Every agent boot loads:** (1) SOUL.md, (2) its agent instruction file, (3) relevant knowledge-base files, (4) brand brief, (5) agent-specific input files from prior steps
- **Write local file FIRST, Google Doc SECOND**
- **Never launch next agent before verifying current agent's output file exists on disk**
- **Each agent runs in its own context window** (separate subprocess in Claude Code)

---

## PARALLEL RESEARCH

Steps 3-6 (YouTube, X, Reddit, Industry) are INDEPENDENT — they all read keywords_top15.md but don't depend on each other's output. Run them in parallel. Step 7 (Research Compiler) waits for ALL 4 to finish before starting.

```bash
# Launch all 4 in parallel
claude -p "[YouTube research instructions]" --model sonnet &
claude -p "[X research instructions]" --model sonnet &
claude -p "[Reddit research instructions]" --model sonnet &
claude -p "[Industry research instructions]" --model sonnet &
wait  # Wait for all 4 to finish
# Then launch compiler
claude -p "[Research compiler instructions]" --model sonnet
```

---

## ERROR HANDLING

**YouTube API rate limit (403):** Wait 60 seconds, retry. If 3 consecutive 403s, reduce to 10 keywords instead of 15. If still failing, skip API and rely on Playwright results only.

**Apify run fails (FAILED/TIMED_OUT):** Retry the run once. If fails again, adjust the query (lower min_faves, shorter date range). If still fails, skip that run and note it in the research brief.

**Reddit blocks Playwright:** Switch to web search (`site:reddit.com [query]`) as fallback. Extract quotes from search snippets. Lower quality but functional.

**gws CLI auth expired:** Run `gws auth login` and restart from the current step.

**General rule:** Never let one failed research source block the entire pipeline. Note what's missing, compensate with stronger results from other sources, and flag the gap for the user.

