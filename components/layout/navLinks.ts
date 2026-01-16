import { LayoutDashboard, User, Settings, ListChecks, BookOpen } from "lucide-react";

export const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Habits", href: "/habits", icon: ListChecks },
  { label: "Settings", href: "/settings", icon: Settings },
  {label: "Journal", href: "/journal", icon: BookOpen, // lucide-react
}

];
