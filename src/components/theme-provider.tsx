"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { siteConfig } from "@/config/site.config";

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <NextThemeProvider
      enableSystem={false}
      defaultTheme={String(siteConfig.mode)}
    >
      {children}
    </NextThemeProvider>
  );
}
