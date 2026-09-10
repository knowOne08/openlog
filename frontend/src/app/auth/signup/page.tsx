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

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signup, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useRedirectIfAuthenticated();

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await signup({ email, password, fullName });
    if (result.success) {
      console.log("Signup successful, redirecting to dashboard...");
      router.push("/dashboard");
    }
  };

  // const handleGoogleSignUp = async () => {
  //   setIsLoading(true);
  //   try {
  //     // TODO: Implement Google OAuth
  //     console.log("Google signup");
  //   } catch (error) {
  //     console.error("Google signup error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleMicrosoftSignUp = async () => {
  //   setIsLoading(true);
  //   try {
  //     // TODO: Implement Microsoft OAuth
  //     console.log("Microsoft signup");
  //   } catch (error) {
  //     console.error("Microsoft signup error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <AuthLayout
      title="Let's get started"
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
        onSubmit={handleSignUp}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          id="fullname"
          type="text"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          autoComplete="name"
          fullWidth
        />
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
          autoComplete="new-password"
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

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          fullWidth
          size="large"
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>

        <Box
          sx={{
            textAlign: "center",
            fontSize: 14,
            color: "text.secondary",
            display: "grid",
            gap: 1,
          }}
        >
          <Box>
            By signing up, I agree to OpenLog&apos;s{" "}
            <MuiLink component={Link} href="/terms" underline="hover">
              Terms &amp; Privacy Policy
            </MuiLink>
          </Box>
          <Box>
            Already have an account?{" "}
            <MuiLink component={Link} href="/auth/signin" underline="hover">
              Sign in
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
}
