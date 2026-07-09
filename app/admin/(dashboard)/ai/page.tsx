import type { Metadata } from "next";
import { Bot, MessageSquare, Sparkles, TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { KpiCard } from "@/components/admin/kpi-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { relativeTime } from "@/lib/admin/format";
import { countSince, sinceIso } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AI Assistant",
};

interface SessionRow {
  id: string;
  language: string | null;
  escalated: boolean;
  created_at: string;
  messages: number;
}

export default async function AiAssistantPage() {
  const supabase = await createClient();

  let totals = { sessions: 0, escalated: 0, messages: 0 };
  let latest: SessionRow[] = [];

  if (supabase) {
    const since = sinceIso(30);
    const [sessions, escalated, messages, latestRes] = await Promise.all([
      countSince(supabase, "chat_sessions", since),
      countSince(supabase, "chat_sessions", since, {
        column: "escalated",
        value: "true",
      }),
      countSince(supabase, "chat_messages", since),
      supabase
        .from("chat_sessions")
        .select("id, language, escalated, created_at, chat_messages(count)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    totals = { sessions, escalated, messages };
    latest = (latestRes.data ?? []).map((row) => ({
      id: row.id as string,
      language: row.language as string | null,
      escalated: row.escalated as boolean,
      created_at: row.created_at as string,
      messages:
        (row.chat_messages as unknown as { count: number }[] | null)?.[0]
          ?.count ?? 0,
    }));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Assistant"
        description="The Camel Build Assistant on the public website — conversation volume and escalations over the last 30 days."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Conversations"
          value={totals.sessions}
          icon={Sparkles}
          hint="last 30 days"
        />
        <KpiCard
          label="Messages exchanged"
          value={totals.messages}
          icon={MessageSquare}
          hint="last 30 days"
        />
        <KpiCard
          label="Escalated to staff"
          value={totals.escalated}
          icon={TriangleAlert}
          hint="last 30 days"
        />
      </div>

      <Card className="gap-0 rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
        <CardHeader className="border-b border-concrete-200 py-4 [.border-b]:pb-4">
          <CardTitle className="text-base">Latest conversations</CardTitle>
          <CardDescription>
            Transcript review and knowledge approval arrive with the AI module.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {latest.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No conversations yet"
              body="Chats with the Camel Build Assistant will be listed here as visitors use it."
            />
          ) : (
            <ul className="divide-y divide-concrete-200">
              {latest.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-camel-yellow-50 text-camel-yellow-700">
                    <Bot className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-foreground">
                      {session.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {session.messages} messages ·{" "}
                      {(session.language ?? "en").toUpperCase()} ·{" "}
                      {relativeTime(session.created_at)}
                    </p>
                  </div>
                  {session.escalated ? (
                    <StatusBadge status="urgent" label="Escalated" />
                  ) : (
                    <StatusBadge status="resolved" label="Handled by AI" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
