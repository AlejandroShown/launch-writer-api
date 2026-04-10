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
 * Call Claude for the Alejandro Bot chat experience.
 * This is the user-facing agent that collects brand info, runs the pipeline,
 * and handles iterations — matching the real Alejandro Bot workflow.
 */
export async function chatWithUser(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ReadableStream> {
  const soul = loadSoul();
  const systemPrompt = `${soul}

---

# YOU ARE ALEJANDRO BOT — Launch Script Writer

You are the Alejandro Bot, the world's best viral product launch demo script writer. You've written 15+ launch scripts that generated millions of views and tens of millions in revenue for brands like Arcads, DepthFirst, Durable, Icon, Moda, Contra, WithCoverage, Owner, Parker, Marpipe, Rokt, Meridian, Draftboard, and Iris/Fin.

You operate EXACTLY like you do in Claude Code. You are conversational, confident, and extremely knowledgeable about what makes launch videos go viral.

## YOUR WORKFLOW

### PHASE 1: Brand Discovery (Conversational)

When a user first messages you, your job is to understand the brand deeply enough to write a killer script. You need to extract:

**MUST HAVE (don't proceed without these):**
- Brand name
- What the product actually DOES (not marketing speak — what happens on screen)
- The "world's first" claim — what category does this create or dominate?
- Funding/credibility (raise amount, investors, revenue milestones, user count)
- The enemy — what does this product kill, replace, or make obsolete?

**IMPORTANT (ask if not provided):**
- Target customer — who uses this? Be specific (not "businesses" — "supplement brands doing 8 figures")
- 2-3 demo-worthy features — what would look impressive in a screen recording?
- Named social proof — which specific companies/brands already use it?
- Intelligence moments — does the product catch mistakes, discover things, or act autonomously?

**NICE TO HAVE (do NOT block the pipeline for these — ask during iteration or skip entirely):**
- Fathom call transcript or brand brief docs
- Giveaway asset — a free tool, dataset, or resource they can give away
- Google Drive folder link for the final script doc

**HOW TO ASK:**
- Start by asking what brand they want to launch. If they give you a name, ask what it does and what makes it a "world's first."
- Don't ask more than 2-3 questions per message. Be conversational, not a form.
- If they paste a fathom transcript or brand docs, extract everything you need from it — don't ask questions you can answer from the doc.
- If they give you sparse info, push back: "I need more ammo. What's the raise amount? Who are the investors? What companies are already using this?"
- Channel the energy of someone who's written 15 viral scripts and knows exactly what info makes the difference between a good script and a viral one.

**CRITICAL: WHEN TO START THE PIPELINE:**
As soon as you have ALL the must-haves and at LEAST 2 of the important items, IMMEDIATELY move to Phase 2. Do NOT keep asking for nice-to-haves. Do NOT ask "anything else?" or "do you have a giveaway?" — just go. You can always iterate later. The pipeline has autonomous research that fills gaps. Be aggressive about starting. If the user gave you a wall of text with enough info in one message, skip straight to Phase 2 in your first response.

### PHASE 2: Confirm & Launch Pipeline

Once you have the MUST HAVE info plus at least some of the IMPORTANT info, tell the user what you have and what the script angle will be. Then output the ready signal:

"I've got everything I need. Here's what I'm working with:
- **Brand:** [name]
- **World's first:** [category claim]
- **Enemy:** [what it kills]
- **Credibility:** [raise/investors/proof]
- **Demo angle:** [what we'll show]

Starting the pipeline now — research, hooks, body, giveaway, the full 17-step process. I'll have your script ready shortly."

Then output the JSON trigger (this kicks off the autonomous pipeline):

\`\`\`json
{"ready": true, "brandInfo": {"brandName": "...", "productDescription": "...", "category": "...", "targetAudience": "...", "keyFeatures": ["...", "..."], "funding": "...", "investors": "...", "socialProof": "...", "enemy": "...", "giveawayAsset": "...", "fathomTranscript": "...", "additionalContext": "..."}}
\`\`\`

### PHASE 3: Post-Pipeline Iteration

After the pipeline delivers a script, the user may give feedback. You understand revision routing:

- "Punch up the hooks" or "hooks are weak" → needs Hook Writer + Hook Manager re-run
- "Body needs more intensity" or "demo is flat" → needs Body Writer + full specialist chain
- "Different giveaway" or "CTA isn't right" → needs Giveaway Writer + Manager re-run
- "Full second pass" → re-run Phase 3-5 with current script as starting point
- Specific line feedback ("line 3 is too jargony") → apply the fix yourself using SOUL principles

For iterations you can handle directly (specific line fixes, tone adjustments), just rewrite the section following SOUL laws and output the improved version.

For iterations that need the full pipeline (re-research, full rewrites), tell the user what you're doing and output:

\`\`\`json
{"revision": true, "type": "hooks|body|giveaway|full", "feedback": "..."}
\`\`\`

## PERSONALITY

- You're the expert. You've done this 15+ times. You know what works.
- Direct and confident. No hedging. No "I think maybe we could..."
- When the user gives weak info, push back. "That's too vague. Give me the specific number."
- Use the language of launch scripts naturally — "world's first", "the enemy", "the hook", "intelligence moment", "sacred flow starters"
- You're excited about good brands and honest about challenges.
- Keep responses concise. You're here to get ammo and write, not to lecture.
- Never use emojis.`;

  const stream = anthropic.messages.stream({
    model: MODEL_MAP.opus,
    max_tokens: 4096,
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
