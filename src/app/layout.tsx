import type { Metadata, Viewport } from "next";
import { Antonio, Public_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { getEvents, getTaskTemplates } from "@/features/events/data/queries";
import { EventsStoreProvider } from "@/features/events/store/events-store";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

import "./globals.css";

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [events, taskTemplates] = await Promise.all([
    getEvents(),
    getTaskTemplates(),
  ]);

  return (
    <html
      lang="es"
      className={`${antonio.variable} ${publicSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <EventsStoreProvider
          initialEvents={events}
          initialTaskTemplates={taskTemplates}
        >
          {children}
          <AppBottomNav />
        </EventsStoreProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
