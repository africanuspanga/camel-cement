"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

/** Dashboard date-range control, persisted as the ?range= searchParam. */
export function RangeSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("range") ?? "30";

  return (
    <Select
      value={RANGES.some((range) => range.value === current) ? current : "30"}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "30") params.delete("range");
        else params.set("range", value);
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }}
    >
      <SelectTrigger
        aria-label="Date range"
        className="h-10 w-40 rounded-full border-concrete-200 bg-white font-medium"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGES.map((range) => (
          <SelectItem key={range.value} value={range.value}>
            {range.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
