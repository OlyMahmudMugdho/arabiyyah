import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Arabiyyah (العربية) | Arabic Learning Resource Platform",
  description:
    "An open treasury of structured learning paths, grammar courses, classical books, and cheat sheets for students of the Arabic language.",
};

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('arabiyyah_theme') || localStorage.getItem('bayan_theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored || 'dark';
      var resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
      document.documentElement.classList.remove('dark', 'sepia');
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (resolved === 'sepia') {
        document.documentElement.classList.add('sepia');
        document.documentElement.setAttribute('data-theme', 'sepia');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
