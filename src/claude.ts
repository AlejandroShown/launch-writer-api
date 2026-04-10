import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import { AGENT_KB_FILES, AGENT_MODELS, MODEL_MAP } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const PROMPTS_DIR = path.join(__dirname, "..", "src", "prompts");

// Cache loaded files
const fileCache = new Map<string, string>();

function loadFile(filePath: string): string {
  if (fileCache.has(filePath)) return fileCache.get(filePath)!;
  // Try both the src/prompts path and the dist-relative path
  let fullPath = path.join(PROMPTS_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(__dirname, "..", "src", "prompts", filePath);
  }
  const content = fs.readFileSync(fullPath, "utf-8");
  fileCache.set(filePath, content);
  return content;
}

function loadSoul(): string {
  return loadFile("SOUL.md");
}

function loadAgent(agentName: string): string {
  return loadFile(`agents/${agentName}.md`);
}

function loadKB(kbName: string): string {
  return loadFile(`knowledge-base/${kbName}.md`);
}

function loadInfra(): string {
  return loadFile("systems-infrastructure.md");
}

/**
 * Build the full prompt for a sub-agent, exactly replicating what
 * `claude -p "$(cat SOUL.md) $(cat agents/[AGENT].md) ..."` does.
 */
export function buildAgentPrompt(
  agentName: string,
  inputs: Record<string, string>
): { system: string; userMessage: string } {
  const soul = loadSoul();
  const agentInstructions = loadAgent(agentName);

  // Load knowledge base files for this agent
  const kbFiles = AGENT_KB_FILES[agentName] || [];
  const kbContent = kbFiles.map((kb) => loadKB(kb)).join("\n\n---\n\n");

  // System prompt = SOUL + agent instructions
  const system = `${soul}\n\n---\n\n${agentInstructions}`;

  // User message = KB files + inputs (brief, prior outputs, etc.)
  const parts: string[] = [];

  if (kbContent) {
    parts.push("=== KNOWLEDGE BASE ===\n\n" + kbContent);
  }

  // Add infrastructure reference for research agents
  if (
    ["youtube-research", "x-research", "reddit-research", "industry-research", "giveaway-manager"].includes(
      agentName
    )
  ) {
    parts.push("=== SYSTEMS INFRASTRUCTURE ===\n\n" + loadInfra());
  }

  // Add all inputs (brief, prior agent outputs, etc.)
  for (const [key, value] of Object.entries(inputs)) {
    parts.push(`=== ${key.toUpperCase().replace(/_/g, " ")} ===\n\n${value}`);
  }

  parts.push(`\nExecute now.`);

  return { system, userMessage: parts.join("\n\n---\n\n") };
}

/**
 * Call a sub-agent via the Anthropic API.
 * Returns the full text response.
 */
export async function callAgent(
  agentName: string,
  inputs: Record<string, string>,
  onProgress?: (chunk: string) => void
): Promise<string> {
  const modelKey = AGENT_MODELS[agentName] || "sonnet";
  const model = MODEL_MAP[modelKey];
  const { system, userMessage } = buildAgentPrompt(agentName, inputs);

  console.log(
    `[Agent] Starting ${agentName} (${modelKey}) — prompt: ${(system.length + userMessage.length).toLocaleString()} chars`
  );

  if (onProgress) {
    // Streaming mode
    let fullText = "";
    const stream = anthropic.messages.stream({
      model,
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullText += event.delta.text;
        onProgress(event.delta.text);
      }
    }

    console.log(`[Agent] Completed ${agentName} — ${fullText.length.toLocaleString()} chars output`);
    return fullText;
  } else {
    // Non-streaming mode
    const response = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    console.log(`[Agent] Completed ${agentName} — ${text.length.toLocaleString()} chars output`);
    return text;
  }
}

/**
 * Call Claude for the initial brand info chat (conversational, not pipeline).
 */
export async function chatWithUser(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ReadableStream> {
  const systemPrompt = `You are the Launch Writer — a world-class viral product launch script writer for Shown Media.

Your job RIGHT NOW is to collect brand information from the user. You need:
1. Brand name
2. What the product does (one sentence)
3. Category (AI tool, SaaS, marketplace, etc.)
4. Target audience
5. Key features (2-3 most impressive)
6. Funding/credibility (raise amount, investors, revenue)
7. Social proof (named brands/companies using it, customer count)
8. Enemy (what does this product kill/replace?)
9. Any fathom call transcript or brand docs
10. Giveaway asset (free tool, dataset, resource to give away)
11. Google Drive folder link (where to save the final script doc)

Don't ask all at once. Start with 1-3, then dig deeper. Be conversational, confident, direct.

When you have enough info (at minimum: brand name, what it does, key features, and some kind of credibility/enemy angle), tell the user you're ready to start the pipeline and output a JSON block with all collected info:

\`\`\`json
{"ready": true, "brandInfo": { ... }}
\`\`\`

Until then, keep asking smart follow-up questions.`;

  const stream = anthropic.messages.stream({
    model: MODEL_MAP.sonnet,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });
}
