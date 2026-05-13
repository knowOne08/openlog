"use client";
import { useState, useEffect } from "react";
import { Button, Card, Chip } from "@heroui/react";
import Link from "next/link";

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
      {/* Header Navigation */}
      <nav
        className={`
        fixed top-0 left-0 right-0 z-50 
        transition-all duration-500 ease-in
        backdrop-blur-xs border-b border-divider
        ${
          scrolled
            ? "max-w-md mx-auto mt-4 rounded-full shadow-xl bg-background/90"
            : "w-full rounded-none shadow-none bg-background/80"
        }
      `}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className={`${scrolled ? "text-xl" : "text-2xl"} text-foreground font-bold`}
          >
            OpenLog
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-background bg-foreground">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 mt-20 text-center">
        <Chip color="default" className="mb-6 bg-gray-100 text-gray-800">
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
          <Link href="/auth/signin">
            <Button size="lg" variant="tertiary">
              Sign In
            </Button>
          </Link>
          {/* <Link href="/auth/signup">
            <Button size="lg" variant="outline">
              Get Started
            </Button>
          </Link> */}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* OpenLog Column */}
            <Card className="bg-transparent shadow-none">
              <div className="p-0">
                <h3 className="text-xl text-white mb-4">OpenLog</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Modern searching designed for scalability and security.
                </p>
              </div>
            </Card>

            {/* Quick Links Column */}
            <Card className="bg-transparent shadow-none">
              <div className="p-0 pb-4">
                <h4 className="text-white font-semibold">Quick Links</h4>
              </div>
              <div className="p-0 space-y-2">
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-400 hover:text-teal-400"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-400 hover:text-teal-400"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-400 hover:text-teal-400"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Resources Column */}
            <Card className="bg-transparent shadow-none">
              <div className="p-0 pb-4">
                <h4 className="text-white font-semibold">Resources</h4>
              </div>
              <div className="p-0 space-y-2">
                <Button
                  variant="ghost"
                  className="justify-start text-gray-400 hover:text-teal-400"
                  onPress={() =>
                    window.open("https://nextjs.org/learn", "_blank")
                  }
                >
                  📄 Documentation
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-gray-400 hover:text-teal-400"
                  onPress={() =>
                    window.open(
                      "https://vercel.com/templates?framework=next.js",
                      "_blank",
                    )
                  }
                >
                  🪟 Templates
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-gray-400 hover:text-teal-400"
                  onPress={() => window.open("https://nextjs.org", "_blank")}
                >
                  🌐 Next.js
                </Button>
              </div>
            </Card>
          </div>

          <div className="border-t border-gray-800 mb-8" />

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
