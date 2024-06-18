import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { inter, lexendDeca } from "@/app/fonts";
import MainLayout from "@/layouts/(main-layout-components)/layout";
import GlobalDrawer from "@/app/shared/drawer-views/container";
import GlobalModal from "@/app/shared/modal-views/container";
import { cn } from "@/utils/class-names";
import NextProgress from "@/components/next-progress";
import { siteConfig } from "@/config/site.config";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      // 💡 Prevent next-themes hydration warning
      suppressHydrationWarning
    >
      <body
        // 💡 Prevent hydration warnings caused by third-party extensions, such as Grammarly.
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, "font-inter")}
      >
        <ThemeProvider>
          <NextProgress />
            {children}
          <GlobalDrawer />
          <GlobalModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
