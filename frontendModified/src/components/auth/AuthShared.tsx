import React, { type ReactNode, type SVGProps } from 'react';
import {Link} from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

/**
 * Shared Navigation Data for Auth Pages
 */
export const NavBarData = [
  {
    title: "Login",
    to: "/login",
    icon: <LogIn className="w-5 h-5" />
  },
  {
    title: "Register",
    to: "/register",
    icon: <UserPlus className="w-5 h-5" />
  }
];

/**
 * Anonymous Figure Icon with Bandana
 * A bust silhouette with a bandana tied around nose and mouth
 */
export const AnonymousIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    {/* Head */}
    <ellipse cx="50" cy="35" rx="22" ry="28" fill="#4A5568" />

    {/* Neck */}
    <rect x="43" y="58" width="14" height="12" fill="#4A5568" />

    {/* Shoulders */}
    <path d="M 30 70 Q 50 75 70 70 L 75 85 Q 50 90 25 85 Z" fill="#4A5568" />

    {/* Eyes - positioned in upper half of face */}
    <ellipse cx="42" cy="28" rx="3" ry="4" fill="#1F2937" />
    <ellipse cx="58" cy="28" rx="3" ry="4" fill="#1F2937" />

    {/* Eye highlights */}
    <ellipse cx="43" cy="27" rx="1" ry="1.5" fill="white" opacity="0.8" />
    <ellipse cx="59" cy="27" rx="1" ry="1.5" fill="white" opacity="0.8" />

    {/* Subtle eyebrows */}
    <path d="M 38 24 Q 42 23 45 24" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 55 24 Q 58 23 62 24" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Bandana - main cloth covering from midway down (nose to chin) amber color */}
    <ellipse cx="50" cy="45" rx="24" ry="14" fill="#B45309" />

    {/* Bandana - top fold at nose level */}
    <ellipse cx="50" cy="40" rx="24" ry="3" fill="#78350F" />

    {/* Bandana - bottom edge */}
    <ellipse cx="50" cy="50" rx="22" ry="2" fill="#78350F" opacity="0.6" />

    {/* Bandana - knot on right side */}
    <circle cx="73" cy="45" r="4.5" fill="#78350F" />
    <circle cx="76" cy="43" r="3.5" fill="#B45309" />

    {/* Bandana - left side tie hint */}
    <circle cx="27" cy="45" r="2" fill="#78350F" opacity="0.7" />
  </svg>
);

/**
 * Message Square Icon Component (keeping for backward compatibility)
 */
export const MessageSquareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

/**
 * Eye icon component
 * @param {object} props - React props
 * @returns {JSX.Element}
 */
export const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/**
 * EyeOff icon component
 * @param {object} props - React props
 * @returns {JSX.Element}
 */
export const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.717 9.717 0 0 0 5-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

/**
 * Auth Card Container Component
 */
export const AuthCard = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-center min-h-screen  font-inter">
    <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/80  rounded-2xl border border-slate-600 shadow-xl mx-4">
      {children}
    </div>
  </div>
);

/**
 * Auth Header Component
 */
export const AuthHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center">
    <div className="inline-block p-3 bg-amber-500/20 rounded-full">
      <AnonymousIcon className="w-12 h-12 text-amber-400" />
    </div>
    <h2 className="mt-4 text-3xl font-bold text-white">
      {title}
    </h2>
    <p className="mt-2 text-sm text-slate-300">
      {subtitle}
    </p>
  </div>
);

/**
 * Form Input Component
 */
export const FormInput = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  minLength,
  error
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  error?: string;
}) => (
  <div className="mb-3 space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-slate-200 float-left">
      {label}
    </label>
    <div className="relative mt-1">
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 text-white placeholder-slate-400 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
    {error && <span className="text-sm text-red-400 mt-1">{error}</span>}
  </div>
);

/**
 * Password Input Component with Toggle Visibility
 */
export const PasswordInput = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = true,
  autoComplete = "current-password",
  minLength,
  error,
  showPassword,
  onTogglePassword,
  showForgotPassword = false
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  showForgotPassword?: boolean;
}) => (
  <div className="mb-3 space-y-1">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      {showForgotPassword && (
        <a href="#" className="text-sm font-medium text-amber-400 hover:text-amber-300 hover:underline">
          Forgot password?
        </a>
      )}
    </div>
    <div className="relative mt-1">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 text-white placeholder-slate-400 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <EyeOffIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
    {error && <span className="text-sm text-red-400 mt-1">{error}</span>}
  </div>
);

/**
 * Submit Button Component
 */
export const SubmitButton = ({ loading, loadingText, text, disabled = false }: { loading?: boolean; loadingText: string; text: string; disabled?: boolean }) => (
  <div>
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full px-4 py-3 font-semibold text-white bg-linear-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? loadingText : text}
    </button>
  </div>
);

/**
 * Error Message Component
 */
export const ErrorMessage = ({ message }: { message?: string }) => (
  message ? (
    <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-700/50 rounded-lg m-2">
      {message}
    </div>
  ) : null
);

/**
 * Success Message Component
 */
export const SuccessMessage = ({ message }: { message?: string }) => (
  message ? (
    <div className="p-3 text-sm text-green-400 bg-green-900/30 border border-green-700/50 rounded-lg m-2">
      {message}
    </div>
  ) : null
);

/**
 * Auth Link Component
 */
export const AuthLink = ({ text, linkText, href }: { text: string; linkText: string; href: string }) => (
  <div className="text-center text-sm">
    <span className="text-slate-300">{text} </span>
    {/* <a href={href} className="font-medium text-amber-400 hover:text-amber-300 hover:underline">
      {linkText}
    </a> */}
    <Link to={href} className="font-medium text-amber-400 hover:text-amber-300 hover:underline">
      {linkText}
    </Link>
  </div>
);