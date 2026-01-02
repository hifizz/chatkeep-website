import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "ChatKeep – The Missing OS for AI Chats",
  description:
    "Aggregate, highlight, search, and export your AI conversations locally. Gemini supported now; ChatGPT & Deepseek coming soon.",
  keywords: [
    "ai chat manager",
    "save gemini chats",
    "ai chat export",
    "chatgpt toc extension",
    "ai chat search",
    "export ai chat to markdown",
    "local-first chat history",
  ],
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
        </ThemeProvider>
      </body>
    </html>
  );
}
