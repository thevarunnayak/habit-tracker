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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sidebarCollapsed");
      if (saved !== null) setCollapsed(saved === "true");
    } catch (e) {
      console.warn("Failed to read sidebarCollapsed", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("sidebarCollapsed", String(collapsed));
    } catch (e) {
      console.warn("Failed to write sidebarCollapsed", e);
    }
  }, [collapsed, hydrated]);

  if (!hydrated) return null;

  return (
    // ✅ layout itself should not scroll
    <div className="flex h-screen w-full min-w-0 overflow-hidden">
      {/* Sidebar sticky */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Right side */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Navbar sticky */}
        <Navbar />

        {/* ✅ only this area scrolls */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>

        <FloatingAddButton href="/habits/new" />
      </div>
    </div>
  );
}
