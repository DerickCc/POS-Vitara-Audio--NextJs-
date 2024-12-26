import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { inter, lexendDeca } from '@/app/fonts';
import { cn } from '@/utils/class-names';
import NextProgress from '@/components/next-progress';
import { siteConfig } from '@/config/site.config';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';
import { OverlayLoadingProvider } from '@/hooks/use-overlay-loading';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      dir='ltr'
      // 💡 Prevent next-themes hydration warning
      suppressHydrationWarning
    >
      <body
        // 💡 Prevent hydration warnings caused by third-party extensions, such as Grammarly.
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
      >
        <ThemeProvider>
          <AuthProvider>
            <OverlayLoadingProvider>
              <NextProgress />
              {children}
              <Toaster position='top-right' />
            </OverlayLoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
