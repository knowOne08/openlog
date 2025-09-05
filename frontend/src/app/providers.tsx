// "use client";

// import { HeroUIProvider } from "@heroui/react";

// export function Providers({ children }: { children: React.ReactNode }) {
//   return <HeroUIProvider>{children}</HeroUIProvider>;
// }

// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { HeroUIProvider } from "@heroui/react";

// type ThemeContextType = {
//   theme: "light" | "dark";
//   toggleTheme: () => void;
// };

// const ThemeContext = createContext<ThemeContextType>({
//   theme: "light",
//   toggleTheme: () => {},
// });

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const [theme, setTheme] = useState<"light" | "dark">("light");

//   // On first load, set theme from localStorage or system preference
//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");
//     if (
//       savedTheme === "dark" ||
//       (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
//     ) {
//       setTheme("dark");
//       document.documentElement.classList.add("dark");
//     } else {
//       setTheme("light");
//       document.documentElement.classList.remove("dark");
//     }
//   }, []);

//   // Update <html> class and localStorage on theme change
//   useEffect(() => {
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const toggleTheme = () =>
//     setTheme((prev) => (prev === "dark" ? "light" : "dark"));

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export const useTheme = () => useContext(ThemeContext);

// export function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <ThemeProvider>
//       <HeroUIProvider>{children}</HeroUIProvider>
//     </ThemeProvider>
//   );
// }

"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
    >
      <HeroUIProvider>{children}</HeroUIProvider>
    </NextThemesProvider>
  );
}
