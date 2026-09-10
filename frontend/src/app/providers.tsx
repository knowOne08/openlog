"use client";

import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";
import { getTelemetryTheme } from "@/theme/muiTheme";

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const muiTheme = useMemo(
    () => getTelemetryTheme(resolvedTheme === "light" ? "light" : "dark"),
    [resolvedTheme],
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <MuiThemeBridge>{children}</MuiThemeBridge>
    </NextThemesProvider>
  );
}
