import React from 'react';

const Footer = ({ children }) => {
  return (
    <footer className="mt-8 border-t border-white/6 p-4 text-sm text-gray-400">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Anonymous Website</div>
        <div className="flex items-center gap-4">
          <a href="/about" className="hover:underline">About</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </div>
      </div>
      {children}
    </footer>
  );
};

export default Footer;
