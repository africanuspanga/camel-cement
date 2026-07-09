"use client";

import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DemoModeNote({ persisted }: { persisted: boolean }) {
  if (persisted) return null;
  return (
    <p className="text-sm text-concrete-600">
      Demo mode: request was not saved because the database is not connected
      yet.
    </p>
  );
}

export function ReferenceNumber({ reference }: { reference: string }) {
  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Reference number copied");
    } catch {
      toast.error("Could not copy the reference number");
    }
  };

  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-camel-green-200 bg-camel-green-50 px-5 py-3">
      <span className="text-2xl font-bold tracking-wide text-camel-green-800 tabular-nums">
        {reference}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={copyReference}
        aria-label="Copy reference number"
        className="size-11 rounded-full text-camel-green-800 hover:bg-camel-green-100 hover:text-camel-green-900"
      >
        <CopyIcon className="size-5" />
      </Button>
    </div>
  );
}

export function SuccessScreen({
  title,
  reference,
  persisted,
  children,
  actions,
}: {
  title: string;
  reference: string;
  persisted: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-card md:p-12">
      <CheckCircle2Icon
        aria-hidden="true"
        className="mx-auto size-16 text-camel-green-700"
      />
      <h2 className="mt-6 text-h2 text-concrete-950">{title}</h2>
      <div className="mt-6">
        <ReferenceNumber reference={reference} />
      </div>
      <div className="mt-6 space-y-4 text-base text-concrete-800">
        {children}
      </div>
      <div className="mt-4">
        <DemoModeNote persisted={persisted} />
      </div>
      {actions ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
