"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

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
    <Button
      onPress={toggleTheme}
      size="sm"
      variant="shadow"
      className="bg-foreground text-background hover:bg-foreground/90"
      aria-label="Toggle dark mode"
      style={{ minWidth: "40px", minHeight: "44px", borderRadius: "50%" }}
    >
      {theme === "dark" ? (
        <SunIcon className="w-5 h-5 text-yellow-500" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-100" />
      )}
    </Button>
  );
}
