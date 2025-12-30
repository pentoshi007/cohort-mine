/*
  ===========================================
  Sidebar.jsx - Collapsible Navigation Sidebar
  ===========================================
  
  KEY FEATURE: Expand on Hover
  - Default: Shows only icons (collapsed state)
  - On hover: Expands to show icons + text
  
  TAILWIND CONCEPTS:
  1. group & group-hover: Parent-child hover relationship
  2. transition-all: Smooth width animation
  3. overflow-hidden: Clips text when collapsed
  4. whitespace-nowrap: Prevents text from wrapping
*/

import { ThemeToggle } from './ThemeToggle';

/*
  Navigation items array - easy to add/remove items without changing JSX
*/
const navItems = [
    {
        name: 'Home',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        active: true
    },
    {
        name: 'Webinars',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        active: false
    },
    {
        name: 'Billing',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        active: false
    },
    {
        name: 'User Management',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        active: false
    },
    {
        name: 'Settings',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        active: false
    },
];

export function Sidebar() {
    /*
      ===========================================
      EXPAND ON HOVER TECHNIQUE
      ===========================================
      
      We use Tailwind's "group" pattern:
      1. Parent has "group" class
      2. Children use "group-hover:" to react when parent is hovered
      
      Width behavior:
      - Default: w-20 (80px) - just icons
      - On hover: w-64 (256px) - icons + text
      
      The text is always there but clipped with overflow-hidden.
      whitespace-nowrap prevents text from wrapping to next line.
    */
    return (
        <aside
            className="
        group                /* Makes this a hover target for children */
        h-screen             /* Full viewport height */
        bg-sidebar           /* Dark background from theme */
        text-white           /* White text */
        
        /* WIDTH: Expand on hover */
        w-20                 /* Collapsed: 80px (icons only) */
        hover:w-64           /* Expanded: 256px (icons + text) */
        
        /* TRANSITION */
        transition-all       /* Animate all changing properties */
        duration-300         /* 300ms animation */
        ease-in-out          /* Smooth acceleration/deceleration */
        
        /* CONTENT */
        overflow-hidden      /* Hide overflowing text when collapsed */
        
        /* LAYOUT */
        flex flex-col        /* Stack children vertically */
        
        /* POSITION */
        sticky top-0         /* Stays in place while scrolling */
        z-10                 /* Above main content */
      "
        >
            {/* 
        ===========================================
        LOGO AREA
        ===========================================
      */}
            <div className="p-4 border-b border-sidebar-hover flex items-center gap-3">
                {/* Logo icon - always visible */}
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Logo text - visible on hover */}
                <span className="
          font-bold text-lg text-secondary
          whitespace-nowrap   /* Prevent text wrapping */
          opacity-0           /* Hidden when collapsed */
          group-hover:opacity-100  /* Visible when sidebar is hovered */
          transition-opacity  /* Smooth fade in/out */
          duration-300
        ">
                    WebinarGo
                </span>
            </div>

            {/* 
        ===========================================
        NAVIGATION MENU
        ===========================================
      */}
            <nav className="flex-1 py-4">
                <ul className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <button
                                className={`
                  w-full flex items-center gap-3
                  px-3 py-3
                  rounded-lg
                  transition-colors
                  
                  ${item.active
                                        ? 'bg-sidebar-active text-white'
                                        : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                                    }
                `}
                            >
                                {/* Icon - always visible */}
                                {item.icon}

                                {/* Text - fades in on hover */}
                                <span className="
                  font-medium
                  whitespace-nowrap
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-300
                ">
                                    {item.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* 
        ===========================================
        THEME TOGGLE (Bottom)
        ===========================================
        
        Only visible when sidebar is expanded (hovered)
      */}
            <div className="
        p-4 border-t border-sidebar-hover
        opacity-0
        group-hover:opacity-100
        transition-opacity
        duration-300
      ">
                <ThemeToggle />
            </div>
        </aside>
    );
}
