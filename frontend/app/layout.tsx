import type { Metadata } from "next";
import { Geist_Mono, Montserrat, Poppins, Lato, Geist, Source_Code_Pro } from "next/font/google";
import { cn } from "@/lib/utils";
import LayoutClient from "./LayoutClient";
import "./globals.css";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "700"] });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["400", "700"] });
const sourcecode = Source_Code_Pro({ variable: "--font-sourcecode", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "BizTech Analytics",
  description: "AI-Powered Factory Productivity Dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geist.variable, geistMono.variable, "font-sans")}
    >
      <body
        className="relative min-h-full w-full flex flex-col font-sans bg-background text-foreground">
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
