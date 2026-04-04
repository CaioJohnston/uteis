"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/language";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
