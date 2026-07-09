"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOutAction } from "@/lib/admin/actions";
import { initials } from "@/lib/admin/format";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Dashboard",
  quotations: "Quotations",
  orders: "Orders",
  enquiries: "Enquiries",
  products: "Products",
  dealers: "Dealers",
  resources: "Resources",
  news: "News",
  projects: "Projects",
  careers: "Careers",
  analytics: "Analytics",
  ai: "AI Assistant",
  users: "Users",
  settings: "Settings",
  "audit-logs": "Audit Logs",
};

function labelFor(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

/** 72px top header: sidebar trigger, auto breadcrumb, search, account menu. */
export function AdminHeader({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "admin"

  return (
    <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center gap-3 border-b border-concrete-200 bg-white px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-concrete-600" />
      <Separator orientation="vertical" className="hidden h-5! sm:block" />

      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            {segments.length === 0 ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href="/admin">Dashboard</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const href = "/admin/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            return (
              <BreadcrumbItem key={href}>
                <BreadcrumbSeparator />
                {isLast ? (
                  <BreadcrumbPage>{labelFor(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{labelFor(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            disabled
            placeholder="Search… (soon)"
            aria-label="Global search, coming soon"
            className="h-10 w-56 rounded-full border-concrete-200 bg-concrete-50 pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="flex size-9 items-center justify-center rounded-full bg-camel-green-900 text-xs font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-camel-green-700 focus-visible:ring-offset-2"
          >
            {initials(userName || userEmail)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate text-sm font-semibold">
                {userName || "Camel Cement staff"}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {userEmail}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => void signOutAction()}
            >
              <LogOut aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
