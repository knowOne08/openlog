"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Chip,
  Spinner,
  Divider,
} from "@heroui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import UploadModal from "@/components/upload/UploadModal";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user, logout } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="default" />
          <p className="text-foreground-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via the hook
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-content1 shadow-sm border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onPress={() => setIsUploadModalOpen(true)}
                className="bg-foreground text-background hover:bg-foreground/90"
                startContent={<PlusIcon className="h-5 w-5" />}
                size="sm"
              >
                Upload
              </Button>
              {/* <span className="text-foreground-700">Welcome, {user?.name}</span> */}
              <Button onPress={logout} variant="bordered" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="shadow-medium">
              <CardBody className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={user?.name}
                    size="lg"
                    className="bg-primary-100 text-primary-600"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground">
                      {user?.name}
                    </h3>
                    <p className="text-sm text-foreground-500">{user?.email}</p>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-foreground-500">
                        Role
                      </dt>
                      <dd className="mt-1 text-sm text-foreground capitalize">
                        {user?.role}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-foreground-500">
                        Team
                      </dt>
                      <dd className="mt-1 text-sm text-foreground capitalize">
                        {user?.team}
                      </dd>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-foreground-500">
                        Status
                      </dt>
                      <dd className="mt-1">
                        <Chip
                          color={user?.is_active ? "success" : "danger"}
                          variant="flat"
                          size="sm"
                        >
                          {user?.is_active ? "Active" : "Inactive"}
                        </Chip>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-foreground-500">
                        Member Since
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "N/A"}
                      </dd>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-medium">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-medium text-foreground">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody className="pt-2">
                <div className="space-y-3">
                  <Button
                    onPress={() => console.log("Change password clicked")}
                    variant="ghost"
                    className="w-full justify-start"
                    size="md"
                  >
                    Change Password
                  </Button>
                  <Button
                    onPress={() => console.log("View profile clicked")}
                    variant="ghost"
                    className="w-full justify-start"
                    size="md"
                  >
                    View Profile
                  </Button>
                  <Button
                    onPress={() => console.log("Settings clicked")}
                    variant="ghost"
                    className="w-full justify-start"
                    size="md"
                  >
                    Settings
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            iconColor: "white",
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
            customClass: {
              // Add Tailwind classes to the toast elements
              // The '!important' modifier is crucial to override SweetAlert2's default styles
              popup: "!rounded-md !bg-emerald-600 !p-2 !text-white !shadow-lg",
              title: "!text-white !font-medium",
              timerProgressBar: "!bg-emerald-200",
            },
          });

          // Call the styled toast
          Toast.fire({
            icon: "success",
            title: "Upload successful!",
          });
          // alert("Upload Successful!");
          // You can add logic here to refresh the dashboard or show a success message
        }}
      />
    </div>
  );
}
