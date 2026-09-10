"use client";

import { useRequireAuth, useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add,
  Description,
  FolderOpen,
  LockReset,
  Logout,
  PictureAsPdf,
  Search,
  VideoFile,
  MoreVert,
} from "@mui/icons-material";
import UploadModal from "@/components/upload/UploadModal";

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

export default function DashboardPage() {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [fileFilter, setFileFilter] = useState("");
  const [fileTypeTab, setFileTypeTab] = useState("all");
  const [, setSelectedFileId] = useState<string | null>(null);

  const loadFiles = useCallback(() => {
    if (!user?.id) return;
    setFilesLoading(true);
    setFilesError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/files?owner_id=${user.id}&limit=20`)
      .then((response) => response.json())
      .then((data) =>
        data.success && Array.isArray(data.data?.files)
          ? setUserFiles(data.data.files)
          : setFilesError("Failed to load workspace documents.")
      )
      .catch((error) =>
        setFilesError(error?.message || "Failed to load workspace documents.")
      )
      .finally(() => setFilesLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const visibleFiles = useMemo(() => {
    return userFiles.filter(
      (file) =>
        file.title.toLowerCase().includes(fileFilter.toLowerCase()) &&
        (fileTypeTab === "all" || file.mimeType.toLowerCase().includes(fileTypeTab))
    );
  }, [userFiles, fileFilter, fileTypeTab]);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress size={24} color="primary" />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            CONNECTING TO WORKSPACE...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  const initials = (user?.name || "User")
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const formatSize = (size: number) =>
    size > 1024 * 1024
      ? `${(size / 1024 / 1024).toFixed(1)} MB`
      : `${Math.max(1, Math.round(size / 1024))} KB`;

  const getMimeBadge = (mimeType: string) => {
    if (mimeType.includes("video")) {
      return { icon: <VideoFile sx={{ fontSize: 16 }} />, color: theme.palette.primary.main };
    }
    if (mimeType.includes("pdf")) {
      return { icon: <PictureAsPdf sx={{ fontSize: 16 }} />, color: theme.palette.warning.main };
    }
    return { icon: <Description sx={{ fontSize: 16 }} />, color: theme.palette.text.secondary };
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", color: "text.primary", py: 4, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 1100, mx: "auto", pb: 12 }}>
        
        {/* Breadcrumb / Telemetry System Header */}
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
          OPENLOG WORKSPACE // INK INDEX
        </Typography>

        {/* Page Title & Main Actions */}
        <Box component="header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: 28 }}>
            Dashboard
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              startIcon={<Logout sx={{ fontSize: 16 }} />}
              onClick={logout}
            >
              Log out
            </Button>
          </Stack>
        </Box>

        {/* User Workspace Profile Card */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, borderRadius: 1 }}>
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h3" sx={{ fontSize: 16 }}>
                  {user?.name || "Operator"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                  {user?.email}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<LockReset sx={{ fontSize: 16 }} />}
              onClick={() => router.push("/dashboard/change-password")}
            >
              Change password
            </Button>
          </Box>

          {/* Profile Metadata Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, auto)" },
              gap: 4,
              mt: 3,
              pt: 2.5,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                ROLE
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.role || "Admin"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                TEAM
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.team || "Rocketry"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                ACCOUNT STATUS
              </Typography>
              <Chip
                label="ACTIVE"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 20 }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                MEMBER SINCE
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.85rem", color: "text.primary" }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "09/05/2026"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Table Header Controls */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: 18 }}>
              Uploaded documents
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Your searchable files and saved links
            </Typography>
          </Box>

          <Chip
            label={`${userFiles.length} TOTAL`}
            size="small"
            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}
          />
        </Box>

        {/* Toolbar & Filter Bar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1}>
            {["all", "video", "pdf", "doc"].map((tab) => {
              const active = fileTypeTab === tab;
              return (
                <Button
                  key={tab}
                  size="small"
                  variant={active ? "contained" : "outlined"}
                  onClick={() => setFileTypeTab(tab)}
                  sx={{
                    minHeight: 28,
                    px: 1.5,
                    fontSize: "0.72rem",
                  }}
                >
                  {tab}
                </Button>
              );
            })}
          </Stack>

          <TextField
            size="small"
            placeholder="Filter by title..."
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 220 }}
          />
        </Box>

        {/* Document Telemetry Table */}
        <TableContainer component={Paper} sx={{ bgcolor: "background.paper" }}>
          {filesLoading ? (
            <Stack spacing={2} sx={{ py: 8, alignItems: "center" }}>
              <CircularProgress size={22} color="primary" />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                LOADING INDEX RECORDS...
              </Typography>
            </Stack>
          ) : filesError ? (
            <Typography sx={{ p: 4, textAlign: "center", color: "error.main", fontSize: 13 }}>
              {filesError}
            </Typography>
          ) : userFiles.length === 0 ? (
            <Stack spacing={1.5} sx={{ py: 8, px: 3, alignItems: "center", textAlign: "center" }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.text.secondary, 0.1), color: "text.secondary" }}>
                <FolderOpen sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>No documents indexed</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
                Upload files to build your searchable enterprise telemetry index.
              </Typography>
            </Stack>
          ) : visibleFiles.length === 0 ? (
            <Typography sx={{ p: 4, textAlign: "center", color: "text.secondary", fontSize: 13 }}>
              No matches found for your criteria.
            </Typography>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.3) }}>
                <TableRow>
                  <TableCell><Typography variant="caption">TITLE</Typography></TableCell>
                  <TableCell><Typography variant="caption">TYPE</Typography></TableCell>
                  <TableCell><Typography variant="caption">SIZE</Typography></TableCell>
                  <TableCell><Typography variant="caption">UPLOADED</Typography></TableCell>
                  <TableCell><Typography variant="caption">VISIBILITY</Typography></TableCell>
                  <TableCell align="right" sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleFiles.map((file) => {
                  const badge = getMimeBadge(file.mimeType);
                  return (
                    <TableRow key={file.id} hover sx={{ "&:last-child td": { borderBottom: "none" } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              bgcolor: alpha(badge.color, 0.1),
                              color: badge.color,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {badge.icon}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                              {file.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                              {file.description || file.fileType || "file"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {file.mimeType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: "text.primary" }}>
                          {formatSize(file.size)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ display: "block", color: "text.primary" }}>
                          {new Date(file.createdAt).toLocaleDateString("en-GB")}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {new Date(file.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={file.visibility || "private"}
                          size="small"
                          color={file.visibility === "shared" ? "warning" : "default"}
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Footer Pagination Bar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            SHOWING 1–{visibleFiles.length} OF {userFiles.length}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" disabled sx={{ minHeight: 28, px: 1.5 }}>
              Previous
            </Button>
            <Button size="small" variant="outlined" disabled sx={{ minHeight: 28, px: 1.5 }}>
              Next
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* File Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          loadFiles();
          Swal.fire({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            icon: "success",
            title: "Document successfully indexed",
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          });
        }}
      />
    </Box>
  );
}