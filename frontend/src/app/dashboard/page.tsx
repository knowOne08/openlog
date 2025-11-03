"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// UserFile interface for type safety
interface UserFile {
  id: string;
  title: string;
  description: string;
  fileType: string;
  size: number;
  mimeType: string;
  visibility: string;
  createdAt: string;
}
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
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setFilesLoading(true);
    setFilesError(null);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files?owner_id=${user.id}&limit=20`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.files)) {
          setUserFiles(data.data.files);
        } else {
          setFilesError("Failed to load your documents.");
        }
      })
      .catch((err) =>
        setFilesError(err?.message || "Failed to load your documents.")
      )
      .finally(() => setFilesLoading(false));
  }, [user?.id]);

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

                  {/* Change Password Button */}
                  <div className="pt-2">
                    <Button
                      onPress={() => router.push("/dashboard/change-password")}
                      variant="ghost"
                      className="w-full justify-start"
                      size="md"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/*
            Quick Actions Card
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
            */}

            {/* User Files List */}
            <Card className="shadow-medium col-span-1 md:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-medium text-foreground">
                  Your Uploaded Documents({userFiles.length})
                </h3>
              </CardHeader>
              <CardBody>
                {filesLoading ? (
                  <div className="py-4 text-center">
                    <Spinner size="md" color="default" />
                    <p className="text-foreground-700 mt-2">
                      Loading your documents...
                    </p>
                  </div>
                ) : filesError ? (
                  <div className="py-4 text-center text-danger-600">
                    {filesError}
                  </div>
                ) : userFiles.length === 0 ? (
                  <div className="py-4 text-center text-foreground-500">
                    No documents uploaded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-divider">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                            Visibility
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-divider">
                        {userFiles.map((file) => (
                          <tr key={file.id}>
                            <td className="px-4 py-2 text-foreground">
                              {file.title}
                            </td>
                            <td className="px-4 py-2 text-foreground-500">
                              {file.mimeType}
                            </td>
                            <td className="px-4 py-2 text-foreground-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </td>
                            <td className="px-4 py-2 text-foreground-500">
                              {new Date(file.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                              <Chip
                                color={
                                  file.visibility === "public"
                                    ? "success"
                                    : "default"
                                }
                                size="sm"
                              >
                                {file.visibility}
                              </Chip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
