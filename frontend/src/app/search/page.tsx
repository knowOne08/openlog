"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Link,
  Switch,
  Chip,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";

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
  const [isSemanticSearch, setIsSemanticSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [dateFilter] = useState("all");
  const [selectedTags] = useState<string[]>([]);
  const [averageLatency, setAverageLatency] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  const handleSearch = React.useCallback(
    async (e?: React.FormEvent, loadMore = false) => {
      e?.preventDefault();

      if (!searchQuery.trim()) {
        setResults([]);
        setCurrentPage(1);
        setHasMore(false);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      setError("");

      // Record start time for latency measurement
      const startTime = performance.now();

      try {
        const searchEndpoint = isSemanticSearch
          ? `${process.env.NEXT_PUBLIC_API_URL}/search/query`
          : `${process.env.NEXT_PUBLIC_API_URL}/search/traditional`;

        const page = loadMore ? currentPage + 1 : 1;

        const response = await fetch(searchEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            type: isSemanticSearch ? "semantic" : "traditional",
            limit: resultsPerPage,
            offset: (page - 1) * resultsPerPage,
          }),
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = (await response.json()) as ApiResponse & {
          total?: number;
          hasMore?: boolean;
        };

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
          filteredResults = filteredResults.filter((result: SearchResult) => {
            let tagsArray: string[] = [];
            try {
              if (typeof result.payload.tags === "string") {
                tagsArray = JSON.parse(result.payload.tags);
              } else if (Array.isArray(result.payload.tags)) {
                tagsArray = result.payload.tags;
              }
            } catch (e) {
              console.error("Error parsing tags:", e);
            }
            return tagsArray.some((tag: string) => selectedTags.includes(tag));
          });
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

        if (loadMore) {
          setResults((prev) => [...prev, ...filteredResults]);
          setCurrentPage(page);
        } else {
          setResults(filteredResults);
          setCurrentPage(1);
        }

        setTotalResults(data.total || filteredResults.length);
        setHasMore(data.hasMore || filteredResults.length === resultsPerPage);
      } catch (err) {
        setError("Failed to perform search. Please try again.");
        // Only log detailed errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Search error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      searchQuery,
      isSemanticSearch,
      dateFilter,
      selectedTags,
      currentPage,
      resultsPerPage,
    ]
  );

  // Memoize search function to prevent infinite loop
  const debouncedSearch = React.useCallback(async () => {
    if (searchQuery.trim()) {
      await handleSearch();
    }
  }, [searchQuery, handleSearch]);

  // Debounce search function
  useEffect(() => {
    const debounceTimeout = setTimeout(debouncedSearch, 300); // 300ms debounce delay
    return () => clearTimeout(debounceTimeout);
  }, [debouncedSearch]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      handleSearch(undefined, true);
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
          <h2 className="text-xl font-semibold text-foreground">
            {file.payload.title}
          </h2>
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
                    // Silently handle tag parsing errors in production
                    if (process.env.NODE_ENV === "development") {
                      console.error("Error parsing tags:", e);
                    }
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
              {/* Search Input and Controls */}
              <div
                className={`flex flex-col gap-2 fixed top-0 left-0 right-0 z-49 bg-background/80 backdrop-blur-sm p-4 border-b border-divider
                  ease-in
                  ${scrolled ? "mt-0" : "mt-16"}
                  ${selectedFile ? "max-w-[50%]" : "max-w-2xl mx-auto"}
                `}
              >
                <div className="flex gap-2">
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
                      input:
                        "text-lg px-6 hover:outline-sm hover:bg-background",
                      inputWrapper:
                        "h-12 px-6 shadow-lg border border-divider bg-background hover:!bg-background hover:border-2",
                    }}
                    startContent={
                      <SearchIcon className="text-slate-400 pointer-events-none flex-shrink-0 text-lg mr-2" />
                    }
                  />
                  <Button
                    color="primary"
                    size="lg"
                    onPress={() => handleSearch()}
                    isLoading={isLoading}
                    className="px-8"
                  >
                    Search
                  </Button>
                </div>

                {/* Search Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        isSelected={isSemanticSearch}
                        onValueChange={setIsSemanticSearch}
                        size="sm"
                        color="primary"
                      />
                      <span className="text-sm text-default-600">
                        {isSemanticSearch
                          ? "Semantic Search"
                          : "Traditional Search"}
                      </span>
                    </div>

                    {averageLatency && (
                      <Chip size="sm" color="success" variant="flat">
                        {averageLatency.toFixed(0)}ms
                      </Chip>
                    )}
                  </div>

                  {totalResults > 0 && (
                    <span className="text-sm text-default-500">
                      {results.length} of {totalResults} results
                    </span>
                  )}
                </div>
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
                <div className="space-y-4 mt-40">
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

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="bordered"
                        onPress={handleLoadMore}
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        Load More Results
                      </Button>
                    </div>
                  )}
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
            <div
              className={`w-1/2 border-l border-divider h-screen sticky overflow-y-auto`}
            >
              <FileDetails file={selectedFile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
