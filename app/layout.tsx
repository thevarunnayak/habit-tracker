import SessionProviders from "@/components/providers/sessionProvider";
import ThemeProvider from "@/components/providers/themeProvider";
import OverlayLoaderConsumer from "@/components/providers/overlayLoaderConsumer";
import { Toaster } from "@/components/ui/sonner";
import { GlobalLoaderProvider } from "@/components/providers/globalLoaderProvider";
import "./global.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProviders>
          <ThemeProvider>
            <GlobalLoaderProvider>
              {children}

              {/* ✅ CLIENT component rendered safely */}
              <OverlayLoaderConsumer />

              <Toaster richColors />
            </GlobalLoaderProvider>
          </ThemeProvider>
        </SessionProviders>
      </body>
    </html>
  );
}
