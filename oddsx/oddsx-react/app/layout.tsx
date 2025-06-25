import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/public/scss/style.scss";
import MainFooter from "@/components/Shared/MainFooter";
import FooterCard from "@/components/Shared/FooterCard";
import { AuthProvider } from "@/contexts/AuthContext";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://winzo-platform.netlify.app';

export const metadata: Metadata = {
  title: "WINZO - Professional Sports Betting Platform",
  description: "Professional sports betting platform with real-time odds, live betting, and comprehensive analytics. Built with Next.js and React.",
  keywords: ["sports betting", "live betting", "odds", "winzo", "sports platform"],
  authors: [{ name: "WINZO Team" }],
  creator: "WINZO",
  publisher: "WINZO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(frontendUrl),
  openGraph: {
    title: "WINZO - Professional Sports Betting Platform",
    description: "Professional sports betting platform with real-time odds and live betting",
    url: frontendUrl,
    siteName: "WINZO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WINZO - Professional Sports Betting Platform",
    description: "Professional sports betting platform with real-time odds and live betting",
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BetSlipProvider>
            <main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
              {children}
              <FooterCard />
              <MainFooter />
            </main>
          </BetSlipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
