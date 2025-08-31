"use client";

import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement signup logic with backend
      console.log("Signing up with:", { email, password });
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth
      console.log("Google signup");
    } catch (error) {
      console.error("Google signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignUp = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Microsoft OAuth
      console.log("Microsoft signup");
    } catch (error) {
      console.error("Microsoft signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              style={{
                backgroundImage:
                  "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          {/* Form Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-800 mb-4">*</div>
              <h2 className="text-2xl font-bold text-gray-800">
                Let&apos;s get started
              </h2>
              {/* <p className="mt-2 text-sm text-gray-600">
                Sign up here
              </p> */}
            </div>

            {/* Social Sign-up Buttons */}
            {/* <div className="space-y-3">
              <button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                  G
                </div>
                Sign up with Google
              </button> */}

            {/* <button
                onClick={handleMicrosoftSignUp}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-5 h-5 grid grid-cols-2 gap-0.5 mr-3">
                  <div className="w-2 h-2 bg-red-500"></div>
                  <div className="w-2 h-2 bg-green-500"></div>
                  <div className="w-2 h-2 bg-blue-500"></div>
                  <div className="w-2 h-2 bg-yellow-500"></div>
                </div>
                Sign up with Microsoft
              </button> */}
            {/* </div> */}

            {/* Separator */}
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div> */}

            {/* Email Sign-up Form */}
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            {/* Footer Links */}
            <div className="space-y-2 text-center text-sm text-gray-600">
              <div>
                By signing up, I agree to OpenLog&apos;s{" "}
                <Link href="/terms" className="underline hover:text-gray-800">
                  Terms & Privacy Policy
                </Link>
              </div>
              <div>
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="underline hover:text-gray-800"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Image Placeholder */}
        {/* <div className="hidden lg:flex lg:flex-1 bg-gray-900 relative"> */}
        {/* Image Placeholder */}
        <div className="inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
          <img src="/images/hero_image.jpg" alt="hero_image" />
          {/* <p className="text-lg font-medium">Image Placeholder</p>
            <p className="text-sm text-gray-300 mt-2">Right section for hero image</p> */}
        </div>

        {/* Navigation Arrows (Placeholder) */}
        {/* <div className="absolute bottom-8 left-8 text-white text-2xl opacity-50">
            ←
          </div>
          <div className="absolute bottom-8 right-8 text-white text-2xl opacity-50">
            →
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}
