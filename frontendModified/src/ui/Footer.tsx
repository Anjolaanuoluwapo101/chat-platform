import React from 'react';

interface FooterProps {
  children?: React.ReactNode;
}

const Footer = ({ children }: FooterProps) => {
  return (
    <footer className="border-t border-lk-border dark:border-dk-border p-4 text-sm text-lk-t3 dark:text-dk-t3 bg-lk-s1 dark:bg-dk-s1">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Talk Your Talk!</div>
        <div className="flex items-center gap-4">
          <a href="/about" className="hover:underline text-lk-t2 dark:text-dk-t2 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors">About</a>
          <a href="/pricing" className="hover:underline text-lk-t2 dark:text-dk-t2 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors">Pricing</a>
          <a href="/changelog" className="hover:underline text-lk-t2 dark:text-dk-t2 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors">Changelog</a>
          <a href="/privacy" className="hover:underline text-lk-t2 dark:text-dk-t2 hover:text-lk-accent2 dark:hover:text-dk-accent transition-colors">Privacy</a>
        </div>
      </div>
      {children}
    </footer>
  );
};

export default Footer