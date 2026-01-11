"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navLinks } from "./navLinks";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 border-r bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-end px-3 border-b">

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Links */}
      <nav className="p-2 space-y-1">
        {navLinks.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
