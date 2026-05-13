"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
import { Card, Input, Button, Label } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="p-6 relative overflow-hidden shadow-none">
            <div className="space-y-6 relative z-10">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-foreground mb-4">*</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Let&apos;s get started
                </h2>
                <p className="text-sm text-foreground-500">
                  A Window to your new World.
                </p>
              </div>

              {/* Social Sign-up Buttons - Commented out as in original */}
              {/* 
              <div className="space-y-3">
                <Button
                  variant="bordered"
                  className="w-full"
                  startContent={<GoogleIcon />}
                  onPress={handleGoogleSignUp}
                  isDisabled={isLoading}
                >
                  Sign up with Google
                </Button>
                
                <Button
                  variant="bordered"
                  className="w-full"
                  startContent={<MicrosoftIcon />}
                  onPress={handleMicrosoftSignUp}
                  isDisabled={isLoading}
                >
                  Sign up with Microsoft
                </Button>
              </div>
              
              <Divider className="my-4" />
              */}

              {/* Sign-up Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="rounded-md bg-danger-50 border border-danger-200 py-2 px-3">
                    <p className="text-sm text-danger-600">{error}</p>
                  </div>
                )}

                {/* Full Name Input */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    suppressHydrationWarning
                  />
                </div>

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
                      autoComplete="new-password"
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
                  isDisabled={isLoading}
                >
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center space-y-2 text-sm text-foreground-600">
                <div>
                  By signing up, I agree to OpenLog&apos;s{" "}
                  <Link
                    href="/terms"
                    className="text-foreground-600 hover:text-foreground-800 underline"
                  >
                    Terms & Privacy Policy
                  </Link>
                </div>
                <div>
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="text-foreground-600 hover:text-foreground-800 underline"
                  >
                    Sign in
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
          src="/images/hero_image.jpg"
          alt="Hero Image"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
