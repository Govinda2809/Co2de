import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { SmoothScrolling } from "@/components/smooth-scrolling";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CO2DE - Code Environmental Impact Analyzer",
    template: "%s | CO2DE",
  },
  description: "Analyze the environmental footprint of your code. Get AI-powered insights and actionable optimizations for greener software.",
  keywords: ["code analysis", "carbon footprint", "green software", "sustainability", "energy efficiency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans selection:bg-white selection:text-black`}
      >
        <SmoothScrolling>
          <Providers>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </Providers>
        </SmoothScrolling>
      </body>
    </html>
  );
}
