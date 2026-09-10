// app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Box } from "@mui/material";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative min-h-screen">
        <Providers>
          <Box
            sx={{
              minHeight: "100vh",
              color: "text.primary",
              bgcolor: "background.default",
            }}
          >
            {children}
          </Box>
          <Box
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1300,
            }}
          >
            <ThemeSwitcher />
          </Box>
        </Providers>
      </body>
    </html>
  );
}