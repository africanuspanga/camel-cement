"use client";

import * as React from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteResource } from "@/lib/admin/resource-actions";

export function ResourceRowActions({
  id,
  title,
  fileUrl,
}: {
  id: string;
  title: string;
  fileUrl: string | null;
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const remove = () => {
    startTransition(async () => {
      const result = await deleteResource(id);
      if (result.ok) {
        toast.success("Document deleted", {
          description: `${title} was removed from the library and storage.`,
        });
        setConfirmOpen(false);
      } else {
        toast.error("Could not delete document", {
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {fileUrl ? (
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title} in a new tab`}
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </Button>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${title}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              “{title}” will be removed from the public download centre and its
              file deleted from storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending} className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault(); // Keep the dialog open while pending.
                remove();
              }}
              disabled={pending}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {pending ? "Deleting…" : "Delete document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
