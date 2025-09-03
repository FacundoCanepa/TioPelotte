import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import { islandMoments, ebGaramond } from "@/lib/fonts/fonts";
import { Toaster } from "sonner";
import UserSessionLoader from "@/components/providers/UserSessionLoader";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Tio pelotte",
  description: "Ecommerce tio pelotte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${islandMoments.variable} ${ebGaramond.variable} antialiased min-h-dvh bg-[#FBE6D4] flex flex-col`}>
        <UserSessionLoader />
        <Navbar />
        <main className="flex-1">{children}</main>
        <ClientLayoutWrapper />

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: "#FFF4E3", color: "#4B2E2E", border: "1px solid #e6c9a2" },
          }}
        />

        {/* Web Analytics (pageviews, visitantes) */}
        {process.env.NODE_ENV === "production" && <Analytics />}

        {/* Speed Insights (Core Web Vitals) */}
        {process.env.NODE_ENV === "production" && <SpeedInsights />}
      </body>
    </html>
  );
}
