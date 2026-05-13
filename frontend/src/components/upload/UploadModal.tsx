"use client";

import { useState, useCallback, useRef } from "react";
import {
  FolderIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import {
  Input,
  TextArea,
  Select,
  Button,
  Modal,
  Card,
  Label,
  ListBoxItem,
  ListBox,
} from "@heroui/react";

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
}

interface LinkFormData {
  title: string;
  description: string;
  url: string;
  visibility: "private" | "public" | "team";
  tags: string[];
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

  const [fileFormData, setFileFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    visibility: "private",
    tags: [],
  });

  const [linkFormData, setLinkFormData] = useState<LinkFormData>({
    title: "",
    description: "",
    url: "",
    visibility: "private",
    tags: [],
  });

  const resetFileForm = () => {
    setSelectedFile(null);
    setFileFormData({
      title: "",
      description: "",
      visibility: "private",
      tags: [],
    });
  };

  const resetLinkForm = () => {
    setLinkFormData({
      title: "",
      description: "",
      url: "",
      visibility: "private",
      tags: [],
    });
  };

  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    [fileFormData.title],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect],
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
        formDataToSend.append("tags", JSON.stringify(fileFormData.tags));
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/file`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "surfe_access_token",
              )}`,
            },
            body: formDataToSend,
          },
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
                "surfe_access_token",
              )}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...linkFormData,
              owner_id: user.id,
            }),
          },
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
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Modal.Backdrop variant="blur">
        <Modal.Container placement="center" size="full" scroll="inside">
          <Modal.Dialog aria-label="Upload documents">
            <div className="flex flex-col gap-6 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Upload Section
                </h2>
                <p className="text-sm text-foreground-600">
                  Upload files or add links.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onPress={() => setActiveTab("file")}
                  className={
                    activeTab === "file"
                      ? "bg-foreground text-background"
                      : "border-2 border-default bg-transparent text-foreground hover:bg-default"
                  }
                  size="sm"
                >
                  <FolderIcon className="h-4 w-4" />
                  File Upload
                </Button>
                <Button
                  onPress={() => setActiveTab("link")}
                  className={
                    activeTab === "link"
                      ? "bg-foreground text-background"
                      : "border-2 border-default bg-transparent text-foreground hover:bg-default"
                  }
                  size="sm"
                >
                  <LinkIcon className="h-4 w-4" />
                  Link Upload
                </Button>
              </div>

              {activeTab === "file" && (
                <div className="space-y-6">
                  <Card className="border-2 border-dashed border-default-300 cursor-pointer hover:border-default-400 transition-colors">
                    <div
                      className={`p-8 text-center transition-colors ${
                        isDragging
                          ? "border-primary bg-primary-50 border-2 border-dashed border-primary"
                          : ""
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {selectedFile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <div className="w-16 h-16 bg-default-100 rounded-lg flex items-center justify-center">
                              {selectedFile.type.startsWith("image/") ? (
                                <PhotoIcon className="h-8 w-8 text-default-600" />
                              ) : (
                                <VideoCameraIcon className="h-8 w-8 text-default-600" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-foreground-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="danger"
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
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="file-title">File name</Label>
                      <Input
                        id="file-title"
                        placeholder="Enter file name"
                        value={fileFormData.title}
                        onChange={(e) =>
                          setFileFormData((p) => ({
                            ...p,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="file-visibility">Visibility</Label>
                      <Select
                        id="file-visibility"
                        // selectedKey={fileFormData.visibility}
                        onChange={(e) => {
                          if (e && e !== null) {
                            setFileFormData((p) => ({
                              ...p,
                              visibility: e as unknown as string as
                                | "private"
                                | "public"
                                | "team",
                            }));
                          }
                        }}
                      >
                        <Select.Trigger />
                        <Select.Popover>
                          <ListBox>
                            <ListBoxItem
                              key="private"
                              id="private"
                              textValue="Private"
                            >
                              Private
                            </ListBoxItem>
                            <ListBoxItem key="team" id="team" textValue="Team">
                              Team
                            </ListBoxItem>
                            <ListBoxItem
                              key="public"
                              id="public"
                              textValue="Public"
                            >
                              Public
                            </ListBoxItem>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="file-description">Description</Label>
                    <TextArea
                      id="file-description"
                      placeholder="Describe your file details..."
                      value={fileFormData.description}
                      onChange={(e) =>
                        setFileFormData((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Add tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type to add..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleTagAdd("file")
                        }
                        className="flex-1"
                      />
                      <Button
                        onPress={() => handleTagAdd("file")}
                        variant="tertiary"
                        size="md"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fileFormData.tags.map((tag, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-default-100 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => handleTagRemove(tag, "file")}
                            className="ml-1 hover:text-danger"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "link" && (
                <div className="space-y-6">
                  <Card className="border-2 border-dashed border-default-300">
                    <div className="p-8 text-center space-y-4">
                      <LinkIcon className="h-12 w-12 text-default-400 mx-auto" />
                      <div className="flex flex-col gap-1 w-full">
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={linkFormData.url}
                          onChange={(e) =>
                            setLinkFormData((p) => ({
                              ...p,
                              url: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="link-title">Title</Label>
                      <Input
                        id="link-title"
                        placeholder="Enter title"
                        value={linkFormData.title}
                        onChange={(e) =>
                          setLinkFormData((p) => ({
                            ...p,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="link-visibility">Visibility</Label>
                      <Select
                        id="link-visibility"
                        selectedKey={linkFormData.visibility}
                        onChange={(e) => {
                          if (e && e !== null) {
                            setLinkFormData((p) => ({
                              ...p,
                              visibility: e as unknown as string as
                                | "private"
                                | "public"
                                | "team",
                            }));
                          }
                        }}
                      >
                        <Select.Trigger />
                        <Select.Popover>
                          <ListBox>
                            <ListBoxItem
                              key="private"
                              id="private"
                              textValue="Private"
                            >
                              Private
                            </ListBoxItem>
                            <ListBoxItem key="team" id="team" textValue="Team">
                              Team
                            </ListBoxItem>
                            <ListBoxItem
                              key="public"
                              id="public"
                              textValue="Public"
                            >
                              Public
                            </ListBoxItem>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="link-description">Description</Label>
                    <TextArea
                      id="link-description"
                      placeholder="Describe the link..."
                      value={linkFormData.description}
                      onChange={(e) =>
                        setLinkFormData((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Add tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type to search..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleTagAdd("link")
                        }
                        className="flex-1"
                      />
                      <Button
                        onPress={() => handleTagAdd("link")}
                        variant="outline"
                        size="sm"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {linkFormData.tags.map((tag, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-default-100 rounded-full px-3 py-1 text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => handleTagRemove(tag, "link")}
                            className="ml-1 hover:text-danger"
                          >
                            ✕
                          </button>
                        </div>
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
                  <div className="w-full h-2 bg-default-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-divider">
                <Button onPress={onClose} variant="outline">
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit}
                  // disabled={isUploading}
                  className="bg-foreground text-background"
                >
                  {isUploading ? `Uploading... ${uploadProgress}%` : "Upload"}
                </Button>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
