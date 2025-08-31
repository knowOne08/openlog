'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  rightPanelContent?: ReactNode;
  showBackLink?: boolean;
  backLinkHref?: string;
  backLinkText?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  rightPanelContent,
  showBackLink = false,
  backLinkHref = '/auth/signin',
  backLinkText = 'Back to sign in'
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-teal-800">OpenLog</h1>
            <h2 className="mt-6 text-2xl font-bold text-teal-800">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Panel - Illustrative & Marketing Content */}
      <div className="hidden lg:flex lg:flex-1 bg-blue-50 flex-col justify-center px-8">
        {/* Navigation Link */}
        {showBackLink && (
          <div className="text-right mb-8">
            <Link href={backLinkHref} className="text-teal-600 hover:text-teal-500 font-medium underline">
              {backLinkText}
            </Link>
          </div>
        )}

        {/* Custom Right Panel Content or Default */}
        {rightPanelContent || (
          <>
            {/* Default Illustration */}
            <div className="flex justify-center mb-8">
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-2">🏄‍♂️</div>
                  <p className="text-sm">Searching together</p>
                </div>
              </div>
            </div>

            {/* Trusted by Section */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-4">trusted by</p>
              <div className="flex justify-center space-x-8">
                <div className="text-gray-400 font-semibold">Google</div>
                <div className="text-gray-400 font-semibold">Uber</div>
                <div className="text-gray-400 font-semibold">MIRAKL</div>
                <div className="text-gray-400 font-semibold">spendesk</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

