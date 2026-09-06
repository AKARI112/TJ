import type { Metadata, Viewport } from "next";
import { Fustat } from "next/font/google";
import { AppShell } from "@/components/app/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";
import "./quran.css";
import "./mushaf.css";
import "./library.css";

const fustat = Fustat({
  variable: "--font-fustat",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const deploymentUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: {
    default: "ذُو الجَلاَلْ — رفيقك الإسلامي اليومي",
    template: "%s | ذُو الجَلاَلْ",
  },
  description:
    "رفيق إسلامي عربي للقرآن والصلاة والأذكار والحديث، بهدوء ووضوح ومصادر موثقة.",
  applicationName: "ذُو الجَلاَلْ",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  other: { google: "notranslate" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "ذُو الجَلاَلْ",
    title: "ذُو الجَلاَلْ — رفيقك الإسلامي اليومي",
    description: "القرآن والصلاة والقبلة والحديث والتلاوات في تجربة عربية هادئة.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f3" },
    { media: "(prefers-color-scheme: dark)", color: "#101113" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={fustat.variable}
    >
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
