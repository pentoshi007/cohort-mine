// =============================================================================
// app/todos/TodoForm.tsx - CLIENT COMPONENT
// =============================================================================
// This component needs "use client" because it:
// ✅ Uses useState for managing input state
// ✅ Uses useRef for form reference
// ✅ Uses useTransition for pending states
// ✅ Handles user interactions (form submission)
//
// Client Components:
// - Run in the browser (and also pre-render on server for initial HTML)
// - Can use React hooks (useState, useEffect, useRef, etc.)
// - Can handle user interactions (onClick, onChange, onSubmit)
// - Are shipped to the browser as JavaScript
// =============================================================================

"use client";

import { useRef, useState, useTransition } from "react";
import { addTodo } from "./actions";

export function TodoForm() {
  // useRef to access the form element (for resetting after submit)
  const formRef = useRef<HTMLFormElement>(null);
  
  // useTransition gives us a pending state while the server action runs
  // This is great for showing loading states!
  const [isPending, startTransition] = useTransition();
  
  // State for error message
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    // Clear any previous error
    setError(null);
    
    // Client-side validation - prevent empty submissions
    const text = formData.get("text") as string;
    if (!text || text.trim().length === 0) {
      setError("Please enter a todo item");
      return; // Don't submit empty todos
    }
    
    // startTransition marks this update as non-urgent
    // isPending will be true while the action is running
    startTransition(async () => {
      try {
        await addTodo(formData);
        formRef.current?.reset(); // Clear the input after adding
      } catch (err) {
        // Handle server-side errors
        setError(err instanceof Error ? err.message : "Failed to add todo");
      }
    });
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
      {/* 
        Using form with action={handleSubmit}
        This is the new Next.js way to handle forms with Server Actions
      */}
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="text"
          placeholder="What needs to be done?"
          disabled={isPending}
          required
          className={`flex-1 px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-300 
                     text-slate-800 placeholder-slate-400 disabled:opacity-50
                     transition-all duration-200 ${
                       error ? "border-red-300 bg-red-50" : "border-transparent"
                     }`}
          autoComplete="off"
          onChange={() => error && setError(null)} // Clear error when typing
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg
                     hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 flex items-center gap-2"
        >
          {isPending ? (
            <>
              {/* Loading spinner */}
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Adding...
            </>
          ) : (
            "Add"
          )}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-red-200 bg-red-500/20 px-3 py-1 rounded">
          ⚠️ {error}
        </p>
      )}

      {/* Helper text */}
      {!error && (
        <p className="mt-2 text-xs text-blue-100">
          Press Enter or click Add to create a new todo
        </p>
      )}
    </div>
  );
}
