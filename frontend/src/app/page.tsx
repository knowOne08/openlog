import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header/Navigation */}
      <header className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
              OpenLog
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-teal-600 transition-colors"
            >
              Dashboard
            </Link>
            {/* <Link
              href="/upload-demo"
              className="text-gray-600 hover:text-teal-600 transition-colors"
            >
              Features
            </Link> */}
            {/* <Link
              href="/test"
              className="text-gray-600 hover:text-teal-600 transition-colors"
            >
              Testing
            </Link> */}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></span>
            System Ready
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
              OpenLog
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A Advanced search system. Secure, scalable, and ready to integrate
            with your workflow.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/auth/signin"
              className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-grey-500/25 hover:-translate-y-1"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/auth/signup"
              className="group border-2 border-grey-600 text-grey-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-gray-600 hover:text-white hover:shadow-xl hover:shadow-gray-500/25 hover:-translate-y-1"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"> */}
        {/* Authentication Card */}
        {/* <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Authentication
            </h3>
            <p className="text-gray-600 mb-6">
              Secure user authentication with multiple sign-in options and
              password recovery.
            </p>
            <div className="space-y-2">
              <Link
                href="/auth/signin"
                className="block text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
              >
                → Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="block text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
              >
                → Create Account
              </Link>
              <Link
                href="/auth/forgot-password"
                className="block text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
              >
                → Reset Password
              </Link>
            </div>
          </div> */}

        {/* Features Card */}
        {/* <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Core Features
            </h3>
            <p className="text-gray-600 mb-6">
              Powerful tools and utilities to enhance your application
              experience.
            </p>
            <div className="space-y-2">
              <Link
                href="/upload-demo"
                className="block text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
              >
                → File Upload Demo
              </Link>
              <Link
                href="/dashboard"
                className="block text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
              >
                → User Dashboard
              </Link>
              <Link
                href="/test"
                className="block text-teal-600 hover:text-teal-700 transition-colors text-sm font-medium"
              >
                → System Testing
              </Link>
            </div>
          </div> */}

        {/* API Card */}
        {/* <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Backend API
            </h3>
            <p className="text-gray-600 mb-6">
              RESTful API endpoints for seamless integration with your
              applications.
            </p>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-green-600 font-bold">POST</span>
                <span className="text-gray-700">/api/v1/auth/login</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-blue-600 font-bold">GET</span>
                <span className="text-gray-700">/api/v1/auth/profile</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-green-600 font-bold">POST</span>
                <span className="text-gray-700">/api/v1/upload</span>
              </div>
            </div>
          </div> */}
        {/* </div> */}

        {/* Stats Section */}
        {/* <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              System Status
            </h2>
            <p className="text-gray-600">
              Real-time overview of your OpenLog instance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                99.9%
              </div>
              <div className="text-sm text-green-700 font-medium">Uptime</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">200ms</div>
              <div className="text-sm text-blue-700 font-medium">
                Response Time
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <div className="text-sm text-purple-700 font-medium">
                API Endpoints
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                Active
              </div>
              <div className="text-sm text-orange-700 font-medium">Status</div>
            </div>
          </div>
        </div> */}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OL</span>
                </div>
                <h3 className="text-xl font-bold text-white">OpenLog</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Modern authentication system designed for scalability and
                security.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link
                  href="/auth/signin"
                  className="block text-gray-400 hover:text-teal-400 transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-gray-400 hover:text-teal-400 transition-colors text-sm"
                >
                  Create Account
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-gray-400 hover:text-teal-400 transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <a
                  href="https://nextjs.org/learn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-teal-400 transition-colors text-sm"
                >
                  <Image
                    aria-hidden
                    src="/file.svg"
                    alt="File icon"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Documentation
                </a>
                <a
                  href="https://vercel.com/templates?framework=next.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-teal-400 transition-colors text-sm"
                >
                  <Image
                    aria-hidden
                    src="/window.svg"
                    alt="Window icon"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Templates
                </a>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-teal-400 transition-colors text-sm"
                >
                  <Image
                    aria-hidden
                    src="/globe.svg"
                    alt="Globe icon"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Next.js
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 OpenLog. Built with Next.js and designed for performance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
