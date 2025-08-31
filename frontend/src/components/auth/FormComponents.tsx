'use client';

import { ReactNode } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

export function InputField({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  className = ''
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className={`appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}

export function PasswordField({
  id,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function Button({
  type = 'button',
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  className = ''
}: ButtonProps) {
  const baseClasses = "group relative w-full flex justify-center py-3 px-4 border text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "border-transparent text-white bg-gray-800 hover:bg-gray-600",
    secondary: "border-transparent text-teal-700 bg-teal-100 hover:bg-teal-200",
    outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

interface SocialButtonProps {
  provider: 'google' | 'microsoft';
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export function SocialButton({ provider, onClick, disabled = false, children }: SocialButtonProps) {
  const getProviderIcon = () => {
    if (provider === 'google') {
      return (
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
          G
        </div>
      );
    }
    
    if (provider === 'microsoft') {
      return (
        <div className="w-5 h-5 grid grid-cols-2 gap-0.5 mr-3">
          <div className="w-2 h-2 bg-red-500"></div>
          <div className="w-2 h-2 bg-green-500"></div>
          <div className="w-2 h-2 bg-blue-500"></div>
          <div className="w-2 h-2 bg-yellow-500"></div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {getProviderIcon()}
      {children}
    </button>
  );
}

interface SeparatorProps {
  text?: string;
}

export function Separator({ text = 'or' }: SeparatorProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  );
}

interface ComplianceInfoProps {
  className?: string;
}

export function ComplianceInfo({ className = '' }: ComplianceInfoProps) {
  return (
    <div className={`flex items-center justify-center text-xs text-gray-500 ${className}`}>
      <LockClosedIcon className="h-4 w-4 mr-1" />
      GDPR compliant. ISO-27001 certified.
    </div>
  );
}

