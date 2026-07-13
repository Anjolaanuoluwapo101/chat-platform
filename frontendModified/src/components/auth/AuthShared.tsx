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

    {/* Bandana - main cloth covering from midway down (nose to chin) green color */}
    <ellipse cx="50" cy="45" rx="24" ry="14" fill="#1AC564" />

    {/* Bandana - top fold at nose level */}
    <ellipse cx="50" cy="40" rx="24" ry="3" fill="#15A354" />

    {/* Bandana - bottom edge */}
    <ellipse cx="50" cy="50" rx="22" ry="2" fill="#15A354" opacity="0.6" />

    {/* Bandana - knot on right side */}
    <circle cx="73" cy="45" r="4.5" fill="#15A354" />
    <circle cx="76" cy="43" r="3.5" fill="#1AC564" />

    {/* Bandana - left side tie hint */}
    <circle cx="27" cy="45" r="2" fill="#15A354" opacity="0.7" />
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
  <div className="flex items-center justify-center min-h-screen font-sans">
    <div className="w-full max-w-md p-8 space-y-8 bg-lk-s1 dark:bg-dk-s1 rounded-2xl border border-lk-border dark:border-dk-border shadow-[0_8px_32px_rgba(0,0,0,.09),0_2px_8px_rgba(0,0,0,.05)] mx-4">
      {children}
    </div>
  </div>
);

/**
 * Auth Header Component
 */
export const AuthHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center">
    <div className="inline-block p-3 rounded-2xl bg-lk-accent dark:bg-dk-accent">
      <AnonymousIcon className="w-12 h-12 text-white" />
    </div>
    <h2 className="mt-4 text-3xl font-bold font-display text-lk-t1 dark:text-dk-t1">
      {title}
    </h2>
    <p className="mt-2 text-sm text-lk-t3 dark:text-dk-t3">
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
    <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3 float-left">
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
        className="w-full px-4 py-3 text-lk-t1 dark:text-dk-t1 placeholder-lk-t3 dark:placeholder-dk-t3 bg-lk-s3 dark:bg-dk-s3 border-2 border-lk-border dark:border-dk-border rounded-[10px] appearance-none focus:outline-none focus:border-lk-accent dark:focus:border-dk-accent focus:bg-lk-accent-pale dark:focus:bg-dk-accent-pale transition-colors"
        placeholder={placeholder}
      />
    </div>
    {error && <span className="text-sm text-lk-danger dark:text-dk-danger mt-1">{error}</span>}
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
      <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wide text-lk-t3 dark:text-dk-t3">
        {label}
      </label>
      {showForgotPassword && (
        <a href="#" className="text-xs font-semibold text-lk-accent2 dark:text-dk-accent hover:underline">
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
        className="w-full px-4 py-3 text-lk-t1 dark:text-dk-t1 placeholder-lk-t3 dark:placeholder-dk-t3 bg-lk-s3 dark:bg-dk-s3 border-2 border-lk-border dark:border-dk-border rounded-[10px] appearance-none focus:outline-none focus:border-lk-accent dark:focus:border-dk-accent focus:bg-lk-accent-pale dark:focus:bg-dk-accent-pale transition-colors"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-lk-t3 dark:text-dk-t3 hover:text-lk-t1 dark:hover:text-dk-t1"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <EyeOffIcon className="w-5 h-5" />
        ) : (
          <EyeIcon className="w-5 h-5" />
        )}
      </button>
    </div>
    {error && <span className="text-sm text-lk-danger dark:text-dk-danger mt-1">{error}</span>}
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
      className="w-full px-4 py-3 font-display font-bold text-white bg-lk-accent dark:bg-dk-accent rounded-full hover:bg-lk-accent2 dark:hover:bg-dk-accent2 focus:outline-none focus:ring-2 focus:ring-lk-accent dark:focus:ring-dk-accent focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="p-3 text-sm text-lk-danger dark:text-dk-danger bg-lk-danger-pale dark:bg-dk-danger-pale border border-lk-danger/30 dark:border-dk-danger/30 rounded-lg m-2">
      {message}
    </div>
  ) : null
);

/**
 * Success Message Component
 */
export const SuccessMessage = ({ message }: { message?: string }) => (
  message ? (
    <div className="p-3 text-sm text-lk-accent2 dark:text-dk-accent bg-lk-accent-pale dark:bg-dk-accent-pale border border-lk-accent/30 dark:border-dk-accent/30 rounded-lg m-2">
      {message}
    </div>
  ) : null
);

/**
 * Auth Link Component
 */
export const AuthLink = ({ text, linkText, href }: { text: string; linkText: string; href: string }) => (
  <div className="text-center text-sm">
    <span className="text-lk-t3 dark:text-dk-t3">{text} </span>
    <Link to={href} className="font-semibold text-lk-accent2 dark:text-dk-accent hover:underline">
      {linkText}
    </Link>
  </div>
);

/**
 * "or" Divider Component
 */
export const OrDivider = () => (
  <div className="flex items-center gap-3 w-full">
    <div className="flex-1 h-px bg-lk-border dark:bg-dk-border" />
    <span className="text-xs font-medium text-lk-t3 dark:text-dk-t3">or</span>
    <div className="flex-1 h-px bg-lk-border dark:bg-dk-border" />
  </div>
);

/**
 * Password Strength Meter (3-bar)
 * Scores password strength 0-3 based on length/variety and renders 3 segmented bars.
 */
export const getPasswordStrength = (password: string): { score: 0 | 1 | 2 | 3; label: string; color: string } => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score++;
  const clamped = Math.max(1, Math.min(3, score)) as 1 | 2 | 3;
  const labels = { 1: 'Weak', 2: 'Medium', 3: 'Strong' } as const;
  const colors = { 1: '#F03A47', 2: '#F5A623', 3: '#1AC564' } as const;
  return { score: clamped, label: labels[clamped], color: colors[clamped] };
};

export const PasswordStrengthMeter = ({ password }: { password: string }) => {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  return (
    <div className="flex items-center gap-2 w-full mt-1">
      {[1, 2, 3].map((bar) => (
        <div key={bar} className="flex-1 h-[3px] rounded-full bg-lk-border dark:bg-dk-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: bar <= score ? '100%' : '0%', background: color }}
          />
        </div>
      ))}
      <span className="text-[9px] font-bold shrink-0" style={{ color }}>{label}</span>
    </div>
  );
};