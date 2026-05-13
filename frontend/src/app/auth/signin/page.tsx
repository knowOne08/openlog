"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
// import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Card, Input, Button, Label } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-6 shadow-none">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-foreground mb-4">*</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Sign into your account
                </h2>
                <p className="text-sm text-foreground-500">
                  A Window to your new World.
                </p>
              </div>

              {/* Social Sign-in Buttons - Commented out as in original */}
              {/* 
              <div className="space-y-3">
                <Button
                  variant="bordered"
                  className="w-full"
                  startContent={<GoogleIcon />}
                  onPress={handleGoogleSignIn}
                  isDisabled={isLoading}
                >
                  Sign in with Google
                </Button>
                
                <Button
                  variant="bordered"
                  className="w-full"
                  startContent={<MicrosoftIcon />}
                  onPress={handleMicrosoftSignIn}
                  isDisabled={isLoading}
                >
                  Sign in with Microsoft
                </Button>
              </div>
              
              <Divider className="my-4" />
              */}

              {/* Sign-in Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="rounded-md bg-danger-50 border border-danger-200 py-2 px-3">
                    <p className="text-sm text-danger-600">{error}</p>
                  </div>
                )}

                {/* Email Input */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    suppressHydrationWarning
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      suppressHydrationWarning
                      type={isPasswordVisible ? "text" : "password"}
                      className="flex-1"
                    />
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label="toggle password visibility"
                      suppressHydrationWarning
                    >
                      {isPasswordVisible ? (
                        <EyeSlashIcon className="h-5 w-5 text-default-400 pointer-events-none" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-default-400 pointer-events-none" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-foreground-600 hover:text-foreground-800 underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
                  isDisabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center space-y-2 text-sm text-foreground-600">
                {/* <div>
                  Can&apos;t sign in?{" "}
                  <HeroUILink
                    as={Link}
                    href="/auth/forgot-password"
                    size="sm"
                    className="hover:text-foreground-800"
                  >
                    Reset password
                  </HeroUILink>
                </div> */}
                <div>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-foreground-600 hover:text-foreground-800 underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-content1">
        <Image
          src="/images/image.png"
          alt="Hero Image"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
