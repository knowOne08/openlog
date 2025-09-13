"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Select,
  SelectItem,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Link,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";

type DateFilterType = "all" | "today" | "week" | "month";

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
  };
}

interface ApiResponse {
  success: boolean;
  results: SearchResult[];
}

export default function SearchHomepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("hybrid");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [averageLatency, setAverageLatency] = useState<number | null>(null);

  // Memoize search function to prevent infinite loop
  const debouncedSearch = React.useCallback(async () => {
    if (searchQuery.trim()) {
      await handleSearch();
    }
  }, [searchQuery, searchType, dateFilter, selectedTags]);

  // Debounce search function
  useEffect(() => {
    const debounceTimeout = setTimeout(debouncedSearch, 300); // 300ms debounce delay
    return () => clearTimeout(debounceTimeout);
  }, [debouncedSearch]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError("");

    // Record start time for latency measurement
    const startTime = performance.now();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            type: searchType,
            limit: 20,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = (await response.json()) as ApiResponse;

      // Calculate end-to-end latency
      const endTime = performance.now();
      const latency = endTime - startTime;

      // Filter results by date if needed
      let filteredResults = [...data.results];
      if (dateFilter !== "all") {
        const now = new Date();
        const filterDate = new Date();

        switch (dateFilter) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }

        filteredResults = filteredResults.filter(
          (result: SearchResult) =>
            new Date(result.payload.created_at) >= filterDate
        );
      }

      // Filter by selected tags if any are selected
      if (selectedTags.length > 0) {
        filteredResults = filteredResults.filter((result: SearchResult) =>
          result.payload.tags?.some((tag: string) => selectedTags.includes(tag))
        );
      }

      // Calculate average latency including backend processing time
      const totalLatency = filteredResults.reduce(
        (sum: number, result: SearchResult) =>
          sum + (result.payload.searchLatency || 0),
        0
      );

      if (filteredResults.length > 0) {
        setAverageLatency(
          totalLatency / filteredResults.length +
            latency / filteredResults.length
        );
      } else {
        setAverageLatency(null);
      }

      setResults(filteredResults);
    } catch (err) {
      setError("Failed to perform search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50); // Trigger after 50px scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [selectedFile, setSelectedFile] = useState<SearchResult | null>(null);

  const handleViewFile = (result: SearchResult) => {
    setSelectedFile(result);
  };

  const FileDetails = ({ file }: { file: SearchResult }) => {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-divider p-4">
          <h2 className="text-xl font-semibold">{file.payload.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-small text-default-500">
              Score: {(file.score * 100).toFixed(1)}%
            </span>
            <span className="text-small text-default-500">•</span>
            <span className="text-small text-default-500">
              {new Date(file.payload.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <section>
              <h3 className="text-md font-semibold mb-2 text-foreground">
                Description
              </h3>
              <p className="text-default-600">{file.payload.description}</p>
            </section>
            <section>
              <h3 className="text-md font-semibold mb-2 text-foreground">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let tagsArray: string[] = [];
                  try {
                    if (typeof file.payload.tags === "string") {
                      // If tags is a JSON string, parse it
                      tagsArray = JSON.parse(file.payload.tags);
                    } else if (Array.isArray(file.payload.tags)) {
                      // If tags is already an array
                      tagsArray = file.payload.tags;
                    }
                  } catch (e) {
                    console.error("Error parsing tags:", e);
                  }
                  return tagsArray.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full bg-default text-foreground text-small"
                    >
                      {tag}
                    </span>
                  ));
                })()}
              </div>
            </section>
            <section>
              <h3 className="text-md font-semibold mb-2 text-foreground">
                File Information
              </h3>
              <div className="space-y-2">
                <p className="text-small">
                  <span className="text-default-500">Type:</span>{" "}
                  {file.payload.file_type}
                </p>
                {file.payload.file_path && (
                  <p className="text-small">
                    <span className="text-default-500">Path:</span>{" "}
                    {file.payload.file_path}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
        <div className="border-t border-divider p-4">
          <Button
            size="lg"
            className="w-full"
            color="default"
            href={file.payload.external_url || `#`}
            as={Link}
          >
            {file.payload.file_type === "link" ? "Open Link" : "Download File"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <Navbar
          isBordered
          className={`
            backdrop-blur-xs fixed top-0 left-0 right-0 z-50
            transition-all duration-500 ease-in
            ${
              scrolled
                ? "hidden"
                : "w-full rounded-none shadow-none bg-background/80"
            }
          `}
        >
          <NavbarBrand>
            <p className="text-2xl text-foreground">OpenLog</p>
          </NavbarBrand>
          <NavbarContent justify="end">
            <NavbarItem>
              <Button
                variant="light"
                onPress={() => (window.location.href = "/auth/signin")}
                className="text-foreground"
              >
                Sign in
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        {/* Main Search Section */}
        <div className="flex min-h-[100vh]">
          {/* Left Side - Search Results */}
          <div
            className={`flex-1 px-4 transition-all duration-300 ${
              selectedFile ? "w-1/2" : "w-full"
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Search Input and Type Selection */}
              <div
                className={`flex gap-2 fixed top-0 left-0 right-0 z-49
                  transition-all duration-500 ease-in px-4
                  ${scrolled ? "mt-3" : "mt-20"}
                  ${selectedFile ? "max-w-[50%]" : "max-w-2xl mx-auto"}
                `}
              >
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                  radius="lg"
                  classNames={{
                    base: "flex-1",
                    mainWrapper: "h-full",
                    input: "text-lg px-6 hover:outline-sm hover:bg-background",
                    inputWrapper:
                      "h-16 px-6 shadow-xl border border-divider bg-background hover:!bg-background hover:border-2",
                  }}
                  startContent={
                    <SearchIcon className="text-slate-400 pointer-events-none flex-shrink-0 text-lg mr-2" />
                  }
                />
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-8 mt-20">
                  <Spinner size="lg" />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-danger text-center py-4 mt-20">
                  {error}
                </div>
              )}

              {/* Search Results */}
              {!isLoading && results.length > 0 && (
                <div className="space-y-4 mt-24">
                  {results.map((result) => (
                    <Card
                      key={result.id}
                      className={`w-full cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedFile?.id === result.id ? "border-primary" : ""
                      }`}
                      isPressable
                      onPress={() => handleViewFile(result)}
                    >
                      <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                          <p className="text-md font-semibold">
                            {result.payload.title}
                          </p>
                          <p className="text-small text-default-500">
                            Score: {(result.score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <p>{result.payload.description}</p>
                      </CardBody>
                      <CardFooter>
                        <span className="text-small text-default-400">
                          {new Date(
                            result.payload.created_at
                          ).toLocaleDateString()}
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && searchQuery && results.length === 0 && (
                <div className="text-center py-8 mt-20 text-default-500">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Right Side - File Details */}
          {selectedFile && (
            <div className="w-1/2 border-l border-divider h-screen sticky top-0 overflow-y-auto">
              <FileDetails file={selectedFile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
