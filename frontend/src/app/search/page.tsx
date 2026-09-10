"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, Download, OpenInNew, Search } from "@mui/icons-material";

interface SearchResult {
  id: string;
  score: number;
  payload: {
    title: string;
    description: string;
    file_type: string;
    file_path?: string;
    external_url?: string;
    created_at: string;
    tags: string[] | string;
    searchLatency?: number;
    mime_type?: string;
    file_size?: number;
  };
}

interface ApiResponse {
  results: SearchResult[];
  total?: number;
  hasMore?: boolean;
}

const getTags = (value: string[] | string): string[] => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function SearchHomepage() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [averageLatency, setAverageLatency] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 36);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = React.useCallback(async (loadMore = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedFile(null);
      setCurrentPage(1);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError("");
    const startedAt = performance.now();
    const page = loadMore ? currentPage + 1 : 1;

    try {
      const endpoint = isSemanticSearch
        ? `${process.env.NEXT_PUBLIC_API_URL}/search/query`
        : `${process.env.NEXT_PUBLIC_API_URL}/search/traditional`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          type: isSemanticSearch ? "semantic" : "traditional",
          limit: resultsPerPage,
          offset: (page - 1) * resultsPerPage,
        }),
      });

      if (!response.ok) throw new Error("Search failed");
      const data = (await response.json()) as ApiResponse;
      const nextResults = data.results || [];
      const backendLatency = nextResults.reduce((sum, result) => sum + (result.payload.searchLatency || 0), 0);
      setAverageLatency(nextResults.length ? (backendLatency + performance.now() - startedAt) / nextResults.length : null);
      setResults((previous) => (loadMore ? [...previous, ...nextResults] : nextResults));
      setCurrentPage(page);
      setTotalResults(data.total || nextResults.length);
      setHasMore(Boolean(data.hasMore || nextResults.length === resultsPerPage));
      if (!loadMore) setSelectedFile(null);
    } catch (caughtError) {
      console.error(caughtError);
      setError("Failed to perform search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isSemanticSearch, searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = window.setTimeout(() => void handleSearch(), 350);
    return () => window.clearTimeout(timer);
  }, [handleSearch, searchQuery]);

  const openFile = async (file: SearchResult) => {
    if (file.payload.file_type === "link") {
      window.open(file.payload.external_url || "#", "_blank", "noopener");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/download-url`);
      const data = await response.json();
      if (data.success && data.data?.downloadUrl) window.open(data.data.downloadUrl, "_blank", "noopener");
    } catch (caughtError) {
      console.error(caughtError);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", color: "text.primary", pt: { xs: 12, sm: 11 }, pb: 4, px: { xs: 2, sm: 4 } }}>
      <Box component="nav" sx={{ position: "fixed", top: scrolled ? { xs: 12, sm: 24 } : 0, left: 0, right: 0, zIndex: 10, px: scrolled ? { xs: 2, sm: 3 } : 0, transition: "top 220ms ease, padding 220ms ease" }}>
        <Box sx={{ maxWidth: scrolled ? 550 : "none", mx: "auto", px: scrolled ? { xs: 2, sm: 3 } : { xs: 2.5, md: 5 }, py: 1.5, border: 1, borderColor: "divider", borderRadius: scrolled ? 999 : 0, bgcolor: "background.paper", boxShadow: scrolled ? 3 : 0, transition: "max-width 220ms ease, border-radius 220ms ease, box-shadow 220ms ease" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: { xs: 16, sm: 20 }, fontWeight: 700 }}>OpenLog</Typography>
            <Button href="/auth/signin" variant="text" size="small">Sign in</Button>
          </Box>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1100, mx: "auto", pb: 12 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
          OPENLOG WORKSPACE // INK INDEX
        </Typography>

        <Box component="header" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: 28, sm: 34 } }}>Search</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Find documents and saved links across your workspace.
            </Typography>
          </Box>
        </Box>

        <Paper component="form" elevation={0} onSubmit={(event) => { event.preventDefault(); void handleSearch(); }} sx={{ p: { xs: 2, sm: 2.5 }, mb: 4, bgcolor: "background.paper" }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search files, descriptions, tags, and links"
            autoComplete="off"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ color: "text.secondary" }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ pl: 1, borderLeft: 1, borderColor: "divider" }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}>Semantic</Typography>
                      <Switch
                        checked={isSemanticSearch}
                        onChange={(event) => setIsSemanticSearch(event.target.checked)}
                        inputProps={{ "aria-label": "Enable semantic search" }}
                        sx={{
                          width: 42,
                          height: 26,
                          p: 0,
                          "& .MuiSwitch-switchBase": {
                            p: 0,
                            m: "3px",
                            transitionDuration: "220ms",
                            "&.Mui-checked": {
                              transform: "translateX(16px)",
                              color: "#fff",
                              "& + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 1 },
                            },
                          },
                          "& .MuiSwitch-thumb": { width: 20, height: 20, boxShadow: 2 },
                          "& .MuiSwitch-track": { borderRadius: 13, bgcolor: "action.disabled", opacity: 1 },
                        }}
                      />
                    </Stack>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2}>
              {averageLatency !== null && <Typography variant="caption" sx={{ color: "success.main" }}>{averageLatency.toFixed(0)} ms</Typography>}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>{totalResults > 0 ? `${results.length} of ${totalResults} results` : "READY"}</Typography>
            </Stack>
          </Stack>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: selectedFile ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)" }, gap: { xs: 2, lg: 3 }, justifyContent: "center", alignItems: "start", width: "100%", maxWidth: 1100, mx: "auto" }}>
          <Box>
            {isLoading ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 10 }}><CircularProgress size={24} /><Typography variant="caption" sx={{ color: "text.secondary" }}>SEARCHING INDEX...</Typography></Stack>
            ) : results.length > 0 ? (
              <Stack spacing={1.5}>
                {results.map((result) => {
                  const selected = selectedFile?.id === result.id;
                  return <Paper key={result.id} elevation={0} onClick={() => setSelectedFile(result)} sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: selected ? "action.hover" : "background.paper", border: "1px solid", borderColor: selected ? "primary.main" : "divider", cursor: "pointer", transition: "border-color 160ms ease, background-color 160ms ease", "&:hover": { borderColor: "text.primary" } }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: 16, fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.payload.title}</Typography><Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.payload.file_path || result.payload.external_url || result.payload.file_type}</Typography></Box>
                      <Chip label={`${(result.score * 100).toFixed(1)}%`} size="small" color={selected ? "primary" : "default"} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.25, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>{result.payload.description || "No description available"}</Typography>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75, mt: 1.5 }}>{getTags(result.payload.tags).map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}</Stack>
                  </Paper>;
                })}
                {hasMore && <Button variant="outlined" onClick={() => void handleSearch(true)} disabled={isLoading} sx={{ alignSelf: "center", mt: 1 }}>Load more results</Button>}
              </Stack>
            ) : searchQuery ? (
              <Paper elevation={0} sx={{ ...{ bgcolor: "background.paper" }, p: 6, textAlign: "center" }}><Typography sx={{ fontWeight: 650 }}>No results found</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Try a broader phrase or enable semantic search.</Typography></Paper>
            ) : (
              <Paper elevation={0} sx={{ bgcolor: "background.paper", p: { xs: 5, sm: 8 }, textAlign: "center" }}><Search sx={{ color: "text.secondary", fontSize: 30 }} /><Typography sx={{ fontWeight: 650, mt: 1 }}>Search the index</Typography><Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Your uploaded documents and saved links will appear here.</Typography></Paper>
            )}
          </Box>

          {selectedFile && <Paper elevation={0} sx={{ bgcolor: "background.paper", position: { lg: "sticky" }, top: { lg: 24 }, overflow: "hidden" }}>
            <Box sx={{ p: 2.5 }}><Stack direction="row" justifyContent="space-between" spacing={2}><Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: 18, fontWeight: 650 }}>{selectedFile.payload.title}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>{(selectedFile.score * 100).toFixed(1)}% MATCH · {new Date(selectedFile.payload.created_at).toLocaleDateString()}</Typography></Box><Button size="small" onClick={() => setSelectedFile(null)} sx={{ minWidth: 0, display: { xs: "inline-flex", lg: "none" } }} startIcon={<ArrowBack />}>Back</Button></Stack></Box>
            <Divider />
            <Stack spacing={3} sx={{ p: 2.5 }}><Box><Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>DESCRIPTION</Typography><Typography variant="body2" sx={{ color: "text.secondary" }}>{selectedFile.payload.description || "No description available"}</Typography></Box><Box><Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>FILE INFORMATION</Typography><Stack spacing={0.5}>{selectedFile.payload.file_path && <Typography variant="caption" sx={{ overflowWrap: "anywhere" }}>{selectedFile.payload.file_path}</Typography>}{selectedFile.payload.mime_type && <Typography variant="caption" sx={{ color: "text.secondary" }}>Type: {selectedFile.payload.mime_type}</Typography>}{selectedFile.payload.file_size && <Typography variant="caption" sx={{ color: "text.secondary" }}>Size: {(selectedFile.payload.file_size / 1e6).toFixed(2)} MB</Typography>}</Stack></Box><Box><Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>TAGS</Typography><Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>{getTags(selectedFile.payload.tags).map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}</Stack></Box></Stack>
            <Divider /><Box sx={{ p: 2.5 }}><Button fullWidth variant="contained" onClick={() => void openFile(selectedFile)} startIcon={selectedFile.payload.file_type === "link" ? <OpenInNew /> : <Download />}>{selectedFile.payload.file_type === "link" ? "Open link" : "Download file"}</Button></Box>
          </Paper>}
        </Box>
      </Box>
    </Box>
  );
}
