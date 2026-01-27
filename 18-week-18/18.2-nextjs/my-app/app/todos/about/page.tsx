// =============================================================================
// app/todos/about/page.tsx - NESTED PAGE
// =============================================================================
// This page demonstrates how nested routing works.
//
// URL: /todos/about
//
// Layout nesting for this page:
// 1. app/layout.tsx (Root Layout)
//    2. app/todos/layout.tsx (Todos Layout - adds header/footer)
//       3. app/todos/about/page.tsx (This file - the content)
// =============================================================================

export default function AboutPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            📚 About This Todo App
          </h1>

          <div className="space-y-6 text-slate-600">
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Purpose
              </h2>
              <p>
                This is a learning project to understand Next.js App Router concepts:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Server Components vs Client Components</li>
                <li>Server Actions for data mutations</li>
                <li>Layouts and nested routing</li>
                <li>The new form handling with actions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                File Structure
              </h2>
              <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
{`app/todos/
├── layout.tsx      ← Shared layout (header, footer)
├── page.tsx        ← Main todo list (/todos)
├── actions.ts      ← Server Actions
├── TodoForm.tsx    ← Client Component
├── TodoItem.tsx    ← Client Component
├── about/
│   └── page.tsx    ← This page (/todos/about)
└── completed/
    └── page.tsx    ← Completed todos (/todos/completed)`}
              </pre>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Layout Persistence Demo
              </h2>
              <p>
                Notice how the header and footer stay the same when you navigate 
                between &quot;All Todos&quot;, &quot;Completed&quot;, and &quot;About&quot;? 
                That&apos;s because they&apos;re defined in the layout!
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Try this:</strong> Open your browser&apos;s DevTools → Network tab. 
                  Navigate between the todo pages. Notice that only the page content 
                  is fetched, not the entire layout!
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                Technologies Used
              </h2>
              <div className="flex flex-wrap gap-2">
                {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Server Actions"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-slate-100 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
