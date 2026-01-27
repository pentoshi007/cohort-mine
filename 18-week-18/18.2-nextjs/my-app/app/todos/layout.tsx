// =============================================================================
// app/todos/layout.tsx - NESTED LAYOUT
// =============================================================================
// This layout ONLY wraps pages inside the /todos route.
// It will be nested INSIDE the root layout (app/layout.tsx).
//
// Layout Nesting Order:
// 1. app/layout.tsx (Root - has <html>, <body>)
//    2. app/todos/layout.tsx (This file - has todo-specific UI)
//       3. app/todos/page.tsx (The actual page content)
//
// Key Benefits:
// - This layout persists when navigating between /todos sub-pages
// - State is preserved (e.g., if you had a search filter)
// - Only the {children} part re-renders on navigation
// =============================================================================

import Link from "next/link";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* 
        This header will appear on ALL /todos/* pages
        It won't re-render when navigating between todo sub-pages
      */}
      <header className="border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo/Home Link */}
          <Link 
            href="/" 
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Home
          </Link>

          {/* Navigation within todos section */}
          <nav className="flex items-center gap-4">
            <Link
              href="/todos"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              All Todos
            </Link>
            <Link
              href="/todos/completed"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Completed
            </Link>
            <Link
              href="/todos/about"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* 
        {children} is where the page content gets injected
        
        When you visit /todos → children = app/todos/page.tsx
        When you visit /todos/completed → children = app/todos/completed/page.tsx
        When you visit /todos/about → children = app/todos/about/page.tsx
      */}
      <main>
        {children}
      </main>

      {/* Footer - also persists across all /todos/* pages */}
      <footer className="border-t border-slate-700 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>
            This layout (<code className="bg-slate-800 px-1 rounded">app/todos/layout.tsx</code>) 
            wraps all pages in the <code className="bg-slate-800 px-1 rounded">/todos</code> route.
          </p>
          <p className="mt-2">
            The header and footer persist when navigating between todo pages!
          </p>
        </div>
      </footer>
    </div>
  );
}
