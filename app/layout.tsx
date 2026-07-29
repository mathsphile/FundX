import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "CrowdFundX — Launch. Fund. Build. Powered by Stellar.",
  description:
    "Decentralized crowdfunding platform powered by Soroban smart contracts on Stellar. Securing funds with zero middleman and 100% automated refunds.",
  keywords: ["Stellar", "Soroban", "Crowdfunding", "Web3", "Crypto", "XLM", "Smart Contracts", "Kickstarter"],
  openGraph: {
    title: "CrowdFundX — Decentralized Crowdfunding on Stellar",
    description: "Launch. Fund. Build. Secured by Soroban Smart Contracts.",
    url: "https://crowdfundx.stellar.org",
    siteName: "CrowdFundX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-[#FF5A00] selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
