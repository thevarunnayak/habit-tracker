"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ThemeToggle from "./themeToggle";

export default function Navbar() {
  const { data: session } = useSession();

  const name = session?.user?.name || "user";
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "U";

  return (
    <header className="sticky top-0 z-40 h-14 border-b px-4 flex items-center justify-between bg-background">
      {/* ✅ Logo */}
      <Link href="/dashboard" className="flex items-center">
        {/* Mobile icon */}
        <Image
          src="/habithop-logo-icon.png"
          alt="Habithop"
          width={32}
          height={32}
          className="block sm:hidden"
          priority
        />

        {/* Full logo */}
        <Image
          src="/habithop-logo.png"
          alt="Habithop"
          width={140}
          height={32}
          className="hidden sm:block"
          priority
        />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-fit h-fit p-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
