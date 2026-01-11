export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4 font-semibold">Habit Tracker</header>
      <main className="p-6">{children}</main>
    </div>
  );
}
