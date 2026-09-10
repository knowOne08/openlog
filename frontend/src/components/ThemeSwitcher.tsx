"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip title="Toggle theme">
      <IconButton
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        sx={{
          width: 44,
          height: 44,
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 4,
          "&:hover": {
            bgcolor: "action.hover",
            borderColor: "text.primary",
          },
        }}
      >
        {theme === "dark" ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
}
