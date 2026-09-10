"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronLeft, MarkEmailRead } from "@mui/icons-material";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send password reset email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Box
        sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 480,
            p: 4,
            borderRadius: 4,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            textAlign: "center",
            boxShadow: 10,
          }}
        >
          <MarkEmailRead sx={{ fontSize: 56, color: "success.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Check your email
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            We&apos;ve sent a password reset link to{" "}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {email}
            </Box>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 3 }}
          >
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Button
              variant="text"
              onClick={() => setIsSubmitted(false)}
              sx={{ p: 0, minWidth: 0, textDecoration: "underline" }}
            >
              try again
            </Button>
          </Typography>
          <MuiLink
            component={Link}
            href="/auth/signin"
            underline="hover"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
          >
            <ChevronLeft fontSize="small" />
            Back to sign in
          </MuiLink>
        </Box>
      </Box>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      showBackLink
      backLinkHref="/auth/signin"
      backLinkText="Back to sign in"
      rightPanelContent={
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 560,
          }}
        >
          <Image
            src="/images/hero_image.jpg"
            alt="Hero Image"
            fill
            className="object-cover"
          />
        </Box>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          fullWidth
          size="large"
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
        <Box sx={{ textAlign: "center" }}>
          <MuiLink
            component={Link}
            href="/auth/signin"
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: 14,
            }}
          >
            <ChevronLeft fontSize="small" />
            Back to sign in
          </MuiLink>
        </Box>
      </Box>
    </AuthLayout>
  );
}
