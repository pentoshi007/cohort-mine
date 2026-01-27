// =============================================================================
// app/todos/TodoItem.tsx - CLIENT COMPONENT
// =============================================================================
// This component needs "use client" because it:
// ✅ Uses useTransition for pending states
// ✅ Handles click events (toggle, delete)
// ✅ Shows different UI states based on user interaction
// =============================================================================

"use client";

import { useTransition } from "react";
import { toggleTodo, deleteTodo, type Todo } from "./actions";

// Props type - we receive a todo object from the parent Server Component
type TodoItemProps = {
  todo: Todo;
};

export function TodoItem({ todo }: TodoItemProps) {
  // Separate transitions for toggle and delete
  // This way we can show loading states for each action independently
  const [isToggling, startToggleTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  // Combined pending state for disabling interactions
  const isPending = isToggling || isDeleting;

  // Handle checkbox toggle
  const handleToggle = () => {
    startToggleTransition(async () => {
      await toggleTodo(todo.id);
    });
  };

  // Handle delete button
  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteTodo(todo.id);
    });
  };

  return (
    <div
      className={`
        group flex items-center gap-4 px-6 py-4 
        hover:bg-slate-50 transition-colors duration-200
        ${isPending ? "opacity-50" : ""}
        ${isDeleting ? "bg-red-50" : ""}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 disabled:cursor-not-allowed
          ${
            todo.completed
              ? "bg-green-500 border-green-500"
              : "border-slate-300 hover:border-green-400"
          }
        `}
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {todo.completed && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {isToggling && (
          <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
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
        )}
      </button>

      {/* Todo Text */}
      <span
        className={`
          flex-1 transition-all duration-200
          ${todo.completed ? "text-slate-400 line-through" : "text-slate-700"}
        `}
      >
        {todo.text}
      </span>

      {/* Delete Button - appears on hover */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className={`
          p-2 rounded-lg text-slate-400 
          hover:text-red-500 hover:bg-red-100
          opacity-0 group-hover:opacity-100
          transition-all duration-200 disabled:cursor-not-allowed
          ${isDeleting ? "opacity-100 text-red-500" : ""}
        `}
        aria-label="Delete todo"
      >
        {isDeleting ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
        ) : (
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
