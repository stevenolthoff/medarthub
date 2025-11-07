import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { TRPCReactProvider } from "@/lib/trpc-provider";
// import { SiteHeader } from "@/components/site-header"; // Import the new header
// import { SiteFooter } from "@/components/site-footer"; // Import the footer
// import { AuthProvider } from "@/hooks/use-auth"; // Import the AuthProvider
// import { CookieConsentBanner } from "@/components/cookie-consent-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://medicalartists.co";

const defaultTitle = "Medical Artists | Behance for Medical Illustrators";
const defaultDescription =
  "Join the Medical Artists early access waitlist to showcase your medical illustration portfolio and get found on Google.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: defaultTitle,
    template: "%s | Medical Artists",
  },
  description: defaultDescription,
  keywords: [
    "medical illustrators",
    "medical illustration portfolio",
    "scientific illustration",
    "biomedical art",
    "healthcare branding",
    "medical art marketplace",
  ],
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    type: "website",
    url: baseUrl,
    siteName: "Medical Artists",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <TRPCReactProvider>
          <AuthProvider>
            <div className="flex min-h-svh flex-col">
              <SiteHeader />
              <main className="flex flex-1 flex-col">
                {children}
              </main>
              <SiteFooter />
            </div>
            <CookieConsentBanner />
          </AuthProvider>
        </TRPCReactProvider> */}
        {children}
      </body>
    </html>
  );
}
