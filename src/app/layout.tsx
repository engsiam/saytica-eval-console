import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { SkipLink } from "@/components/layout/skip-link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saytica Eval Console",
  description:
    "AI evaluation platform for model comparison and task management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-white font-sans text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SkipLink />
          <ErrorBoundary>
            <div className="lg:pl-60">
              <Sidebar />
              <MobileNav />
              <main id="main-content" className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-8 lg:min-h-screen">
                {children}
              </main>
            </div>
          </ErrorBoundary>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
