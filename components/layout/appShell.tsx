"use client";

import { useEffect, useState } from "react";
import Sidebar from "./sideBar";
import Navbar from "./navBar";
import FloatingAddButton from "./floatingAddButton";

export default function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setCollapsed(saved === "true");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("sidebarCollapsed", String(collapsed));
  }, [collapsed, hydrated]);

  // avoid hydration mismatch flash
  if (!hydrated) return null;

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 min-h-screen">
        <Navbar title={title} />
        <main className="p-6">{children}</main>
      </div>
      <FloatingAddButton href="/habits/new" />
    </div>
  );
}
