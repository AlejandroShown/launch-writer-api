/**
 * YouTube Data API v3 — search + stats.
 * Replaces the curl calls from systems-infrastructure.md.
 */

interface YouTubeVideo {
  title: string;
  channel: string;
  views: number;
  likes: number;
  comments: number;
  published: string;
  engagementRate: number;
  videoId: string;
}

interface YouTubeSearchResult {
  keyword: string;
  timeRange: string;
  videos: YouTubeVideo[];
}

const API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

async function searchVideos(
  keyword: string,
  maxResults: number = 50,
  publishedAfter?: string
): Promise<{ items: Array<{ id: { videoId: string }; snippet: { title: string; channelTitle: string } }> }> {
  const params = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "video",
    maxResults: String(maxResults),
    order: "viewCount",
    key: API_KEY,
  });
  if (publishedAfter) params.set("publishedAfter", publishedAfter);

  const res = await fetch(`${BASE_URL}/search?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube search failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<{ items: Array<{ id: { videoId: string }; snippet: { title: string; channelTitle: string } }> }>;
}

async function getVideoStats(
  videoIds: string[]
): Promise<YouTubeVideo[]> {
  if (videoIds.length === 0) return [];

  const params = new URLSearchParams({
    part: "statistics,snippet",
    id: videoIds.join(","),
    key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/videos?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube stats failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { items: Array<{ id: string; snippet: { title: string; channelTitle: string; publishedAt: string }; statistics: { viewCount?: string; likeCount?: string; commentCount?: string } }> };
  return data.items.map(
    (v: {
      id: string;
      snippet: { title: string; channelTitle: string; publishedAt: string };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }) => {
      const views = parseInt(v.statistics.viewCount || "0");
      const likes = parseInt(v.statistics.likeCount || "0");
      const comments = parseInt(v.statistics.commentCount || "0");
      return {
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        views,
        likes,
        comments,
        published: v.snippet.publishedAt,
        engagementRate: (likes + comments) / Math.max(views, 1),
        videoId: v.id,
      };
    }
  );
}

/**
 * Run a full YouTube research pass for a keyword.
 * 3 time ranges: all-time, 12 months, 1 month.
 */
export async function researchKeyword(keyword: string): Promise<YouTubeSearchResult[]> {
  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const passes = [
    { label: "all-time", publishedAfter: undefined },
    { label: "12-months", publishedAfter: twelveMonthsAgo.toISOString() },
    { label: "1-month", publishedAfter: oneMonthAgo.toISOString() },
  ];

  const results: YouTubeSearchResult[] = [];

  for (const pass of passes) {
    try {
      const search = await searchVideos(keyword, 50, pass.publishedAfter);
      const videoIds = search.items.map((i) => i.id.videoId).filter(Boolean);
      const stats = await getVideoStats(videoIds);
      const sorted = stats.sort((a, b) => b.views - a.views);

      results.push({
        keyword,
        timeRange: pass.label,
        videos: sorted,
      });
    } catch (err) {
      console.error(`YouTube search failed for "${keyword}" (${pass.label}):`, err);
      results.push({ keyword, timeRange: pass.label, videos: [] });
    }
  }

  return results;
}

/**
 * Run YouTube research for all 15 keywords.
 * Returns formatted markdown.
 */
export async function runYouTubeResearch(keywords: string[]): Promise<string> {
  const allResults: string[] = [];

  for (const keyword of keywords) {
    const passes = await researchKeyword(keyword);

    for (const pass of passes) {
      if (pass.videos.length === 0) continue;

      const ceiling = pass.videos[0];
      // Apply ceiling/floor game: collect until dramatic drop-off
      const collected: YouTubeVideo[] = [];
      for (let i = 0; i < pass.videos.length; i++) {
        if (i > 0 && pass.videos[i].views < ceiling.views * 0.01) break; // 100x drop
        collected.push(pass.videos[i]);
        if (collected.length >= 12) break;
      }

      allResults.push(
        `KEYWORD: ${keyword}\nTIME RANGE: ${pass.timeRange}\n` +
          `CEILING: ${ceiling.views.toLocaleString()} views — "${ceiling.title}"\n` +
          `CEILING ZONE (collected):\n` +
          collected
            .map(
              (v, i) =>
                `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views | ${v.channel} | engagement: ${(v.engagementRate * 100).toFixed(2)}%`
            )
            .join("\n") +
          `\nDROP-OFF AT: ${collected[collected.length - 1]?.views.toLocaleString() || "N/A"} views\n`
      );
    }
  }

  return allResults.join("\n---\n\n");
}
