import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SUPPORTED_AI_PLATFORMS_TEXT } from "~/lib/platform-support";

import { CookieConsentBanner } from "~/components/cookie-consent-banner";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "ChatKeep – The Missing OS for AI Chats",
  description: `Aggregate, highlight, search, and export AI conversations locally. Supports ${SUPPORTED_AI_PLATFORMS_TEXT}.`,
  keywords: [
    "ai chat manager",
    "save gemini chats",
    "ai chat export",
    "chatgpt toc extension",
    "ai chat search",
    "export ai chat to markdown",
    "local-first chat history",
  ],
  icons: [
    { rel: "icon", url: "/logo.png", type: "image/png" },
    { rel: "shortcut icon", url: "/logo.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/logo.png" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-neutral-950 text-neutral-50 font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <CookieConsentBanner
            gaId={env.NEXT_PUBLIC_GA_ID}
            clarityId={env.NEXT_PUBLIC_CLARITY_ID}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
