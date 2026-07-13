import React from 'react';
import { AnonymousIcon } from '../auth/AuthShared';
import Footer from '../../ui/Footer';

const CursiveUnderline = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path d="M 0 5 Q 50 2, 100 5 T 200 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const navLinks = [
  { title: 'About', href: '/about' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Changelog', href: '/changelog' },
];

const MarketingHeader = () => (
  <header className="sticky top-0 z-30 bg-lk-s1/90 dark:bg-dk-s1/90 backdrop-blur-sm border-b border-lk-border dark:border-dk-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2">
        <AnonymousIcon className="w-8 h-8 text-lk-accent2 dark:text-dk-accent" />
        <div className="relative inline-block">
          <span className="font-display font-extrabold italic text-lg text-lk-t1 dark:text-dk-t1">
            Talk Your Talk!
          </span>
          <CursiveUnderline className="absolute left-0 right-0 -bottom-1 w-full h-1.5 text-lk-accent dark:text-dk-accent" />
        </div>
      </a>
      <nav className="hidden sm:flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-lk-t2 dark:text-dk-t2 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors"
          >
            {link.title}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="text-sm font-medium text-lk-t2 dark:text-dk-t2 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors"
        >
          Sign in
        </a>
        <a
          href="/register"
          className="text-sm font-display font-bold text-white bg-lk-accent dark:bg-dk-accent hover:bg-lk-accent2 dark:hover:bg-dk-accent2 px-4 py-2 rounded-full transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  </header>
);

const MarketingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-lk-bg dark:bg-dk-bg font-sans">
    <MarketingHeader />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default MarketingLayout;
