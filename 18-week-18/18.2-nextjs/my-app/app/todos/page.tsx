// =============================================================================
// app/todos/page.tsx - SERVER COMPONENT (default in App Router)
// =============================================================================
// This file runs ONLY on the server. It can:
// ✅ Directly access databases, file systems, environment variables
// ✅ Use async/await at the component level
// ✅ Keep sensitive data secure (never sent to browser)
// ❌ Cannot use useState, useEffect, onClick, or any interactivity
// =============================================================================

import { getTodos } from "./actions";
import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

// This is a Server Component - notice it's an async function!
export default async function TodosPage() {
  // We can fetch data directly in the component (no useEffect needed!)
  const todos = await getTodos();

  return (
    // Note: The outer container and background are now in layout.tsx!
    // This page only contains the content specific to this route.
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📝 All Todos
          </h1>
          <p className="text-slate-400 text-sm">
            Learning Server Components, Client Components & Server Actions
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 
            TodoForm is a CLIENT COMPONENT (has "use client" directive)
            We import and use it here in a Server Component - this is called
            "composing" Server and Client Components together.
          */}
          <TodoForm />

          {/* Todo List */}
          <div className="divide-y divide-slate-100">
            {todos.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-4xl mb-2">🎉</p>
                <p>No todos yet! Add one above.</p>
              </div>
            ) : (
              todos.map((todo) => (
                // TodoItem is also a CLIENT COMPONENT (needs onClick handlers)
                <TodoItem key={todo.id} todo={todo} />
              ))
            )}
          </div>

          {/* Footer Stats - Server rendered */}
          <div className="bg-slate-50 px-6 py-4 flex justify-between text-sm text-slate-500">
            <span>{todos.filter((t) => !t.completed).length} remaining</span>
            <span>{todos.filter((t) => t.completed).length} completed</span>
          </div>
        </div>

        {/* Learning Notes */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300">
          <h3 className="font-semibold text-white mb-2">🎓 What&apos;s happening here:</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>This page</strong> is a Server Component (async function)</li>
            <li><strong>TodoForm</strong> is a Client Component (&quot;use client&quot;)</li>
            <li><strong>TodoItem</strong> is a Client Component (needs onClick)</li>
            <li><strong>actions.ts</strong> contains Server Actions (&quot;use server&quot;)</li>
            <li><strong>layout.tsx</strong> provides the header, footer & background</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
