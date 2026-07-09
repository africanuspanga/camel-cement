import { NextRequest } from "next/server";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(40),
});

// Simple in-memory rate limit: 20 requests per 5 minutes per IP.
const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 20;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

function textStream(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

const OFFLINE_MESSAGE = `Hello. I am the Camel Build Assistant. My live AI service is not connected yet, but you can still get help right away:

• Compare products at /products
• Estimate materials at /calculator
• Find a dealer at /dealers
• Request a quotation at /request-quote

For direct assistance call ${site.phone} or email ${site.salesEmail}.`;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return new Response("Too many requests. Please wait a moment.", {
      status: 429,
    });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }
  if (!parsed.success) {
    return new Response("Invalid request body.", { status: 400 });
  }

  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    return textStream(OFFLINE_MESSAGE);
  }

  const baseUrl = process.env.MOONSHOT_BASE_URL ?? "https://api.moonshot.ai/v1";
  const model = process.env.MOONSHOT_MODEL ?? "kimi-k2.6";
  const systemPrompt = await buildSystemPrompt();

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    // kimi-k2.6 is a hybrid reasoning model. Customer chat needs fast
    // first-token latency, so thinking is disabled; that mode requires
    // temperature 0.6 exactly (thinking mode requires 1).
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.6,
      max_tokens: 2048,
      thinking: { type: "disabled" },
      messages: [
        { role: "system", content: systemPrompt },
        ...parsed.data.messages,
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    console.error("Moonshot API error:", upstream.status);
    if (upstream.status === 429) {
      return textStream(
        `I am helping many customers at the moment. Please try again in a few seconds. If it is urgent, call our team on ${site.phone}.`
      );
    }
    return textStream(
      `I am having trouble reaching my knowledge service right now. Please try again shortly, or call our team on ${site.phone}.`
    );
  }

  // Transform OpenAI-compatible SSE chunks into a plain text stream.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const delta: string | undefined =
            json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // Ignore malformed keep-alive lines
        }
      }
    },
  });

  return new Response(upstream.body.pipeThrough(transform), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
