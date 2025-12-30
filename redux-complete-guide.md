# Redux Complete Guide for React

A step-by-step guide to understand and implement Redux in React applications.

---

## Table of Contents

1. [What is Redux?](#what-is-redux)
2. [Core Concepts](#core-concepts)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Step-by-Step Setup](#step-by-step-setup)
6. [Complete Example: Todo App](#complete-example-todo-app)
7. [Async Operations](#async-operations)
8. [Quick Reference](#quick-reference)

---

## What is Redux?

Redux is a **predictable state container** for JavaScript apps. Think of it as a central place (store) where all your app's data lives, making it accessible from any component.

**Why Redux?**
- Single source of truth (one store for all state)
- State is read-only (can only change via actions)
- Changes made with pure functions (reducers)

---

## Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                         REDUX FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Component ──dispatch(action)──> Reducer ──> Store         │
│       ▲                                          │          │
│       │                                          │          │
│       └──────────useSelector(state)──────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Concept | What it is | Analogy |
|---------|-----------|---------|
| **Store** | Central state container | A database for your frontend |
| **Action** | An object describing what happened | A message/event |
| **Reducer** | Function that updates state based on action | Event handler |
| **Dispatch** | Function to send actions to store | Sending a message |
| **Selector** | Function to read data from store | Database query |
| **Slice** | Bundle of reducer + actions for one feature | A module |

---

## Installation

```bash
# Create React app (if starting fresh)
npx create-react-app my-app
cd my-app

# Install Redux Toolkit and React-Redux
npm install @reduxjs/toolkit react-redux
```

**What we installed:**
- `@reduxjs/toolkit` - Modern Redux with less boilerplate
- `react-redux` - Connects Redux to React components

---

## Project Structure

```
src/
├── app/
│   └── store.js          # Redux store configuration
├── features/
│   ├── counter/
│   │   └── counterSlice.js   # Counter state logic
│   └── todos/
│       └── todosSlice.js     # Todos state logic
├── App.js
└── index.js
```

---

## Step-by-Step Setup

### Step 1: Create a Slice

A **slice** contains the reducer logic and actions for a single feature.

```javascript
// src/features/counter/counterSlice.js

import { createSlice } from '@reduxjs/toolkit';

// Initial state for this slice
const initialState = {
  value: 0,
};

// Create the slice
const counterSlice = createSlice({
  name: 'counter',           // Name used in action types
  initialState,              // Starting state
  reducers: {
    // Each function here becomes an action creator

    increment: (state) => {
      // Redux Toolkit uses Immer, so we can "mutate" state directly
      // (it's actually creating a new state behind the scenes)
      state.value += 1;
    },

    decrement: (state) => {
      state.value -= 1;
    },

    // Action with payload (data passed with action)
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },

    reset: (state) => {
      state.value = 0;
    },
  },
});

// Export actions (to use in components with dispatch)
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Export reducer (to add to store)
export default counterSlice.reducer;
```

**Key Points:**
- `createSlice` automatically creates action creators
- `state` can be "mutated" directly (Immer handles immutability)
- `action.payload` contains any data passed to the action

---

### Step 2: Configure the Store

The **store** holds all your app's state and combines all reducers.

```javascript
// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

// Create and configure the store
const store = configureStore({
  reducer: {
    // Add reducers here
    // The key name defines how you access this state
    counter: counterReducer,
    // Add more reducers as your app grows:
    // todos: todosReducer,
    // user: userReducer,
  },
});

export default store;
```

**Key Points:**
- `configureStore` sets up Redux DevTools automatically
- Each reducer is added with a key (e.g., `counter`)
- Access state via: `state.counter.value`

---

### Step 3: Provide Store to React

Wrap your app with `Provider` to make the store available everywhere.

```javascript
// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './app/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Provider makes Redux store available to all components */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

**Key Points:**
- `Provider` wraps the entire app
- Pass the `store` as a prop
- All child components can now access Redux

---

### Step 4: Use Redux in Components

Use `useSelector` to read state and `useDispatch` to update it.

```javascript
// src/features/counter/Counter.js

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  increment,
  decrement,
  incrementByAmount,
  reset
} from './counterSlice';

function Counter() {
  // useSelector: Read data from Redux store
  // state.counter refers to the 'counter' key in store's reducer
  const count = useSelector((state) => state.counter.value);

  // useDispatch: Get the dispatch function
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Count: {count}</h1>

      {/* Dispatch actions on button clicks */}
      <button onClick={() => dispatch(increment())}>
        + Increment
      </button>

      <button onClick={() => dispatch(decrement())}>
        - Decrement
      </button>

      {/* Dispatch action with payload */}
      <button onClick={() => dispatch(incrementByAmount(5))}>
        + Add 5
      </button>

      <button onClick={() => dispatch(reset())}>
        Reset
      </button>
    </div>
  );
}

export default Counter;
```

**Key Points:**
- `useSelector((state) => state.sliceName.property)` - reads state
- `useDispatch()` - returns dispatch function
- `dispatch(actionCreator())` - triggers state update

---

## Complete Example: Todo App

A practical example showing CRUD operations with Redux.

### File 1: Todo Slice

```javascript
// src/features/todos/todosSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  filter: 'all', // 'all', 'active', 'completed'
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Add a new todo
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      });
    },

    // Toggle todo completion
    toggleTodo: (state, action) => {
      const todo = state.items.find((item) => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    // Delete a todo
    deleteTodo: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Edit todo text
    editTodo: (state, action) => {
      const { id, text } = action.payload;
      const todo = state.items.find((item) => item.id === id);
      if (todo) {
        todo.text = text;
      }
    },

    // Set filter
    setFilter: (state, action) => {
      state.filter = action.payload;
    },

    // Clear all completed
    clearCompleted: (state) => {
      state.items = state.items.filter((item) => !item.completed);
    },
  },
});

// Export actions
export const {
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  setFilter,
  clearCompleted
} = todosSlice.actions;

// Selectors (functions to get specific data from state)
export const selectAllTodos = (state) => state.todos.items;
export const selectFilter = (state) => state.todos.filter;
export const selectFilteredTodos = (state) => {
  const { items, filter } = state.todos;
  switch (filter) {
    case 'active':
      return items.filter((todo) => !todo.completed);
    case 'completed':
      return items.filter((todo) => todo.completed);
    default:
      return items;
  }
};

// Export reducer
export default todosSlice.reducer;
```

---

### File 2: Updated Store

```javascript
// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import todosReducer from '../features/todos/todosSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

export default store;
```

---

### File 3: Todo Component

```javascript
// src/features/todos/TodoList.js

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  setFilter,
  clearCompleted,
  selectFilteredTodos,
  selectFilter,
} from './todosSlice';

function TodoList() {
  const [inputText, setInputText] = useState('');

  // Get filtered todos using selector
  const todos = useSelector(selectFilteredTodos);
  const currentFilter = useSelector(selectFilter);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      dispatch(addTodo(inputText.trim()));
      setInputText('');
    }
  };

  return (
    <div className="todo-app">
      <h1>Todo List</h1>

      {/* Add Todo Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      {/* Filter Buttons */}
      <div className="filters">
        {['all', 'active', 'completed'].map((filter) => (
          <button
            key={filter}
            onClick={() => dispatch(setFilter(filter))}
            style={{
              fontWeight: currentFilter === filter ? 'bold' : 'normal'
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
        <button onClick={() => dispatch(clearCompleted())}>
          Clear Completed
        </button>
      </div>

      {/* Todo List */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>No todos to display</p>}
    </div>
  );
}

export default TodoList;
```

---

## Async Operations

For API calls, use `createAsyncThunk`.

```javascript
// src/features/posts/postsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',  // Action type prefix
  async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    return response.json();
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  // Handle async actions
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default postsSlice.reducer;
```

**Using in Component:**

```javascript
// src/features/posts/PostsList.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from './postsSlice';

function PostsList() {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.items);
  const status = useSelector((state) => state.posts.status);
  const error = useSelector((state) => state.posts.error);

  // Fetch posts when component mounts
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Posts</h1>
      {posts.slice(0, 10).map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </article>
      ))}
    </div>
  );
}

export default PostsList;
```

---

## Quick Reference

### Cheat Sheet

```javascript
// 1. CREATE SLICE
import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({
  name: 'featureName',
  initialState: { value: 0 },
  reducers: {
    actionName: (state, action) => { state.value = action.payload; }
  }
});
export const { actionName } = slice.actions;
export default slice.reducer;

// 2. CONFIGURE STORE
import { configureStore } from '@reduxjs/toolkit';
const store = configureStore({
  reducer: { featureName: featureReducer }
});

// 3. PROVIDE STORE
<Provider store={store}><App /></Provider>

// 4. USE IN COMPONENT
const value = useSelector(state => state.featureName.value);
const dispatch = useDispatch();
dispatch(actionName(payload));
```

### Common Patterns

| Task | Code |
|------|------|
| Read state | `useSelector(state => state.slice.value)` |
| Dispatch action | `dispatch(actionName())` |
| Dispatch with data | `dispatch(actionName(payload))` |
| Multiple values | `const { a, b } = action.payload` |
| Find in array | `state.items.find(x => x.id === action.payload)` |
| Filter array | `state.items = state.items.filter(x => x.id !== id)` |
| Update in array | `const item = state.items.find(...); item.value = x;` |

### Files You Create

| File | Purpose |
|------|---------|
| `store.js` | Combines all reducers, creates store |
| `*Slice.js` | State + actions + reducer for one feature |
| `index.js` | Wraps app with Provider |

---

## Debugging Tips

1. **Install Redux DevTools** browser extension
2. **Check state** in DevTools after each action
3. **Console log** in reducers to see what's happening
4. **Make sure** Provider wraps your App component
5. **Verify** slice is added to store's reducer object

---

## Summary

```
1. npm install @reduxjs/toolkit react-redux
2. Create slice (state + reducers + actions)
3. Create store (combine reducers)
4. Wrap app with Provider
5. useSelector to read, useDispatch to update
```

That's it! Redux is just a central state with a structured way to update it.
