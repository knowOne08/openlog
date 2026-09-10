import { createTheme, alpha, ThemeOptions } from "@mui/material/styles";

// 1. Primitive Design Tokens
const paletteTokens = {
  space: {
    950: "#06080C", // Canvas background
    900: "#0B0E14", // Surface cards & panels
    800: "#121722", // Elevated components
    700: "#1A2232", // Borders & structural rules
    600: "#2B374E", // Interactive default borders
    500: "#4B5E80", // Muted details / placeholders
    400: "#7C90B3", // Secondary text
    100: "#E6EDF8", // Primary high-contrast text
  },
  accent: {
    cyan: "#00D2FF",    // Primary interactive telemetry signal
    blue: "#0070F3",    // Action primary
    emerald: "#00E676", // System pass / High relevance
    amber: "#FFB300",   // Warning signal
    crimson: "#FF3344", // System error / Critical
  },
};

export const getTelemetryTheme = (mode: "light" | "dark") => {
  const isDark = mode === "dark";

  const options: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? paletteTokens.accent.cyan : paletteTokens.accent.blue,
        contrastText: isDark ? paletteTokens.space[950] : "#FFFFFF",
      },
      secondary: {
        main: paletteTokens.space[400],
      },
      background: {
        default: isDark ? paletteTokens.space[950] : "#F4F6F8",
        paper: isDark ? paletteTokens.space[900] : "#FFFFFF",
      },
      text: {
        primary: isDark ? paletteTokens.space[100] : "#0B0E14",
        secondary: isDark ? paletteTokens.space[400] : "#5A6A85",
      },
      divider: isDark ? alpha(paletteTokens.space[700], 0.8) : "#E2E8F0",
      success: { main: paletteTokens.accent.emerald },
      warning: { main: paletteTokens.accent.amber },
      error: { main: paletteTokens.accent.crimson },
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 700, letterSpacing: "-0.03em" },
      h2: { fontWeight: 700, letterSpacing: "-0.025em" },
      h3: { fontWeight: 600, letterSpacing: "-0.02em" },
      body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
      body2: { fontSize: "0.84375rem", lineHeight: 1.5 },
      button: {
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        textTransform: "uppercase",
        fontWeight: 600,
        letterSpacing: "0.04em",
      },
      caption: {
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: "0.72rem",
        letterSpacing: "0.03em",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: "antialiased",
            scrollBehavior: "smooth",
          },
          "code, pre": {
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ ownerState }) => ({
            borderRadius: 2,
            boxShadow: "none",
            minHeight: 36,
            padding: "8px 16px",
            transition: "all 0.15s ease-in-out",
            ...(ownerState.variant === "contained" && {
              "&:hover": {
                boxShadow: isDark
                  ? `0 0 16px ${alpha(paletteTokens.accent.cyan, 0.35)}`
                  : `0 0 12px ${alpha(paletteTokens.accent.blue, 0.25)}`,
              },
            }),
            ...(ownerState.variant === "outlined" && {
              borderColor: isDark ? paletteTokens.space[700] : "#CBD5E1",
              "&:hover": {
                borderColor: isDark ? paletteTokens.accent.cyan : paletteTokens.accent.blue,
                backgroundColor: alpha(
                  isDark ? paletteTokens.accent.cyan : paletteTokens.accent.blue,
                  0.04
                ),
              },
            }),
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: "none",
            border: `1px solid ${isDark ? paletteTokens.space[700] : "#E2E8F0"}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.875rem",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? paletteTokens.space[700] : "#CBD5E1",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? paletteTokens.space[500] : "#94A3B8",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? paletteTokens.accent.cyan : paletteTokens.accent.blue,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            fontWeight: 600,
          },
        },
      },
    },
  };

  return createTheme(options);
};