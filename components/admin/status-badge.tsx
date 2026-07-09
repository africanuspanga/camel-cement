import { cn } from "@/lib/utils";
import { humaniseStatus } from "@/lib/admin/format";

type Tone = "info" | "warning" | "success" | "danger" | "neutral";

/**
 * Maps every workflow status used across the platform to a tint tone.
 * Design rule (section 28): light tinted background, dark readable text,
 * pill radius, 12px bold type.
 */
const STATUS_TONES: Record<string, Tone> = {
  // Shared / quotations
  new: "info",
  reviewing: "warning",
  contacted: "warning",
  quotation_prepared: "warning",
  quotation_sent: "warning",
  negotiating: "warning",
  approved: "success",
  won: "success",
  lost: "danger",
  closed: "neutral",
  // Orders
  draft: "neutral",
  submitted: "info",
  under_review: "warning",
  price_confirmed: "warning",
  awaiting_approval: "warning",
  payment_pending: "warning",
  processing: "warning",
  ready_for_collection: "success",
  out_for_delivery: "success",
  completed: "success",
  cancelled: "danger",
  // Enquiries
  assigned: "warning",
  waiting_customer: "warning",
  in_progress: "warning",
  resolved: "success",
  spam: "danger",
  // Posts
  review: "warning",
  published: "success",
  // Applications
  screening: "warning",
  shortlisted: "info",
  interview: "warning",
  assessment: "warning",
  reference_check: "warning",
  offer: "success",
  hired: "success",
  rejected: "danger",
  withdrawn: "neutral",
  // Priorities
  low: "neutral",
  normal: "info",
  high: "warning",
  urgent: "danger",
  // Booleans rendered as badges
  active: "success",
  inactive: "neutral",
  authorised: "success",
  yes: "success",
  no: "neutral",
};

const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-sky-50 text-sky-800 ring-sky-600/15",
  warning: "bg-camel-yellow-50 text-amber-800 ring-amber-600/20",
  success: "bg-camel-green-50 text-camel-green-800 ring-camel-green-700/15",
  danger: "bg-red-50 text-red-800 ring-red-600/15",
  neutral: "bg-concrete-100 text-concrete-800 ring-concrete-400/25",
};

const TONE_DOTS: Record<Tone, string> = {
  info: "bg-sky-500",
  warning: "bg-amber-500",
  success: "bg-camel-green-700",
  danger: "bg-red-500",
  neutral: "bg-concrete-400",
};

export function statusTone(status: string | null | undefined): Tone {
  if (!status) return "neutral";
  return STATUS_TONES[status.toLowerCase()] ?? "neutral";
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string | null | undefined;
  /** Optional custom label; defaults to a humanised version of the status. */
  label?: string;
  className?: string;
}) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-xs font-bold whitespace-nowrap ring-1 ring-inset",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", TONE_DOTS[tone])}
      />
      {label ?? humaniseStatus(status)}
    </span>
  );
}
