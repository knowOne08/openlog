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
            <CardBody className="space-y-6 relative z-10">
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

              <Spacer y={0} />

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
                  <Card className="bg-danger-50 border-danger-200">
                    <CardBody className="py-2">
                      <p className="text-sm text-danger-600">{error}</p>
                    </CardBody>
                  </Card>
                )}

                {/* Full Name Input */}
                <Input
                  type="text"
                  label="Full Name"
                  value={fullName}
                  onValueChange={setFullName}
                  isRequired
                  autoComplete="name"
                  variant="bordered"
                  size="lg"
                  suppressHydrationWarning
                />

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
                  suppressHydrationWarning
                />

                {/* Password Input */}
                <Input
                  label="Password"
                  value={password}
                  onValueChange={setPassword}
                  isRequired
                  autoComplete="new-password"
                  variant="bordered"
                  size="lg"
                  suppressHydrationWarning
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label="toggle password visibility"
                      suppressHydrationWarning
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
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center space-y-2 text-sm text-foreground-600">
                <div>
                  By signing up, I agree to OpenLog&apos;s{" "}
                  <HeroUILink
                    as={Link}
                    href="/terms"
                    size="sm"
                    className="hover:text-foreground-800"
                  >
                    Terms & Privacy Policy
                  </HeroUILink>
                </div>
                <div>
                  Already have an account?{" "}
                  <HeroUILink
                    as={Link}
                    href="/auth/signin"
                    size="sm"
                    className="hover:text-foreground-800"
                  >
                    Sign in
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
