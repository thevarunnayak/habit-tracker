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

  // ✅ hydrate state from localStorage safely
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem("sidebarCollapsed");
        if (saved !== null) {
          setCollapsed(saved === "true");
        }
      }
    } catch (error) {
      console.warn("Failed to read sidebarCollapsed from localStorage", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ✅ persist state safely
  useEffect(() => {
    if (!hydrated) return;

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sidebarCollapsed", String(collapsed));
      }
    } catch (error) {
      console.warn("Failed to write sidebarCollapsed to localStorage", error);
    }
  }, [collapsed, hydrated]);

  // avoid hydration mismatch flash
  if (!hydrated) return null;

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 min-h-screen relative">
        <Navbar />
        <main className="p-6">{children}</main>

        <FloatingAddButton href="/habits/new" />
      </div>
    </div>
  );
}
