"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";

export default function SearchHomepage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
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
            ? "max-w-md mx-auto mt-4 rounded-full shadow-xl border border-divider bg-background/90"
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
        <div className="flex flex-col items-center justify-center min-h-[100vh] px-4">
          <div className="w-full max-w-2xl">
            {/* Search Input */}
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
              //   size="lg"
              radius="lg"
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-full",
                input: "text-lg px-6 hover:outline-sm hover:bg-background",
                inputWrapper:
                  "h-16 px-6 shadow-xl border border-divider bg-background hover:!bg-background hover:border-2 transition-all duration-300",
              }}
              className="hover:outline-sm hover:bg-background"
              startContent={
                <SearchIcon className="text-slate-400 pointer-events-none flex-shrink-0 text-lg mr-2" />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
