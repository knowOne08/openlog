"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, Input, Button, Link, Label } from "@heroui/react";
import { ChevronLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center space-y-6 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full">
              <EnvelopeIcon className="h-8 w-8 text-success-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-default-800">
                Check your email
              </h2>
              <p className="text-sm text-default-600">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <p className="text-xs text-default-500">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto min-w-0 text-primary underline"
                onPress={() => setIsSubmitted(false)}
              >
                try again
              </Button>
            </p>

            <div className="border-t border-divider"></div>

            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-none">
          <div className="flex flex-col items-center pb-0 pt-8 px-8">
            <div className="text-4xl font-bold text-default-800 mb-4">*</div>
            <h2 className="text-2xl font-bold text-default-800 text-center">
              Reset your password
            </h2>
            <p className="text-sm text-default-600 text-center mt-2">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>
          </div>

          <div className="pt-6 px-8 pb-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                  placeholder="Enter your email"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-foreground text-white font-medium"
                isDisabled={isLoading}
                variant="primary"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="text-center mt-5">
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-sm text-default-600 hover:underline"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Image Placeholder */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-content1">
        <Image
          src="/images/hero_image.jpg"
          alt="Hero Image"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
