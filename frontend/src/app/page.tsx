"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import { ArrowForward, Description, Language } from "@mui/icons-material";

const quickLinks = [["Sign In", "/auth/signin"], ["Create Account", "/auth/signup"], ["Dashboard", "/dashboard"]];
const resources = [["Documentation", "https://nextjs.org/learn"], ["Templates", "https://vercel.com/templates?framework=next.js"], ["Next.js", "https://nextjs.org"]];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 36);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary", display: "flex", flexDirection: "column" }}>
      <Box component="header" sx={{ position: "fixed", top: scrolled ? { xs: 12, sm: 24 } : 0, left: 0, right: 0, zIndex: 2, px: scrolled ? { xs: 2, sm: 3 } : 0, transition: "top 220ms ease, padding 220ms ease" }}>
        <Box sx={{ maxWidth: scrolled ? 550 : "none", mx: "auto", px: scrolled ? { xs: 2, sm: 3 } : { xs: 2.5, md: 5 }, py: 1.5, border: 1, borderColor: "divider", borderRadius: scrolled ? 999 : 0, bgcolor: "background.paper", boxShadow: scrolled ? 3 : 0, transition: "max-width 220ms ease, border-radius 220ms ease, box-shadow 220ms ease, padding 220ms ease" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 700 }}>OpenLog</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
              <Button component={Link} href="/auth/signin" variant="text" size="small">Sign in</Button>
              <Button component={Link} href="/dashboard" variant="text" size="small" endIcon={<ArrowForward sx={{ fontSize: 16 }} />}>Dashboard</Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box component="main" sx={{ minHeight: { xs: 560, sm: 650 }, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, pt: { xs: 12, sm: 10 }, pb: { xs: 8, sm: 10 } }}>
        <Box sx={{ width: "100%", maxWidth: 900, textAlign: "center" }}>
          <Chip label="System Ready" size="small" color="success" variant="outlined" sx={{ mb: { xs: 2.5, sm: 3 } }} />
          <Typography component="h1" sx={{ fontSize: { xs: 42, sm: 64, md: 82 }, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.055em" }}>Welcome to OpenLog</Typography>
          <Typography sx={{ maxWidth: 650, mx: "auto", mt: 3, fontSize: { xs: 16, sm: 19 }, lineHeight: 1.55, color: "text.secondary" }}>Advanced search system. Secure, scalable, and ready to integrate with your workflow.</Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "center", alignItems: "center", gap: 1.5, mt: 4 }}>
            <Button component={Link} href="/auth/signin" variant="contained" size="large">Sign In</Button>
            <Button component={Link} href="/dashboard" variant="outlined" size="large">Get Started</Button>
          </Box>
        </Box>
      </Box>

      <Box component="footer" sx={{ mt: "auto", borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2.5, md: 5 }, py: { xs: 4, md: 5 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: { xs: 4, md: 8 } }}>
            <Box><Typography sx={{ fontSize: 20, fontWeight: 700 }}>OpenLog</Typography><Typography variant="body2" sx={{ mt: 1.5, maxWidth: 260, color: "text.secondary" }}>Advanced search designed for scalability and security.</Typography></Box>
            <Box><Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}><Description sx={{ color: "primary.main", fontSize: 18 }} /><Typography sx={{ fontWeight: 650 }}>Quick Links</Typography></Box><Stack spacing={.25}>{quickLinks.map(([label, href]) => <Button key={label} component={Link} href={href} variant="text" sx={{ justifyContent: "flex-start", px: 0, minHeight: 30 }}>{label}</Button>)}</Stack></Box>
            <Box><Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}><Language sx={{ color: "primary.main", fontSize: 18 }} /><Typography sx={{ fontWeight: 650 }}>Resources</Typography></Box><Stack spacing={.25}>{resources.map(([label, href]) => <Button key={label} component="a" href={href} target="_blank" rel="noreferrer" variant="text" sx={{ justifyContent: "flex-start", px: 0, minHeight: 30 }}>{label}</Button>)}</Stack></Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>© 2025 OpenLog. Built with Next.js and designed for performance.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
