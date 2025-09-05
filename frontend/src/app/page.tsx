"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Spacer,
} from "@heroui/react";

export default function Home() {
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
      {/* Header using HeroUI Navbar */}
      <Navbar
        isBordered
        className={`
        backdrop-blur-xs fixed top-0 left-0 right-0 z-50 
        transition-all duration-500 ease-in
        ${
          scrolled
            ? "max-w-md mx-auto mt-4 h-1/12 rounded-full shadow-xl border border-divider bg-background/90"
            : "w-full rounded-none shadow-none bg-background/80"
        }
      `}
      >
        <NavbarBrand>
          <p className={`${scrolled} ? text-xl :text-2xl text-foreground`}>
            OpenLog
          </p>
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
            <Button
              variant="light"
              onPress={() => (window.location.href = "/dashboard")}
              className="text-foreground"
            >
              Dashboard
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Chip
          color="default"
          variant="flat"
          className="mb-6 bg-gray-100 text-gray-800 pl-2"
          startContent={
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          }
        >
          System Ready
        </Chip>

        <h1 className="text-5xl md:text-6xl mb-6 font-bold text-foreground">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-gray-500 to-gray-300 bg-clip-text text-transparent">
            OpenLog
          </span>
        </h1>

        <p className="text-xl mb-8 max-w-2xl mx-auto text-foreground leading-relaxed">
          Advanced search system. Secure, scalable, and ready to integrate with
          your workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            className="bg-foreground text-background"
            onPress={() => (window.location.href = "/auth/signin")}
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="bordered"
            className=""
            onPress={() => (window.location.href = "/auth/signup")}
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Footer using Cards */}
      <div className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="bg-transparent shadow-none">
              <CardBody className="p-0">
                <h3 className="text-xl text-white mb-4">OpenLog</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Modern searching designed for scalability and security.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-transparent shadow-none">
              <CardHeader className="p-0 pb-4">
                <h4 className="text-white font-semibold">Quick Links</h4>
              </CardHeader>
              <CardBody className="p-0 space-y-2">
                <Button
                  className="justify-start bg-transparent p-0 text-gray-400 hover:text-teal-400 min-h-unit-6 h-auto"
                  onPress={() => (window.location.href = "/auth/signin")}
                >
                  Sign In
                </Button>
                <Button
                  className="justify-start bg-transparent p-0 text-gray-400 hover:text-teal-400 min-h-unit-6 h-auto"
                  onPress={() => (window.location.href = "/auth/signup")}
                >
                  Create Account
                </Button>
                <Button
                  className="justify-start bg-transparent p-0 text-gray-400 hover:text-teal-400 min-h-unit-6 h-auto"
                  onPress={() => (window.location.href = "/dashboard")}
                >
                  Dashboard
                </Button>
              </CardBody>
            </Card>

            <Card className="bg-transparent shadow-none">
              <CardHeader className="p-0 pb-4">
                <h4 className="text-white font-semibold">Resources</h4>
              </CardHeader>
              <CardBody className="p-0 space-y-2">
                <Button
                  className="justify-start bg-transparent p-0 text-gray-400 hover:text-teal-400 min-h-unit-6 h-auto"
                  onPress={() =>
                    window.open("https://nextjs.org/learn", "_blank")
                  }
                >
                  📄 Documentation
                </Button>
                <Button
                  className="justify-start bg-transparent w-fit p-0 text-gray-400 hover:text-teal-400 min-h-unit-6 h-auto"
                  onPress={() =>
                    window.open(
                      "https://vercel.com/templates?framework=next.js",
                      "_blank"
                    )
                  }
                >
                  🪟 Templates
                </Button>
                <Button
                  className="justify-start bg-transparent p-0 text-gray-400 hover:text-teal-400 min-h-unit-6 h-auto"
                  onPress={() => window.open("https://nextjs.org", "_blank")}
                >
                  🌐 Next.js
                </Button>
              </CardBody>
            </Card>
          </div>

          <Divider className="bg-gray-800 mb-8" />

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 OpenLog. Built with Next.js and designed for performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
