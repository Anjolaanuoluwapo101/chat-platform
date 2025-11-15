import React, { useState } from 'react';

// --- SVG Icon Components ---
// Using inline SVGs as per single-file requirement.

/**
 * Anonymous Figure Icon with Bandana
 * A bust silhouette with a bandana tied around nose and mouth
 */
const AnonymousIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    {/* Head */}
    <ellipse cx="50" cy="35" rx="22" ry="28" fill="currentColor" />
    
    {/* Neck */}
    <rect x="43" y="58" width="14" height="12" fill="currentColor" />
    
    {/* Shoulders */}
    <path d="M 30 70 Q 50 75 70 70 L 75 85 Q 50 90 25 85 Z" fill="currentColor" />
    
    {/* Eyes - positioned in upper half of face */}
    <ellipse cx="42" cy="28" rx="3" ry="4" fill="#1F2937" />
    <ellipse cx="58" cy="28" rx="3" ry="4" fill="#1F2937" />
    
    {/* Eye highlights */}
    <ellipse cx="43" cy="27" rx="1" ry="1.5" fill="white" opacity="0.8" />
    <ellipse cx="59" cy="27" rx="1" ry="1.5" fill="white" opacity="0.8" />
    
    {/* Subtle eyebrows */}
    <path d="M 38 24 Q 42 23 45 24" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 55 24 Q 58 23 62 24" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    
    {/* Bandana - main cloth covering from midway down (nose to chin) */}
    <ellipse cx="50" cy="45" rx="24" ry="14" fill="#2563EB" />
    
    {/* Bandana - top fold at nose level */}
    <ellipse cx="50" cy="40" rx="24" ry="3" fill="#1E40AF" />
    
    {/* Bandana - bottom edge */}
    <ellipse cx="50" cy="50" rx="22" ry="2" fill="#1E40AF" opacity="0.6" />
    
    {/* Bandana - knot on right side */}
    <circle cx="73" cy="45" r="4.5" fill="#1E40AF" />
    <circle cx="76" cy="43" r="3.5" fill="#2563EB" />
    
    {/* Bandana - left side tie hint */}
    <circle cx="27" cy="45" r="2" fill="#1E40AF" opacity="0.7" />
  </svg>
);

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
}

interface NavItemProps {
  item: NavItemData;
  onClick?: () => void;
  isExpanded: boolean;
}

/**
 * Navigation Item Component
 * Renders a single link for the nav bar.
 * Uses <a> tags instead of <Link> for previewing without react-router.
 */
const NavItem = ({ item, onClick, isExpanded }: NavItemProps) => {
  // Define styles based on whether the sidebar is expanded or collapsed
  const baseClasses = "flex items-center rounded-lg cursor-pointer transition-colors duration-300";
  const expandedClasses = "px-4 py-3";
  const collapsedClasses = "p-3 justify-center";
  
  const iconBaseClasses = "w-5 h-5";
  const iconExpandedClasses = "text-white";
  const iconCollapsedClasses = "text-white";
  
  const textClasses = isExpanded ? "ml-3 text-sm font-medium" : "hidden";

  return (
    <a 
      href={item.to || '#'} 
      onClick={onClick} 
      className={`${baseClasses} ${isExpanded ? expandedClasses : collapsedClasses} hover:bg-blue-700`}
    >
      <span className={`${iconBaseClasses} ${isExpanded ? iconExpandedClasses : iconCollapsedClasses}`}>
        {item.icon}
      </span>
      <span className={textClasses}>{item.title}</span>
    </a>
  );
};

interface NavBarProps {
  navItems?: NavItemData[];
  title?: string;
}

/**
 * Collapsible Navigation Bar Component
 * Renders a collapsible sidebar that works consistently across all screen sizes.
 */
const NavBar = ({ navItems = [], title = 'Navigation' }: NavBarProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex">
      {/* Collapsible sidebar */}
      <aside 
        className={`h-screen sticky top-0 bg-blue-600 text-white transition-all duration-300 ease-in-out ${
          expanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header section */}
          <div className="mb-6 px-2 py-4">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${expanded ? 'gap-3' : 'justify-center'}`}>
                <AnonymousIcon className={`text-white ${expanded ? 'w-12 h-12' : 'w-8 h-8'}`} />
                {expanded && (
                  <div className="relative inline-block">
                    <div className="font-bold text-xl md:text-2xl italic">{title}</div>
                    <CursiveUnderline className="absolute left-0 right-0 -bottom-1 w-full h-1.5 text-white" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => setExpanded(!expanded)} 
                aria-label={expanded ? "Collapse menu" : "Expand menu"} 
                className="p-2 rounded-full text-white hover:bg-blue-700"
              >
                {expanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Navigation items */}
          <nav className="flex-1 overflow-auto px-2 space-y-1">
            {navItems.map((it, idx) => (
              <NavItem 
                key={idx} 
                item={it} 
                onClick={it.onClick} 
                isExpanded={expanded} 
              />
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}; 

export default NavBar;
export { AnonymousIcon, CloseIcon, HomeIcon, MessageSquareIcon, SettingsIcon, MenuIcon, };
