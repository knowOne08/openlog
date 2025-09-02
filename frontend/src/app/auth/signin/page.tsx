// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/useAuth";
// import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
// import {
//   InputField,
//   PasswordField,
//   Button,
//   SocialButton,
//   Separator,
//   ComplianceInfo,
// } from "@/components/auth/FormComponents";

// export default function SignInPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { login, isLoading, error, clearError } = useAuth();
//   const router = useRouter();

//   // Redirect if already authenticated
//   useRedirectIfAuthenticated();

//   const handleSignIn = async (e: React.FormEvent) => {
//     e.preventDefault();
//     clearError();

//     const result = await login({ email, password });
//     if (result.success) {
//       console.log("Login successful, redirecting to dashboard...");
//       // Force redirect to dashboard after successful login
//       router.push("/dashboard");
//     }
//   };

//   // const handleGoogleSignIn = async () => {
//   //   // TODO: Implement Google OAuth
//   //   console.log('Google signin');
//   // };

//   // const handleMicrosoftSignIn = async () => {
//   //   // TODO: Implement Microsoft OAuth
//   //   console.log('Microsoft signin');
//   // };

//   return (
//     <div className="min-h-screen flex">
//       {/* Left Panel - Authentication Form */}
//       <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg relative overflow-hidden">
//           {/* Background Pattern */}
//           <div className="absolute inset-0 opacity-5">
//             <div className="absolute top-0 left-0 w-32 h-32 text-6xl text-gray-400">
//               *
//             </div>
//             <div
//               className="absolute inset-0"
//               style={
//                 {
//                   // backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
//                   // backgroundSize: '20px 20px'
//                 }
//               }
//             ></div>
//           </div>

//           {/* Form Content */}
//           <div className="relative z-10">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <div className="text-4xl font-bold text-gray-800 mb-4">*</div>
//               <h2 className="text-2xl font-bold text-gray-800">
//                 Sign into your account
//               </h2>
//               <p className="mt-2 text-sm text-gray-600">
//                 New gigs personalized for you are waiting.
//               </p>
//             </div>

//             {/* Social Sign-in Buttons */}
//             {/* <div className="space-y-3">
//             <SocialButton
//               provider="google"
//               onClick={handleGoogleSignIn}
//               disabled={isLoading}
//             >
//               Sign in with Google
//             </SocialButton>

//             <SocialButton
//               provider="microsoft"
//               onClick={handleMicrosoftSignIn}
//               disabled={isLoading}
//             >
//               Sign in with Microsoft
//             </SocialButton>
//           </div> */}

//             {/* Separator */}
//             {/* <Separator /> */}

//             {/* Email Sign-in Form */}
//             <form className="space-y-4" onSubmit={handleSignIn}>
//               {/* Error Display */}
//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//                   <p className="text-sm text-red-600">{error}</p>
//                 </div>
//               )}

//               <div className="space-y-4">
//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block text-sm font-medium text-gray-700 mb-2"
//                   >
//                     Email
//                   </label>
//                   <InputField
//                     id="email"
//                     name="email"
//                     type="email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     autoComplete="email"
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-gray-700 mb-2"
//                   >
//                     Password
//                   </label>
//                   <PasswordField
//                     id="password"
//                     name="password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     autoComplete="current-password"
//                   />
//                 </div>
//               </div>

//               <div className="text-right">
//                 <Link
//                   href="/auth/forgot-password"
//                   className="text-sm text-gray-600 hover:text-gray-800 underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               <Button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors"
//               >
//                 {isLoading ? "Signing in..." : "Sign in"}
//               </Button>
//             </form>

//             {/* Footer Links */}
//             <div className="space-y-2 text-center text-sm text-gray-600">
//               <div>
//                 Can&apos;t sign in?{" "}
//                 <Link
//                   href="/auth/forgot-password"
//                   className="underline hover:text-gray-800"
//                 >
//                   Reset password
//                 </Link>
//               </div>
//               <div>
//                 Don&apos;t have an account?{" "}
//                 <Link
//                   href="/auth/signup"
//                   className="underline hover:text-gray-800"
//                 >
//                   Sign up
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Panel - Image Placeholder */}
//       {/* <div className="hidden lg:flex lg:flex-1 bg-gray-900 relative overflow-hidden"> */}
//       <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
//         {/* Image Placeholder */}
//         {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"> */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="text-center text-white">
//             <div className="text-6xl mb-4">
//               <img src="/images/hero_image.jpg" alt="hero_image" />
//             </div>
//             {/* <p className="text-lg font-medium">Image Placeholder</p> */}
//             {/* <p className="text-sm text-gray-300 mt-2">Right section for hero image</p> */}
//           </div>
//         </div>

//         {/* Navigation Arrows (Placeholder) */}
//         {/* <div className="absolute bottom-8 left-8 text-white text-2xl opacity-50">
//           ←
//         </div>
//         <div className="absolute bottom-8 right-8 text-white text-2xl opacity-50">
//           →
//         </div> */}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRedirectIfAuthenticated } from "@/hooks/useAuth";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  Card,
  CardBody,
  Input,
  Button,
  Link as HeroUILink,
  Image,
  Spacer,
  Divider,
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
                  Sign into your account
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

              <Spacer y={0} />

              {/* Footer Links */}
              <div className="text-center space-y-2 text-sm text-foreground-600">
                <div>
                  Can&apos;t sign in?{" "}
                  <HeroUILink
                    as={Link}
                    href="/auth/forgot-password"
                    size="sm"
                    className="hover:text-foreground-800"
                  >
                    Reset password
                  </HeroUILink>
                </div>
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
