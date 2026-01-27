// =============================================================================
// app/todos/completed/page.tsx - FILTERED VIEW PAGE
// =============================================================================
// This page shows only completed todos.
// It demonstrates:
// 1. How different pages can share the same layout
// 2. How to filter data in Server Components
// 3. Reusing components (TodoItem) across pages
//
// URL: /todos/completed
// =============================================================================

import { getTodos } from "../actions";
import { TodoItem } from "../TodoItem";

export default async function CompletedPage() {
  // Fetch all todos and filter on the server
  const allTodos = await getTodos();
  const completedTodos = allTodos.filter((todo) => todo.completed);

  return (
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-green-500 to-green-600">
            <h1 className="text-2xl font-bold text-white">
              ✅ Completed Todos
            </h1>
            <p className="text-green-100 text-sm mt-1">
              {completedTodos.length} task{completedTodos.length !== 1 ? "s" : ""} completed
            </p>
          </div>

          {/* Todo List */}
          <div className="divide-y divide-slate-100">
            {completedTodos.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-4xl mb-2">🎯</p>
                <p>No completed todos yet!</p>
                <p className="text-sm mt-2">
                  Complete some tasks to see them here.
                </p>
              </div>
            ) : (
              completedTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-sm text-slate-300">
          <h3 className="font-semibold text-white mb-2">📁 Same Layout, Different Page</h3>
          <p>
            This page uses the same layout as the main todos page. 
            Notice the header and footer are identical!
          </p>
          <p className="mt-2 text-slate-400">
            File: <code className="bg-slate-700 px-1 rounded">app/todos/completed/page.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
