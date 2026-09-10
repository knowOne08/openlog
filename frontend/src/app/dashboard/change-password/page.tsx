"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Visibility, VisibilityOff } from "@mui/icons-material";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("surfe_access_token");
      if (!token) {
        setError("You must be logged in to change your password");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(
          data.error?.message || data.message || "Failed to change password",
        );
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (caughtError) {
      console.error("Password change error:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to change password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
        <Paper sx={{ maxWidth: 480, width: "100%", p: 4, textAlign: "center", border: 1, borderColor: "divider" }}>
          <CheckCircle sx={{ fontSize: 56, color: "success.main", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Password Changed Successfully!
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Your password has been updated. Redirecting to dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper sx={{ maxWidth: 520, width: "100%", p: 4, border: 1, borderColor: "divider" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Change Password
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Update your password to keep your account secure
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            id="current-password"
            type={isCurrentPasswordVisible ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            label="Current Password"
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)} edge="end">
                      {isCurrentPasswordVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="new-password"
            type={isNewPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            label="New Password"
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)} edge="end">
                      {isNewPasswordVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            id="confirm-password"
            type={isConfirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm New Password"
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} edge="end">
                      {isConfirmPasswordVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" variant="contained" disabled={isLoading} fullWidth size="large">
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>

          <Button type="button" variant="outlined" fullWidth onClick={() => router.push("/dashboard")} disabled={isLoading}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
