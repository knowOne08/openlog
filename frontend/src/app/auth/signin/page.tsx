"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useRedirectIfAuthenticated();

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await login({ email, password });
    if (result.success) {
      console.log("Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    }
  };

  return (
    <AuthLayout
      title="Sign into your account"
      subtitle="A Window to your new World."
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
            src="/images/image.png"
            alt="Hero Image"
            fill
            className="object-cover"
          />
        </Box>
      }
    >
      <Box
        component="form"
        onSubmit={handleSignIn}
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

        <TextField
          id="password"
          type={isPasswordVisible ? "text" : "password"}
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <MuiLink
            component={Link}
            href="/auth/forgot-password"
            underline="hover"
            sx={{ fontSize: 14 }}
          >
            Forgot password?
          </MuiLink>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          fullWidth
          size="large"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <Box
          sx={{ textAlign: "center", fontSize: 14, color: "text.secondary" }}
        >
          Don&apos;t have an account?{" "}
          <MuiLink component={Link} href="/auth/signup" underline="hover">
            Sign up
          </MuiLink>
        </Box>
      </Box>
    </AuthLayout>
  );
}
