"use client";

import * as React from "react";
import { CircleCheck, FileText, MoreHorizontal, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setPostStatus } from "@/lib/admin/actions";

export function PostStatusMenu({
  id,
  title,
  status,
}: {
  id: string;
  title: string;
  status: "draft" | "review" | "published";
}) {
  const [pending, startTransition] = React.useTransition();

  const change = (next: "draft" | "review" | "published") => {
    startTransition(async () => {
      const result = await setPostStatus(id, next);
      if (result.ok) {
        toast.success(
          next === "published" ? "Article published" : `Moved to ${next}`,
          { description: title }
        );
      } else {
        toast.error("Could not update article", { description: result.error });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={pending}
          className="size-8 text-muted-foreground data-[state=open]:bg-concrete-100"
          aria-label={`Actions for ${title}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {status !== "published" && (
          <DropdownMenuItem onSelect={() => change("published")}>
            <CircleCheck aria-hidden />
            Publish
          </DropdownMenuItem>
        )}
        {status === "published" && (
          <DropdownMenuItem onSelect={() => change("draft")}>
            <Undo2 aria-hidden />
            Unpublish
          </DropdownMenuItem>
        )}
        {status === "draft" && (
          <DropdownMenuItem onSelect={() => change("review")}>
            <FileText aria-hidden />
            Send to review
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
