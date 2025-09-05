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
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left decorative plants */}
        {/* <div className="absolute left-0 bottom-0 w-64 h-96 opacity-30">
          <svg viewBox="0 0 200 300" className="w-full h-full text-slate-300">
            <path
              d="M20 280 Q30 250 25 220 Q35 190 30 160 Q40 130 35 100 Q45 70 40 40"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M40 270 Q50 240 45 210 Q55 180 50 150 Q60 120 55 90 Q65 60 60 30"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            /> */}
        {/* Leaves */}
        {/* <ellipse
              cx="25"
              cy="220"
              rx="8"
              ry="15"
              fill="currentColor"
              opacity="0.6"
            />
            <ellipse
              cx="30"
              cy="160"
              rx="10"
              ry="18"
              fill="currentColor"
              opacity="0.6"
            />
            <ellipse
              cx="35"
              cy="100"
              rx="12"
              ry="20"
              fill="currentColor"
              opacity="0.6"
            />
            <ellipse
              cx="45"
              cy="210"
              rx="8"
              ry="15"
              fill="currentColor"
              opacity="0.6"
            />
            <ellipse
              cx="50"
              cy="150"
              rx="10"
              ry="18"
              fill="currentColor"
              opacity="0.6"
            />
            <ellipse
              cx="55"
              cy="90"
              rx="12"
              ry="20"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div> */}

        {/* Right decorative plants */}
        {/* <div className="absolute right-0 bottom-0 w-80 h-96 opacity-20">
          <svg viewBox="0 0 250 300" className="w-full h-full text-slate-300"> */}
        {/* Large plant stems */}
        {/* <path
              d="M180 280 Q170 250 175 220 Q165 190 170 160 Q160 130 165 100 Q155 70 160 40"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M200 270 Q210 240 205 210 Q215 180 210 150 Q220 120 215 90"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M220 280 Q230 250 225 220 Q235 190 230 160"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            /> */}
        {/* Large leaves */}
        {/* <ellipse
              cx="175"
              cy="220"
              rx="15"
              ry="25"
              fill="currentColor"
              opacity="0.5"
            />
            <ellipse
              cx="170"
              cy="160"
              rx="18"
              ry="30"
              fill="currentColor"
              opacity="0.5"
            />
            <ellipse
              cx="165"
              cy="100"
              rx="20"
              ry="35"
              fill="currentColor"
              opacity="0.5"
            />
            <ellipse
              cx="205"
              cy="210"
              rx="12"
              ry="22"
              fill="currentColor"
              opacity="0.5"
            />
            <ellipse
              cx="210"
              cy="150"
              rx="15"
              ry="28"
              fill="currentColor"
              opacity="0.5"
            />
            <ellipse
              cx="225"
              cy="220"
              rx="10"
              ry="20"
              fill="currentColor"
              opacity="0.5"
            /> */}
        {/* </svg>
        </div> */}

        {/* Floating circles */}
        {/* <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-blue-200 opacity-20"></div>
        <div className="absolute top-40 right-1/3 w-24 h-24 rounded-full bg-purple-200 opacity-25"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-200 opacity-15"></div> */}
      </div>

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
