"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Label } from "@heroui/react";
import { CheckIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      // Get auth token from localStorage (same key used in auth.ts)
      const token = localStorage.getItem("surfe_access_token");

      if (!token) {
        setError("You must be logged in to change your password");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error?.message || data.message || "Failed to change password",
        );
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Password change error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to change password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center space-y-6 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100">
              <CheckIcon className="h-10 w-10 text-success-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-default-800">
                Password Changed Successfully!
              </h3>
              <p className="text-sm text-default-600">
                Your password has been updated. Redirecting to dashboard...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full">
        <Card className="shadow-none">
          <div className="flex flex-col items-center pb-0 pt-8 px-6">
            <div className="text-4xl font-bold text-default-800 mb-4">*</div>
            <h2 className="text-2xl font-bold text-default-800 text-center">
              Change Password
            </h2>
            <p className="text-sm text-default-600 text-center mt-2">
              Update your password to keep your account secure
            </p>
          </div>

          <div className="pt-6 px-6 pb-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="current-password"
                    type={isCurrentPasswordVisible ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    suppressHydrationWarning
                    className="flex-1"
                  />
                  <Button
                    isIconOnly
                    variant="ghost"
                    type="button"
                    onPress={() =>
                      setIsCurrentPasswordVisible(!isCurrentPasswordVisible)
                    }
                    aria-label="toggle current password visibility"
                  >
                    {isCurrentPasswordVisible ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="new-password">New Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-password"
                    type={isNewPasswordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    suppressHydrationWarning
                    className="flex-1"
                  />
                  <Button
                    isIconOnly
                    variant="ghost"
                    type="button"
                    onPress={() =>
                      setIsNewPasswordVisible(!isNewPasswordVisible)
                    }
                    aria-label="toggle new password visibility"
                  >
                    {isNewPasswordVisible ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="confirm-password"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    suppressHydrationWarning
                    className="flex-1"
                  />
                  <Button
                    isIconOnly
                    variant="ghost"
                    type="button"
                    onPress={() =>
                      setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                    }
                    aria-label="toggle confirm password visibility"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-default-900 text-white font-medium"
                  isDisabled={isLoading}
                >
                  {isLoading ? "Changing Password..." : "Change Password"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onPress={() => router.push("/dashboard")}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
