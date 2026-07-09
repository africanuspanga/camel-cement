"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ChartColumn,
  FileDown,
  Images,
  Inbox,
  Landmark,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareQuote,
  Newspaper,
  Package,
  ReceiptText,
  ScrollText,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/lib/admin/actions";
import { initials } from "@/lib/admin/format";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { title: "Quotations", href: "/admin/quotations", icon: ReceiptText },
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Enquiries", href: "/admin/enquiries", icon: Inbox },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Dealers", href: "/admin/dealers", icon: MapPin },
      { title: "Resources", href: "/admin/resources", icon: FileDown },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "News", href: "/admin/news", icon: Newspaper },
      { title: "Gallery", href: "/admin/gallery", icon: Images },
      { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      { title: "Projects", href: "/admin/projects", icon: Landmark },
      { title: "Careers", href: "/admin/careers", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Insight",
    items: [
      { title: "Analytics", href: "/admin/analytics", icon: ChartColumn },
      { title: "AI Assistant", href: "/admin/ai", icon: Sparkles },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Settings", href: "/admin/settings", icon: Settings },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    ],
  },
] as const;

export function AdminSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-md px-1 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <Image
              src="/logo.png"
              alt="Camel Cement"
              width={24}
              height={24}
              className="size-6 object-contain"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold text-sidebar-foreground">
              Camel Cement
            </span>
            <span className="text-[11px] font-semibold tracking-[0.14em] text-sidebar-primary uppercase">
              Admin
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-white/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      className="data-[active=true]:relative data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary data-[active=true]:before:content-[''] group-data-[collapsible=icon]:data-[active=true]:before:hidden"
                    >
                      <Link href={item.href}>
                        <item.icon aria-hidden />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Account"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                    {initials(userName || userEmail)}
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-semibold text-sidebar-foreground">
                      {userName || "Camel Cement staff"}
                    </span>
                    <span className="truncate text-xs text-white/60">
                      {userEmail}
                    </span>
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {userEmail}
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
