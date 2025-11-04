"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
  Divider,
  Image,
} from "@heroui/react";
import { ChevronLeftIcon, MailFilledIcon } from "@heroui/shared-icons";

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
        }
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
          : "Failed to send password reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center space-y-6 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full">
              <MailFilledIcon className="h-8 w-8 text-success-600" />
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
                variant="light"
                size="sm"
                className="p-0 h-auto min-w-0 text-primary underline"
                onPress={() => setIsSubmitted(false)}
              >
                try again
              </Button>
            </p>

            <Divider />

            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-primary"
              underline="hover"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-none">
          <CardHeader className="flex flex-col items-center pb-0 pt-8">
            <div className="text-4xl font-bold text-default-800 mb-4">*</div>
            <h2 className="text-2xl font-bold text-default-800 text-center">
              Reset your password
            </h2>
            <p className="text-sm text-default-600 text-center mt-2">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
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
                type="email"
                label="Email"
                variant="bordered"
                value={email}
                onValueChange={setEmail}
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
                spinner={
                  <svg
                    className="animate-spin h-5 w-5 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                }
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="text-center mt-5">
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-sm text-default-600"
                underline="hover"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right Panel - Image Placeholder */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-content1">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/hero_image.jpg"
            alt="Hero Image"
            className="w-full h-full object-cover"
            removeWrapper
          />
        </div>
      </div>
    </div>
  );
}
