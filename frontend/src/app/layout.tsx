// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import Head from "next/head";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@heroui/theme@2.4.21/dist/index.css"
        />
      </Head>
      <body className="text-foreground bg-background relative min-h-screen">
        <Providers>
          {children}
          {/* Fixed ThemeSwitcher at bottom right */}
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeSwitcher />
          </div>
        </Providers>
      </body>
    </html>
  );
}
