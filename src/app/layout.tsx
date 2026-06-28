import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppNav } from "@/shared/components/app-nav";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Gymnazjos",
  description: "Private gym progress and diet tracking app"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen pb-20 md:pb-0">
            <AppNav />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
