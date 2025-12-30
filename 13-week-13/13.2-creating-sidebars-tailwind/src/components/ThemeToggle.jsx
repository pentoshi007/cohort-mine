/*
  ===========================================
  ThemeToggle.jsx - Dark Mode Toggle Component
  ===========================================
  
  This component provides 3 buttons to control the app's theme:
  - Device: Uses the user's system preference (light/dark)
  - Dark: Forces dark mode
  - Light: Forces light mode
  
  KEY CONCEPTS COVERED:
  1. useState - Managing the current theme state
  2. useEffect - Side effects for applying theme & detecting system preference
  3. localStorage - Persisting user's choice across page refreshes
  4. window.matchMedia - Detecting system color scheme preference
*/

import { useState, useEffect } from 'react';

/*
  ===========================================
  THEME OPTIONS
  ===========================================
  
  We define our theme options as constants.
  This prevents typos and makes the code easier to maintain.
*/
const THEMES = {
    DEVICE: 'device',  // Follow system preference
    DARK: 'dark',      // Always dark mode
    LIGHT: 'light',    // Always light mode
};

export function ThemeToggle() {
    /*
      ===========================================
      STATE: Current Theme
      ===========================================
      
      useState hook to track which theme is currently selected.
      
      We initialize it by checking localStorage first.
      If no saved preference, default to 'device' (system preference).
      
      The () => {} syntax is a "lazy initializer" - it only runs once
      on the first render, not on every re-render. This is more efficient
      when reading from localStorage.
    */
    const [theme, setTheme] = useState(() => {
        // Try to get saved theme from localStorage
        // localStorage.getItem returns null if key doesn't exist
        const savedTheme = localStorage.getItem('theme');

        // If we have a saved theme, use it; otherwise default to 'device'
        return savedTheme || THEMES.DEVICE;
    });

    /*
      ===========================================
      EFFECT: Apply Theme
      ===========================================
      
      useEffect runs AFTER the component renders.
      This effect runs whenever 'theme' changes.
      
      It handles:
      1. Saving the theme to localStorage
      2. Adding/removing the 'dark' class on <html>
      3. Setting up a listener for system preference changes (device mode)
    */
    useEffect(() => {
        // Step 1: Save the user's choice to localStorage
        // This persists the preference even after closing the browser
        localStorage.setItem('theme', theme);

        // Step 2: Get reference to the <html> element
        // We add/remove the 'dark' class here because Tailwind looks for it here
        const root = document.documentElement; // This is the <html> element

        // Step 3: Create a MediaQueryList to detect system preference
        // window.matchMedia returns an object that lets us check AND listen to media queries
        // 'prefers-color-scheme: dark' is true if user's OS is set to dark mode
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

        /*
          Function to apply the dark class based on current conditions.
          We extract this into a function because:
          - It's used both immediately AND when system preference changes
          - It avoids code duplication
        */
        const applyTheme = () => {
            // Determine if we should show dark mode
            let shouldBeDark = false;

            if (theme === THEMES.DARK) {
                // User explicitly chose dark mode
                shouldBeDark = true;
            } else if (theme === THEMES.LIGHT) {
                // User explicitly chose light mode
                shouldBeDark = false;
            } else if (theme === THEMES.DEVICE) {
                // User chose to follow system preference
                // Check what the system currently prefers
                shouldBeDark = systemPrefersDark.matches;
            }

            // Apply or remove the 'dark' class
            if (shouldBeDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        // Apply the theme immediately when this effect runs
        applyTheme();

        /*
          Step 4: Listen for system preference changes (only relevant in 'device' mode)
          
          If user has selected 'device' mode and then changes their OS from light to dark,
          we want our app to update automatically!
          
          addEventListener on a MediaQueryList fires when the match changes.
        */
        const handleSystemChange = (event) => {
            // Only react to system changes if we're in 'device' mode
            if (theme === THEMES.DEVICE) {
                if (event.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        // Add the listener
        systemPrefersDark.addEventListener('change', handleSystemChange);

        /*
          CLEANUP FUNCTION
          
          useEffect can return a cleanup function.
          This runs BEFORE the effect runs again, or when component unmounts.
          
          Why clean up? To prevent memory leaks and duplicate listeners.
          Without this, we'd add a new listener every time theme changes!
        */
        return () => {
            systemPrefersDark.removeEventListener('change', handleSystemChange);
        };
    }, [theme]); // Dependency array: this effect re-runs when 'theme' changes

    /*
      ===========================================
      RENDER: Theme Toggle Buttons
      ===========================================
      
      Three buttons that:
      - Show which theme is currently selected (highlighted)
      - Change the theme when clicked
    */
    return (
        <div className="flex flex-col gap-2">
            {/* Label for the toggle group */}
            <span className="text-text-secondary text-sm font-medium">
                Theme
            </span>

            {/* 
        Button group container
        - flex: arrange buttons horizontally
        - rounded-lg: round the outer corners
        - overflow-hidden: clip child elements to rounded corners
        - border: add a border around the group
      */}
            <div className="flex rounded-lg overflow-hidden border border-border theme-transition">
                {/* 
          Each button:
          - px-3 py-2: padding for comfortable clicking
          - text-sm: smaller text
          - transition-colors: smooth color change on hover/click
          - Conditional classes based on whether this button is selected
        */}

                {/* DEVICE BUTTON - Follow system preference */}
                <button
                    onClick={() => setTheme(THEMES.DEVICE)}
                    className={`
            px-3 py-2 text-sm transition-colors flex-1
            ${theme === THEMES.DEVICE
                            ? 'bg-primary text-white'  /* Selected state: blue background */
                            : 'bg-card-bg text-text-secondary hover:bg-sidebar-hover hover:text-white'  /* Unselected */
                        }
          `}
                >
                    {/* 
            SVG Icon: Computer/Monitor
            Represents "device" or "system" preference
          */}
                    <span className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Device
                    </span>
                </button>

                {/* DARK BUTTON - Force dark mode */}
                <button
                    onClick={() => setTheme(THEMES.DARK)}
                    className={`
            px-3 py-2 text-sm transition-colors flex-1 border-x border-border
            ${theme === THEMES.DARK
                            ? 'bg-primary text-white'
                            : 'bg-card-bg text-text-secondary hover:bg-sidebar-hover hover:text-white'
                        }
          `}
                >
                    {/* SVG Icon: Moon */}
                    <span className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark
                    </span>
                </button>

                {/* LIGHT BUTTON - Force light mode */}
                <button
                    onClick={() => setTheme(THEMES.LIGHT)}
                    className={`
            px-3 py-2 text-sm transition-colors flex-1
            ${theme === THEMES.LIGHT
                            ? 'bg-primary text-white'
                            : 'bg-card-bg text-text-secondary hover:bg-sidebar-hover hover:text-white'
                        }
          `}
                >
                    {/* SVG Icon: Sun */}
                    <span className="flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light
                    </span>
                </button>
            </div>
        </div>
    );
}
