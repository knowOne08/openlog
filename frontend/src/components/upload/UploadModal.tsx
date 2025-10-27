"use client";

import { useState, useCallback, useRef } from "react";
import { CalendarDate } from "@internationalized/date";
import {
  FolderIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Card,
  CardBody,
} from "@heroui/react";
import { DatePicker } from "@heroui/date-picker";

interface UploadResult {
  id: string;
  title: string;
  description: string;
  file_type: string;
  created_at: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (upload: UploadResult) => void;
}

interface UploadFormData {
  title: string;
  description: string;
  visibility: "private" | "public" | "team";
  tags: string[];
  scheduledDate: string;
}

interface LinkFormData {
  title: string;
  description: string;
  url: string;
  visibility: "private" | "public" | "team";
  tags: string[];
  scheduledDate: string;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"file" | "link">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // DatePicker state for file
  const [fileDateValue, setFileDateValue] = useState<CalendarDate | null>(null);

  const [fileFormData, setFileFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    visibility: "private",
    tags: [],
    scheduledDate: "",
  });

  // DatePicker state for link
  const [linkDateValue, setLinkDateValue] = useState<CalendarDate | null>(null);
  const [linkFormData, setLinkFormData] = useState<LinkFormData>({
    title: "",
    description: "",
    url: "",
    visibility: "private",
    tags: [],
    scheduledDate: "",
  });

  const resetFileForm = () => {
    setSelectedFile(null);
    setFileFormData({
      title: "",
      description: "",
      visibility: "private",
      tags: [],
      scheduledDate: "",
    }); // Reset the object to its initial empty state
    setFileDateValue(null); // Reset the date to null
  };

  const resetLinkForm = () => {
    setLinkFormData({
      title: "",
      description: "",
      url: "",
      visibility: "private",
      tags: [],
      scheduledDate: "",
    }); // Reset the object to its initial empty state
    setFileDateValue(null); // Reset the date to null
  };

  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const validTypes = [
        "image/",
        "video/",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      if (!validTypes.some((type) => file.type.startsWith(type))) {
        alert("Please select an appropriate file type");
        return;
      }
      setSelectedFile(file);
      if (!fileFormData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFileFormData((prev) => ({ ...prev, title: fileName }));
      }
    },
    [fileFormData.title]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleTagAdd = (formType: "file" | "link") => {
    if (!tagInput.trim()) return;
    const maxTags = 20;
    const currentTags =
      formType === "file" ? fileFormData.tags : linkFormData.tags;
    if (currentTags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`);
      return;
    }
    if (formType === "file") {
      setFileFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
    } else {
      setLinkFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
    }
    setTagInput("");
  };

  const handleTagRemove = (tag: string, formType: "file" | "link") => {
    if (formType === "file") {
      setFileFormData((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== tag),
      }));
    } else {
      setLinkFormData((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== tag),
      }));
    }
  };

  const handleSubmit = async () => {
    if (activeTab === "file") {
      if (!selectedFile || !fileFormData.title.trim()) {
        alert("Please select a file and provide a title");
        return;
      }
      if (!user) {
        alert("Please sign in to upload files");
        return;
      }
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("file", selectedFile);
        formDataToSend.append("title", fileFormData.title);
        formDataToSend.append("description", fileFormData.description);
        formDataToSend.append("owner_id", user.id);
        formDataToSend.append("visibility", fileFormData.visibility);
        if (fileFormData.scheduledDate) {
          formDataToSend.append("scheduled_date", fileFormData.scheduledDate);
        }
        formDataToSend.append("tags", JSON.stringify(fileFormData.tags));
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/file`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "surfe_access_token"
              )}`,
            },
            body: formDataToSend,
          }
        );
        const result = await response.json();
        if (result.success) {
          onUploadSuccess?.(result.upload);
          resetFileForm();
          onClose();
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      if (!linkFormData.url.trim() || !linkFormData.title.trim()) {
        alert("Please provide a URL and a title");
        return;
      }
      if (!user) {
        alert("Please sign in to upload links");
        return;
      }
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/link`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "surfe_access_token"
              )}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...linkFormData,
              owner_id: user.id,
            }),
          }
        );
        const result = await response.json();
        if (result.success) {
          onUploadSuccess?.(result.upload);
          resetLinkForm();
          onClose();
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="2xl"
      scrollBehavior="inside"
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">
            Upload Section
          </h2>
          <p className="text-sm text-foreground-600">
            Upload files or add links.
          </p>
        </ModalHeader>
        <ModalBody className="gap-6">
          <div className="flex gap-2">
            <Button
              onPress={() => setActiveTab("file")}
              className={`startContent:flex items-center ${
                activeTab === "file"
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground border-2 border-default"
              }`}
              startContent={<FolderIcon className="h-4 w-4" />}
            >
              File Upload
            </Button>
            <Button
              onPress={() => setActiveTab("link")}
              className={`startContent:flex items-center ${
                activeTab === "link"
                  ? "bg-foreground text-background"
                  : "bg-transparent text-foreground border-2 border-default"
              }`}
              startContent={<FolderIcon className="h-4 w-4" />}
            >
              Link Upload
            </Button>
          </div>

          {activeTab === "file" && (
            <div className="space-y-6">
              <Card
                className={`border-2 border-dashed transition-colors cursor-pointer w-full ${
                  isDragging
                    ? "border-primary bg-primary-50"
                    : "border-default-300 hover:border-default-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isPressable
                onPress={() => fileInputRef.current?.click()}
              >
                <CardBody className="p-8 text-center">
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Card className="w-16 h-16 bg-default-100">
                          <CardBody className="flex items-center justify-center p-0">
                            {selectedFile.type.startsWith("image/") ? (
                              <PhotoIcon className="h-8 w-8 text-default-600" />
                            ) : (
                              <VideoCameraIcon className="h-8 w-8 text-default-600" />
                            )}
                          </CardBody>
                        </Card>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-foreground-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setSelectedFile(null);
                          resetFileForm();
                        }}
                      >
                        Remove file
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FolderIcon className="h-12 w-12 text-default-400 mx-auto" />
                      <p className="text-sm font-medium text-foreground">
                        Upload a file
                      </p>
                      <p className="text-xs text-foreground-500">
                        Click here or drag and drop files
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.docx,.pptx"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="File name"
                  placeholder="Enter file name"
                  value={fileFormData.title}
                  onValueChange={(v) =>
                    setFileFormData((p) => ({ ...p, title: v }))
                  }
                  isRequired
                  variant="bordered"
                />
                <Select
                  label="Visibility"
                  selectedKeys={new Set([fileFormData.visibility])}
                  onSelectionChange={(keys) =>
                    setFileFormData((p) => ({
                      ...p,
                      visibility: Array.from(keys)[0] as
                        | "private"
                        | "public"
                        | "team",
                    }))
                  }
                  variant="bordered"
                >
                  <SelectItem key="private">Private</SelectItem>
                  <SelectItem key="team">Team</SelectItem>
                  <SelectItem key="public">Public</SelectItem>
                </Select>
              </div>

              <Textarea
                label="Description"
                placeholder="Describe your file details..."
                value={fileFormData.description}
                onValueChange={(v) =>
                  setFileFormData((p) => ({ ...p, description: v }))
                }
                variant="bordered"
              />

              <DatePicker
                label="Upload Date"
                value={fileDateValue ?? undefined}
                onChange={(date) => {
                  setFileDateValue(date);
                  const iso = `${date?.year}-${String(date?.month).padStart(
                    2,
                    "0"
                  )}-${String(date?.day).padStart(2, "0")}`;
                  setFileFormData((p) => ({ ...p, scheduledDate: iso }));
                }}
                variant="bordered"
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Add tags
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type to search..."
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={(e) => e.key === "Enter" && handleTagAdd("file")}
                    className="flex-1"
                    variant="bordered"
                  />
                  <Button
                    onPress={() => handleTagAdd("file")}
                    variant="bordered"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fileFormData.tags.map((tag, i) => (
                    <Chip
                      key={i}
                      variant="flat"
                      size="sm"
                      onClose={() => handleTagRemove(tag, "file")}
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "link" && (
            <div className="space-y-6">
              <Card className="border-2 border-dashed border-default-300">
                <CardBody className="p-8 text-center space-y-4">
                  <LinkIcon className="h-12 w-12 text-default-400 mx-auto" />
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={linkFormData.url}
                    onValueChange={(v) =>
                      setLinkFormData((p) => ({ ...p, url: v }))
                    }
                    isRequired
                    variant="bordered"
                    size="lg"
                  />
                </CardBody>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Title"
                  placeholder="Enter title"
                  value={linkFormData.title}
                  onValueChange={(v) =>
                    setLinkFormData((p) => ({ ...p, title: v }))
                  }
                  isRequired
                  variant="bordered"
                />
                <Select
                  label="Visibility"
                  selectedKeys={new Set([linkFormData.visibility])}
                  onSelectionChange={(keys) =>
                    setLinkFormData((p) => ({
                      ...p,
                      visibility: Array.from(keys)[0] as
                        | "private"
                        | "public"
                        | "team",
                    }))
                  }
                  variant="bordered"
                >
                  <SelectItem key="private">Private</SelectItem>
                  <SelectItem key="team">Team</SelectItem>
                  <SelectItem key="public">Public</SelectItem>
                </Select>
              </div>

              <Textarea
                label="Description"
                placeholder="Describe the link..."
                value={linkFormData.description}
                onValueChange={(v) =>
                  setLinkFormData((p) => ({ ...p, description: v }))
                }
                variant="bordered"
              />

              <DatePicker
                label="Upload Date"
                value={linkDateValue ?? undefined}
                onChange={(date) => {
                  setLinkDateValue(date);
                  const iso = `${date?.year}-${String(date?.month).padStart(
                    2,
                    "0"
                  )}-${String(date?.day).padStart(2, "0")}`;
                  setLinkFormData((p) => ({ ...p, scheduledDate: iso }));
                }}
                variant="bordered"
              />

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Add tags
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type to search..."
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={(e) => e.key === "Enter" && handleTagAdd("link")}
                    className="flex-1"
                    variant="bordered"
                  />
                  <Button
                    onPress={() => handleTagAdd("link")}
                    variant="bordered"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {linkFormData.tags.map((tag, i) => (
                    <Chip
                      key={i}
                      variant="flat"
                      size="sm"
                      onClose={() => handleTagRemove(tag, "link")}
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-foreground-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} color="default" />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="danger" onPress={onClose}>
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            isLoading={isUploading}
            color="default"
            className="bg-foreground text-background"
          >
            Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
