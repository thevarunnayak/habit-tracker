import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full px-4 py-4 lg:py-10 sm:px-6 lg:px-8 flex items-start lg:items-center justify-center bg-gradient-to-b from-white to-zinc-50">

      <Card className="relative w-full max-w-sm sm:max-w-md rounded-2xl border-zinc-200/70 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900">
              {title}
            </CardTitle>
            {subtitle ? (
              <p className="text-sm text-zinc-500">{subtitle}</p>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </div>
  );
}
