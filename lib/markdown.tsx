import type { ReactNode } from "react";

/**
 * Minimal markdown renderer for seeded article content. Supports the exact
 * subset used by lib/articles.ts: # h1 (optionally skipped), ## h2, ### h3,
 * paragraphs, unordered lists (-), ordered lists (1.) and **bold** inline.
 * No external dependencies.
 */

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  if (parts.length === 1 && !parts[0].startsWith("**")) return text;
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-concrete-950">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: trimmed.slice(4) });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h1", text: trimmed.slice(2) });
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(trimmed.slice(2));
      continue;
    }
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(orderedMatch[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function Markdown({
  content,
  skipFirstH1 = true,
  className,
}: {
  content: string;
  skipFirstH1?: boolean;
  className?: string;
}) {
  const blocks = parseBlocks(content);
  const firstH1Index = blocks.findIndex((block) => block.type === "h1");

  return (
    <div className={["break-words", className].filter(Boolean).join(" ")}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h1":
            if (skipFirstH1 && i === firstH1Index) {
              return null;
            }
            return (
              <h2 key={i} className="mb-4 mt-12 text-h2 text-concrete-950">
                {renderInline(block.text)}
              </h2>
            );
          case "h2":
            return (
              <h2
                key={i}
                className="mb-4 mt-12 text-h2 text-balance text-concrete-950 first:mt-0"
              >
                {renderInline(block.text)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="mb-3 mt-8 text-h3 text-concrete-950 first:mt-0"
              >
                {renderInline(block.text)}
              </h3>
            );
          case "ul":
            return (
              <ul
                key={i}
                className="my-5 list-disc space-y-2 pl-6 text-[17px] leading-relaxed text-concrete-800 marker:text-camel-green-700"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={i}
                className="my-5 list-decimal space-y-2 pl-6 text-[17px] leading-relaxed text-concrete-800 marker:font-bold marker:text-camel-green-700"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ol>
            );
          case "p":
            return (
              <p
                key={i}
                className="my-5 text-[17px] leading-[1.75] text-concrete-800 first:mt-0"
              >
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
