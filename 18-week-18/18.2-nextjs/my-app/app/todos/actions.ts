// =============================================================================
// app/todos/actions.ts - SERVER ACTIONS
// =============================================================================
// Server Actions are functions that run ONLY on the server but can be called
// from Client Components. They're like API endpoints, but simpler!
//
// Key points:
// - "use server" directive marks these as server-only
// - Can be called from Client Components using form actions or direct calls
// - Automatically handle the request/response cycle
// - Can access databases, file systems, etc.
// - After mutation, call revalidatePath() to refresh the UI
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";

// =============================================================================
// IN-MEMORY DATABASE (for learning purposes)
// =============================================================================
// In a real app, you'd use a database like PostgreSQL, MongoDB, or Prisma.
// This in-memory array will reset when the server restarts.
// =============================================================================

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

// Our "database" - just an array in memory
let todos: Todo[] = [
  {
    id: "1",
    text: "Learn Next.js Server Components",
    completed: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    text: "Understand Server Actions",
    completed: false,
    createdAt: new Date(),
  },
  {
    id: "3",
    text: "Build something awesome!",
    completed: false,
    createdAt: new Date(),
  },
];

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * GET ALL TODOS
 * This is a simple read operation - could also be done directly in Server Component
 */
export async function getTodos(): Promise<Todo[]> {
  // Simulate network delay (remove in production)
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Return todos sorted by creation date (newest first)
  return [...todos].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * ADD A NEW TODO
 * Called from TodoForm component via form action
 */
export async function addTodo(formData: FormData): Promise<void> {
  const text = formData.get("text") as string;

  // Validation
  if (!text || text.trim().length === 0) {
    throw new Error("Todo text cannot be empty");
  }

  // Create new todo
  const newTodo: Todo = {
    id: Date.now().toString(), // Simple ID generation
    text: text.trim(),
    completed: false,
    createdAt: new Date(),
  };

  // Add to our "database"
  todos.push(newTodo);

  // IMPORTANT: Revalidate the path to refresh the UI
  // This tells Next.js to re-fetch data and re-render the page
  revalidatePath("/todos");
}

/**
 * TOGGLE TODO COMPLETION
 * Called from TodoItem component
 */
export async function toggleTodo(id: string): Promise<void> {
  const todo = todos.find((t) => t.id === id);
  
  if (todo) {
    todo.completed = !todo.completed;
  }

  // Refresh the UI
  revalidatePath("/todos");
}

/**
 * DELETE A TODO
 * Called from TodoItem component
 */
export async function deleteTodo(id: string): Promise<void> {
  todos = todos.filter((t) => t.id !== id);

  // Refresh the UI
  revalidatePath("/todos");
}

/**
 * CLEAR ALL COMPLETED TODOS
 * Bonus action to demonstrate more complex operations
 */
export async function clearCompleted(): Promise<void> {
  todos = todos.filter((t) => !t.completed);
  revalidatePath("/todos");
}
