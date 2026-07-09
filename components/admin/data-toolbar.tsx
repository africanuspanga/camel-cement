"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ToolbarTab {
  value: string;
  label: string;
}

/**
 * List-page toolbar: status filter tabs + debounced search, both written to
 * the URL as searchParams so pages stay server-rendered and shareable.
 */
export function DataToolbar({
  tabs,
  paramKey = "status",
  searchPlaceholder = "Search…",
  className,
}: {
  tabs?: ToolbarTab[];
  paramKey?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get(paramKey) ?? tabs?.[0]?.value ?? "all";
  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");

  const replaceParams = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page"); // any filter change returns to page 1
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Debounced search → ?q=
  const initialQuery = searchParams.get("q") ?? "";
  React.useEffect(() => {
    if (query === initialQuery) return;
    const handle = setTimeout(() => {
      replaceParams((params) => {
        if (query.trim()) params.set("q", query.trim());
        else params.delete("q");
      });
    }, 350);
    return () => clearTimeout(handle);
  }, [query, initialQuery, replaceParams]);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {tabs && tabs.length > 0 ? (
        <div
          role="tablist"
          aria-label="Filter by status"
          className="inline-flex w-fit items-center gap-0.5 rounded-full border border-concrete-200 bg-white p-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() =>
                  replaceParams((params) => {
                    if (tab.value === "all" || tab.value === tabs[0].value) {
                      params.delete(paramKey);
                    } else {
                      params.set(paramKey, tab.value);
                    }
                  })
                }
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-camel-green-700 focus-visible:outline-none",
                  isActive
                    ? "bg-camel-green-900 text-white"
                    : "text-concrete-600 hover:bg-concrete-100 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div />
      )}

      <div className="relative w-full sm:w-72">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-10 rounded-full border-concrete-200 bg-white pl-9 focus-visible:ring-camel-green-700/30"
        />
      </div>
    </div>
  );
}
