import React, { useState } from 'react';
import { AnonymousIcon } from '../components/auth/AuthShared';

// --- SVG Icon Components ---
// Using inline SVGs as per single-file requirement.

/**
 * Anonymous Figure Icon with Bandana
 * A bust silhouette with a bandana tied around nose and mouth
 */

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Cursive Underline SVG Component
 */
const CursiveUnderline = ({ className = "" }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 200 10" 
    xmlns="http://www.w3.org/2000/svg" 
    preserveAspectRatio="none"
  >
    <path 
      d="M 0 5 Q 50 2, 100 5 T 200 5" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round"
    />
  </svg>
);

interface NavItemData {
  title: string;
  to?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  children?: NavItemData[]; // Add children property for dropdown items
}

interface NavItemProps {
  item: NavItemData;
  onClick?: () => void;
  isExpanded: boolean;
}

/**
 * Navigation Item Component
 * Symmetrical padding and spacing
 */
const NavItem = ({ item, onClick, isExpanded }: NavItemProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Consistent padding for both expanded and collapsed states
  const baseClasses = "flex items-center rounded-lg cursor-pointer transition-colors duration-300";
  const expandedClasses = "px-5 py-3";
  const collapsedClasses = "p-3 justify-center";
  
  const iconBaseClasses = "w-5 h-5";
  const iconExpandedClasses = "text-white";
  const iconCollapsedClasses = "text-white";
  
  const textClasses = isExpanded ? "ml-4 text-sm font-medium" : "hidden";
  
  // Dropdown container classes
  const dropdownContainerClasses = isExpanded 
    ? "ml-8 mt-1 space-y-1" 
    : "hidden";

  const handleItemClick = (e: React.MouseEvent) => {
    // If item has children, toggle dropdown instead of navigating
    if (item.children && item.children.length > 0) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      // Execute onClick if provided, otherwise follow href
      if (onClick) {
        onClick();
      } else if (item.onClick) {
        item.onClick();
      }
    }
  };

  return (
    <div>
      <a 
        href={item.to || '#'} 
        onClick={handleItemClick} 
        className={`${baseClasses} ${isExpanded ? expandedClasses : collapsedClasses} hover:bg-amber-700/50`}
      >
        <span className={`${iconBaseClasses} ${isExpanded ? iconExpandedClasses : iconCollapsedClasses}`}>
          {item.icon}
        </span>
        {isExpanded && (
          <>
            <span className={textClasses}>{item.title}</span>
            {item.children && item.children.length > 0 && (
              <svg 
                className={`ml-auto w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
          </>
        )}
      </a>
      
      {/* Dropdown for children items */}
      {item.children && item.children.length > 0 && isDropdownOpen && (
        <div className={dropdownContainerClasses}>
          {item.children.map((child, idx) => (
            <NavItem 
              key={idx} 
              item={child} 
              onClick={child.onClick} 
              isExpanded={isExpanded} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NavBarProps {
  navItems?: NavItemData[];
  title?: string;
}

/*
 * GLOBAL NAV BAR
 */
const NavBar = ({ navItems = [], title = 'Navigation' }: NavBarProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar - Hidden on sm/md, always visible and open on lg+ */}
      <aside 
        className={`h-screen sticky top-0 bg-amber-600/80 backdrop-blur-sm text-white transition-all duration-300 ease-in-out hidden lg:flex lg:w-64 flex-col border rounded-lg ${
          expanded ? 'w-64' : ''
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header section with symmetrical padding */}
          <div className="px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AnonymousIcon className="text-white w-12 h-12" />
                <div className="relative inline-block">
                  <div className="font-bold text-xl md:text-2xl italic">{title}</div>
                  <CursiveUnderline className="absolute left-0 right-0 -bottom-1 w-full h-1.5 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation items with consistent spacing */}
          <nav className="flex-1 overflow-auto px-3 space-y-2">
            {navItems.map((it, idx) => (
              <NavItem 
                key={idx} 
                item={it} 
                onClick={it.onClick} 
                isExpanded={true} 
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar overlay - Hidden on lg+, shown on sm/md when expanded */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-black opacity-20 lg:hidden z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Mobile sidebar - Hidden on lg+, visible on sm/md when expanded */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-amber-600/80 backdrop-blur-sm text-white transition-all duration-300 ease-in-out lg:hidden z-50 ${
          expanded ? 'w-64' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header section with close button */}
          <div className="px-2 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AnonymousIcon className="text-white w-12 h-12" />
                <div className="relative inline-block">
                  <div className="font-bold text-xl md:text-2xl italic">{title}</div>
                  <CursiveUnderline className="absolute left-0 right-0 -bottom-1 w-full h-1.5 text-white" />
                </div>
              </div>
              <button 
                onClick={() => setExpanded(false)} 
                aria-label="Close menu" 
                className="p-2 rounded-full text-white hover:bg-amber-700/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation items */}
          <nav className="flex-1 overflow-auto px-2 space-y-1">
            {navItems.map((it, idx) => (
              <NavItem 
                key={idx} 
                item={it} 
                onClick={() => {
                  it.onClick?.();
                  setExpanded(false);
                }} 
                isExpanded={true} 
              />
            ))}
          </nav>
        </div>
      </aside>

      <button
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? "Close menu" : "Open menu"}
        className="fixed top-6 left-6 p-4 rounded-full bg-amber-600/80 backdrop-blur-sm text-white shadow-lg hover:bg-amber-700/80 transition-colors duration-300 lg:hidden z-40"
      >
        {/* {expanded ? (
          <CloseIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )} */}
        <AnonymousIcon className="w-6 h-6" />
      </button>
    </div>
  );
}; 

export default NavBar;
export { AnonymousIcon, CloseIcon, HomeIcon, MessageSquareIcon, SettingsIcon, MenuIcon, };