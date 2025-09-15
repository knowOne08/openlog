"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
import {
  Card,
  CardBody,
  Input,
  Button,
  Link as HeroUILink,
  Image,
  Spacer,
} from "@heroui/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@heroui/shared-icons";

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
            <CardBody className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-foreground mb-4">*</div>
                <h2 className="text-2xl font-bold text-foreground">
                  Sign into your account, please
                </h2>
                <p className="text-sm text-foreground-500">
                  A Window to your new World.
                </p>
              </div>

              <Spacer y={0} />

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
                  <Card className="bg-danger-50 border-danger-200">
                    <CardBody className="py-2">
                      <p className="text-sm text-danger-600">{error}</p>
                    </CardBody>
                  </Card>
                )}

                {/* Email Input */}
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onValueChange={setEmail}
                  isRequired
                  autoComplete="email"
                  variant="bordered"
                  size="lg"
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  value={password}
                  onValueChange={setPassword}
                  isRequired
                  autoComplete="current-password"
                  variant="bordered"
                  size="lg"
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label="toggle password visibility"
                    >
                      {isPasswordVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isPasswordVisible ? "text" : "password"}
                />

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <HeroUILink
                    as={Link}
                    href="/auth/forgot-password"
                    size="sm"
                    className="text-foreground-600 hover:text-foreground-800"
                  >
                    Forgot password?
                  </HeroUILink>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
                  size="lg"
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
                  <HeroUILink
                    as={Link}
                    href="/auth/signup"
                    size="sm"
                    className="hover:text-foreground-800"
                  >
                    Sign up
                  </HeroUILink>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Right Panel - Hero Image */}
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
