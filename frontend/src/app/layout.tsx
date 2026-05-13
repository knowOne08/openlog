// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-foreground bg-background relative min-h-screen">
        <Providers>
          {children}
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeSwitcher />
          </div>
        </Providers>
      </body>
    </html>
  );
}
