import React from 'react';

interface FooterProps {
  children?: React.ReactNode;
}

const Footer = ({ children }: FooterProps) => {
  return (
    <footer className="border-t p-4 text-sm text-slate-400 bg-slate-900/95">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Talk Your Talk!</div>
        <div className="flex items-center gap-4">
          <a href="/about" className="hover:underline text-slate-300 hover:text-amber-400 transition-colors">About</a>
          <a href="/privacy" className="hover:underline text-slate-300 hover:text-amber-400 transition-colors">Privacy</a>
          <a href="/terms" className="hover:underline text-slate-300 hover:text-amber-400 transition-colors">Terms</a>
        </div>
      </div>
      {children}
    </footer>
  );
};

export default Footer