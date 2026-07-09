"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SendIcon,
  XIcon,
  MessageCircleQuestionIcon,
  CalculatorIcon,
  MapPinIcon,
  FileTextIcon,
  ScaleIcon,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Hello. I am the Camel Build Assistant. I can help you compare products, estimate materials, find a dealer or request a quotation. How can I help?";

const quickActions = [
  { icon: MessageCircleQuestionIcon, label: "Help me choose cement" },
  { icon: CalculatorIcon, label: "Calculate cement" },
  { icon: MapPinIcon, label: "Find a dealer" },
  { icon: FileTextIcon, label: "Request a quote" },
  { icon: ScaleIcon, label: "Compare products" },
];

export function CamelAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages([
            ...nextMessages,
            { role: "assistant", content: assistantText },
          ]);
        }
      } catch {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content:
              "I could not reach the assistant service. Please try again shortly, or call our team on +255 788 026 188.",
          },
        ]);
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  return (
    <>
      {/* Floating camel icon (no background), bobbing with a "Let's Chat" label */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Camel Build Assistant"
        aria-expanded={open}
        className="group fixed bottom-[18px] right-[18px] z-[60] flex flex-col items-center gap-1.5 md:bottom-7 md:right-7"
        title="Ask Camel"
      >
        <span
          className={cn(
            "rounded-full bg-camel-green-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-card transition-opacity",
            open && "opacity-0"
          )}
        >
          Let&apos;s Chat
        </span>
        <span className={cn("block", !open && "animate-camel-float")}>
          <Image
            src="/camel-icon.png"
            alt=""
            width={72}
            height={72}
            className="size-16 object-contain drop-shadow-[0_10px_18px_rgba(0,77,26,0.35)] transition-transform duration-[140ms] ease-out group-hover:scale-[1.06] group-active:scale-[0.95] md:size-[72px]"
          />
        </span>
      </button>

      {/* Chat panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="Camel Build Assistant"
          className="fixed inset-0 z-[59] flex flex-col overflow-hidden bg-white shadow-raised md:inset-auto md:bottom-24 md:right-7 md:h-[min(680px,78vh)] md:w-[400px] md:rounded-[20px] md:border md:border-concrete-200"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-camel-green-900 px-5 py-4 text-white">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-camel-yellow-500">
              <Image
                src="/camel-icon.png"
                alt=""
                width={28}
                height={28}
                className="size-7 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">Camel Build Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-white/76">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-camel-green-200"
                />
                Online 24/7
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <XIcon className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-concrete-50 px-4 py-5"
          >
            <AssistantBubble content={GREETING} />
            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => send(action.label)}
                    className="flex items-center gap-1.5 rounded-full border border-camel-green-200 bg-white px-3 py-2 text-[13px] font-semibold text-camel-green-800 transition-colors hover:bg-camel-green-50"
                  >
                    <action.icon
                      className="size-3.5 text-camel-green-700"
                      aria-hidden="true"
                    />
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
            {messages.map((message, i) =>
              message.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-[14px_14px_4px_14px] bg-camel-green-700 px-4 py-2.5 text-[15px] leading-relaxed text-white">
                    {message.content}
                  </p>
                </div>
              ) : (
                <AssistantBubble
                  key={i}
                  content={message.content}
                  typing={streaming && i === messages.length - 1 && !message.content}
                />
              )
            )}
            <p className="pt-1 text-center text-[11px] leading-relaxed text-concrete-400">
              Guidance only. Structural decisions should be confirmed by a
              qualified professional. Conversations may be reviewed to improve
              support.
            </p>
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-concrete-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, quantities, dealers..."
              aria-label="Message the Camel Build Assistant"
              className="h-11 flex-1 rounded-full border border-concrete-300 bg-white px-4 text-[15px] outline-none transition-shadow focus:border-camel-green-700 focus:shadow-[0_0_0_4px_rgba(0,135,44,0.12)]"
            />
            <Button
              type="submit"
              size="icon"
              disabled={streaming || !input.trim()}
              aria-label="Send message"
              className="size-11 shrink-0 rounded-full bg-camel-green-700 text-white hover:bg-camel-green-800"
            >
              <SendIcon className="size-4.5" aria-hidden="true" />
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}

/** The panel renders plain text, so strip any markdown the model slips in. */
function cleanAssistantText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

function AssistantBubble({
  content,
  typing = false,
}: {
  content: string;
  typing?: boolean;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] whitespace-pre-wrap rounded-[14px_14px_14px_4px] bg-concrete-100 px-4 py-2.5 text-[15px] leading-relaxed text-concrete-950">
        {typing ? (
          <span className="flex gap-1 py-1" aria-label="Assistant is typing">
            <span className="size-1.5 animate-bounce rounded-full bg-concrete-400 [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-concrete-400 [animation-delay:120ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-concrete-400 [animation-delay:240ms]" />
          </span>
        ) : (
          cleanAssistantText(content)
        )}
      </div>
    </div>
  );
}
