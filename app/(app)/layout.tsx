import LogoutButton from "@/components/auth/logoutButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4 font-semibold">
        <div className="w-full flex justify-between">
          <p>HabitHop</p>
          <LogoutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
