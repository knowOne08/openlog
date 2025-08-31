'use client';

import { useState } from 'react';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implement password reset logic with backend
      console.log('Password reset requested for:', email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <LockClosedIcon className="h-6 w-6 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-teal-800">
            Check your email
          </h2>
          
          <p className="text-sm text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-teal-600 hover:text-teal-500 underline"
            >
              try again
            </button>
          </p>
          
          <div className="pt-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-teal-600 hover:text-teal-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 text-6xl text-gray-400">*</div>
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Form Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-gray-800 mb-4">*</div>
              <h2 className="text-2xl font-bold text-gray-800">
                Reset your password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

          {/* Password Reset Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {/* Back to sign in */}
          <div className="text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 underline"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Image Placeholder */}
      <div className="hidden lg:flex lg:flex-1 bg-gray-900 relative">
        {/* Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-lg font-medium">Image Placeholder</p>
            <p className="text-sm text-gray-300 mt-2">Right section for hero image</p>
          </div>
        </div>
        
        {/* Navigation Arrows (Placeholder) */}
        <div className="absolute bottom-8 left-8 text-white text-2xl opacity-50">
          ←
        </div>
        <div className="absolute bottom-8 right-8 text-white text-2xl opacity-50">
          →
        </div>
      </div>
    </div>
  );
}

