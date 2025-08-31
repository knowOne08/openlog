"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
import {
  InputField,
  PasswordField,
  Button,
  SocialButton,
  Separator,
  ComplianceInfo,
} from "@/components/auth/FormComponents";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useRedirectIfAuthenticated();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await login({ email, password });
    if (result.success) {
      console.log("Login successful, redirecting to dashboard...");
      // Force redirect to dashboard after successful login
      router.push("/dashboard");
    }
  };

  // const handleGoogleSignIn = async () => {
  //   // TODO: Implement Google OAuth
  //   console.log('Google signin');
  // };

  // const handleMicrosoftSignIn = async () => {
  //   // TODO: Implement Microsoft OAuth
  //   console.log('Microsoft signin');
  // };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 text-6xl text-gray-400">
              *
            </div>
            <div
              className="absolute inset-0"
              style={
                {
                  // backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  // backgroundSize: '20px 20px'
                }
              }
            ></div>
          </div>

          {/* Form Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-800 mb-4">*</div>
              <h2 className="text-2xl font-bold text-gray-800">
                Sign into your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                New gigs personalized for you are waiting.
              </p>
            </div>

            {/* Social Sign-in Buttons */}
            {/* <div className="space-y-3">
            <SocialButton
              provider="google"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Sign in with Google
            </SocialButton>

            <SocialButton
              provider="microsoft"
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
            >
              Sign in with Microsoft
            </SocialButton>
          </div> */}

            {/* Separator */}
            {/* <Separator /> */}

            {/* Email Sign-in Form */}
            <form className="space-y-4" onSubmit={handleSignIn}>
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <PasswordField
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="space-y-2 text-center text-sm text-gray-600">
              <div>
                Can&apos;t sign in?{" "}
                <Link
                  href="/auth/forgot-password"
                  className="underline hover:text-gray-800"
                >
                  Reset password
                </Link>
              </div>
              <div>
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="underline hover:text-gray-800"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Image Placeholder */}
      {/* <div className="hidden lg:flex lg:flex-1 bg-gray-900 relative overflow-hidden"> */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Image Placeholder */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"> */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">
              <img src="/images/hero_image.jpg" alt="hero_image" />
            </div>
            {/* <p className="text-lg font-medium">Image Placeholder</p> */}
            {/* <p className="text-sm text-gray-300 mt-2">Right section for hero image</p> */}
          </div>
        </div>

        {/* Navigation Arrows (Placeholder) */}
        {/* <div className="absolute bottom-8 left-8 text-white text-2xl opacity-50">
          ←
        </div>
        <div className="absolute bottom-8 right-8 text-white text-2xl opacity-50">
          →
        </div> */}
      </div>
    </div>
  );
}
