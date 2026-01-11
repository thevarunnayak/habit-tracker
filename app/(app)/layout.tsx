import AppShell from "@/components/layout/appShell";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
