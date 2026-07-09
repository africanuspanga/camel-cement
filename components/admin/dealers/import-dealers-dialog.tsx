"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, FileUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportResult {
  imported: number;
  skipped: { row: number; reason: string }[];
}

export function ImportDealersDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) return;
    setPending(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/admin/dealers-import", {
        method: "POST",
        body: data,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        toast.error("Import failed", {
          description:
            payload?.error ?? `The server responded with ${response.status}.`,
        });
        return;
      }

      setResult({ imported: payload.imported, skipped: payload.skipped ?? [] });
      toast.success("Import complete", {
        description: `${payload.imported} dealer${
          payload.imported === 1 ? "" : "s"
        } imported${
          payload.skipped?.length ? `, ${payload.skipped.length} skipped` : ""
        }.`,
      });
      router.refresh();
    } catch {
      toast.error("Import failed", {
        description: "Could not reach the server. Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-full border-concrete-300 px-4 font-semibold"
        >
          <FileSpreadsheet className="size-4" aria-hidden />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import dealers</DialogTitle>
          <DialogDescription>
            Upload a .xlsx, .xls or .csv file. Name and Region are required for
            every row — everything else is optional.{" "}
            <a
              href="/templates/dealers-template.csv"
              download
              className="font-semibold text-camel-green-700 underline underline-offset-2 hover:text-camel-green-800"
            >
              Download the template
              <Download className="ml-1 inline size-3.5" aria-hidden />
            </a>
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-foreground">
              {result.imported} dealer{result.imported === 1 ? "" : "s"}{" "}
              imported, {result.skipped.length} skipped.
            </p>
            {result.skipped.length > 0 ? (
              <ScrollArea className="max-h-48 rounded-lg border border-concrete-200 bg-concrete-50">
                <ul className="space-y-1 p-3 text-muted-foreground">
                  {result.skipped.map((item) => (
                    <li key={`${item.row}-${item.reason}`}>
                      Row {item.row}: {item.reason}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="dealer-import-file">Spreadsheet</Label>
            <label
              htmlFor="dealer-import-file"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-concrete-300 bg-concrete-50 px-4 py-3 transition-colors hover:border-camel-green-400"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-camel-green-50 text-camel-green-700">
                <FileUp className="size-4.5" aria-hidden />
              </span>
              <span className="min-w-0 text-sm">
                {file ? (
                  <span className="block truncate font-medium text-foreground">
                    {file.name}
                  </span>
                ) : (
                  <>
                    <span className="block font-medium text-foreground">
                      Choose a file
                    </span>
                    <span className="text-muted-foreground">
                      .xlsx, .xls or .csv
                    </span>
                  </>
                )}
              </span>
            </label>
            <Input
              ref={fileInputRef}
              id="dealer-import-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={reset}
              >
                Import another file
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
              >
                Done
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={pending || !file}
                className="rounded-full bg-camel-green-700 hover:bg-camel-green-800"
              >
                {pending ? "Importing…" : "Import dealers"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
