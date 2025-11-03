"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Input, Button, Link } from "@heroui/react";
import { CheckIcon, ChevronLeftIcon } from "@heroui/shared-icons";

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
        "Invalid or missing reset token. Please request a new password reset link."
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
        "Invalid reset token. Please request a new password reset link."
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
        }
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
          : "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center space-y-6 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100">
              <CheckIcon className="h-8 w-8 text-success-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-default-800">
                Password Reset Successful
              </h2>
              <p className="text-sm text-default-600">
                Your password has been successfully reset. You will be
                redirected to the sign in page shortly.
              </p>
            </div>

            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-primary"
              underline="hover"
            >
              Go to sign in now
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-none">
          <CardHeader className="flex flex-col items-center pb-0 pt-8">
            <div className="text-4xl font-bold text-default-800 mb-4">*</div>
            <h2 className="text-2xl font-bold text-default-800 text-center">
              Set New Password
            </h2>
            <p className="text-sm text-default-600 text-center mt-2">
              Enter your new password below.
            </p>
          </CardHeader>

          <CardBody className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Input
                type="password"
                label="New Password"
                variant="bordered"
                value={password}
                onValueChange={setPassword}
                isRequired
                suppressHydrationWarning
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium",
                }}
              />

              <Input
                type="password"
                label="Confirm Password"
                variant="bordered"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isRequired
                suppressHydrationWarning
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium",
                }}
              />

              <Button
                type="submit"
                color="default"
                size="lg"
                className="w-full bg-default-900 text-white font-medium"
                isLoading={isLoading}
                isDisabled={!token}
              >
                Reset Password
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center text-sm text-default-600"
                  underline="hover"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Right Panel - Branding (optional, matches forgot-password page) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-100 to-secondary-100 items-center justify-center p-12">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl font-bold text-default-800">*</div>
          <h1 className="text-4xl font-bold text-default-800">
            Secure Password Reset
          </h1>
          <p className="text-lg text-default-600">
            Create a strong password to protect your account.
          </p>
        </div>
      </div>
    </div>
  );
}
