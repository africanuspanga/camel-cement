"use client";

import * as React from "react";
import { Eye, MoreHorizontal, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/admin/actions";
import { formatDateTime, humaniseStatus } from "@/lib/admin/format";

export interface DetailField {
  label: string;
  value: string;
}

export interface DetailSection {
  title: string;
  fields: DetailField[];
}

export interface TimelineEntry {
  status: string;
  note: string | null;
  at: string;
}

/**
 * Shared table row actions: "View details" Sheet (full record, optional
 * message and status timeline) and "Update status" Dialog (status Select +
 * internal note) wired to a server action passed in as a prop.
 */
export function RowActions({
  id,
  reference,
  entityLabel,
  currentStatus,
  statuses,
  updateAction,
  sections,
  message,
  timeline,
}: {
  id: string;
  reference: string;
  entityLabel: string;
  currentStatus: string;
  statuses: string[];
  updateAction: (id: string, status: string, note?: string) => Promise<ActionResult>;
  sections: DetailSection[];
  message?: string | null;
  timeline?: TimelineEntry[];
}) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [status, setStatus] = React.useState(currentStatus);
  const [note, setNote] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await updateAction(id, status, note);
      if (result.ok) {
        toast.success(`${reference} updated`, {
          description: `Status set to ${humaniseStatus(status).toLowerCase()}.`,
        });
        setDialogOpen(false);
        setNote("");
      } else {
        toast.error("Could not update status", { description: result.error });
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground data-[state=open]:bg-concrete-100"
            aria-label={`Actions for ${reference}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setSheetOpen(true)}>
            <Eye aria-hidden />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setStatus(currentStatus);
              setDialogOpen(true);
            }}
          >
            <RefreshCcw aria-hidden />
            Update status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Details sheet ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full gap-0 sm:max-w-md">
          <SheetHeader className="border-b border-concrete-200">
            <SheetTitle className="flex items-center gap-2.5 font-mono text-base">
              {reference}
              <StatusBadge status={currentStatus} />
            </SheetTitle>
            <SheetDescription>{entityLabel} details</SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-6 p-4">
              {sections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-eyebrow text-camel-green-700">
                    {section.title}
                  </h3>
                  <dl className="mt-3 space-y-2.5">
                    {section.fields.map((field) => (
                      <div
                        key={field.label}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <dt className="shrink-0 text-sm text-muted-foreground">
                          {field.label}
                        </dt>
                        <dd className="text-right text-sm font-medium break-words text-foreground">
                          {field.value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}

              {message ? (
                <section>
                  <h3 className="text-eyebrow text-camel-green-700">Message</h3>
                  <p className="mt-3 rounded-xl bg-concrete-100 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {message}
                  </p>
                </section>
              ) : null}

              {timeline && timeline.length > 0 ? (
                <section>
                  <h3 className="text-eyebrow text-camel-green-700">
                    Status history
                  </h3>
                  <ol className="mt-3 space-y-0">
                    {timeline.map((entry, index) => (
                      <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < timeline.length - 1 && (
                          <span
                            aria-hidden
                            className="absolute top-4 left-[5px] h-full w-px bg-concrete-200"
                          />
                        )}
                        <span
                          aria-hidden
                          className="mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-camel-green-700 bg-white"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={entry.status} />
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatDateTime(entry.at)}
                            </span>
                          </div>
                          {entry.note ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {entry.note}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </div>
          </ScrollArea>
          <Separator />
          <div className="flex justify-end p-4">
            <Button
              className="h-10 rounded-full bg-camel-green-700 px-5 hover:bg-camel-green-800"
              onClick={() => {
                setSheetOpen(false);
                setStatus(currentStatus);
                setDialogOpen(true);
              }}
            >
              Update status
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Status dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update status</DialogTitle>
            <DialogDescription>
              <span className="font-mono">{reference}</span> — the change is
              recorded in the status history and audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`status-${id}`}>New status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id={`status-${id}`} className="h-11 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((option) => (
                    <SelectItem key={option} value={option}>
                      {humaniseStatus(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`note-${id}`}>
                Note{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id={`note-${id}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add context for the team…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDialogOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={pending || !status}
              className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
            >
              {pending ? "Saving…" : "Save status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
