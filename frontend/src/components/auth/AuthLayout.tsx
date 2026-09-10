"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Box, Link as MuiLink, Paper, Typography } from "@mui/material";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  rightPanelContent?: ReactNode;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  rightPanelContent,
  showBackLink = false,
  backLinkHref = "/auth/signin",
  backLinkText = "Back to sign in",
}: AuthLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3, lg: 6 },
          py: 4,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
              OpenLog
            </Typography>
            <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              {subtitle}
            </Typography>
          </Box>

          {children}
        </Paper>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          px: 6,
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#1D1C19",
          color: "#FDFCFA",
        }}
      >
        {showBackLink && (
          <Box sx={{ textAlign: "right", mb: 6 }}>
            <MuiLink
              component={Link}
              href={backLinkHref}
              underline="hover"
              sx={{ color: "#D3D2CD", fontWeight: 600 }}
            >
              {backLinkText}
            </MuiLink>
          </Box>
        )}

        {rightPanelContent || (
          <Box sx={{ textAlign: "center", color: "#FDFCFA" }}>
            <Box
              sx={{
                mx: "auto",
                mb: 4,
                width: 320,
                height: 320,
                borderRadius: 1,
                backgroundColor: "rgba(255,255,255,0.08)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  🏄‍♂️
                </Typography>
                <Typography variant="body2">Searching together</Typography>
              </Box>
            </Box>
            <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.7 }}>
              trusted by
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mt: 2 }}>
              {['Google', 'Uber', 'MIRAKL', 'spendesk'].map((brand) => (
                <Typography key={brand} variant="subtitle2" sx={{ opacity: 0.65, fontWeight: 700 }}>
                  {brand}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
