"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { CheckCircle, ChevronLeft } from "@mui/icons-material";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // Get token from URL hash (Supabase sends it as #access_token=...)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      setToken(accessToken);
    } else {
      setError(
        "Invalid or missing reset token. Please request a new password reset link.",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError(
        "Invalid reset token. Please request a new password reset link.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Use setError directly instead of throwing
        setError(data.error || data.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <CheckCircle sx={{ fontSize: 56, color: "success.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Password Reset Successful
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Your password has been successfully reset. You will be redirected to
            the sign in page shortly.
          </Typography>
          <MuiLink component={Link} href="/auth/signin" underline="hover">
            Go to sign in now
          </MuiLink>
        </Box>
      </Box>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below."
      showBackLink
      backLinkHref="/auth/signin"
      backLinkText="Back to sign in"
      rightPanelContent={
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            minHeight: 560,
            px: 4,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="h2" sx={{ mb: 2 }}>
              *
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Secure Password Reset
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Create a strong password to protect your account.
            </Typography>
          </Box>
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
          type="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <TextField
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !token}
        >
          Reset Password
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
