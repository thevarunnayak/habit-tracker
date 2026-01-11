"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingAddButton({
  href = "/habits/new",
}: {
  href?: string;
}) {
  return (
    <Link href={href} className="fixed bottom-6 right-6 z-50">
      <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
        <Plus className="h-6 w-6" />
      </Button>
    </Link>
  );
}
