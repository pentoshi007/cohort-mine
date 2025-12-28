// ============================================
// REACT BASICS - State and Components
// ============================================
// This file covers fundamental React concepts including:
// - Components (functional)
// - State management with useState
// - Side effects with useEffect
// - Props and component composition
// ============================================

// Import React hooks at the top of the file (single import statement)
import { useState, useEffect } from 'react';

// ============================================
// 1. COMPONENTS
// ============================================
// - Building blocks of React applications
// - Can be functional or class-based (functional is the modern approach)
// - Accept props (properties) as inputs
// - Return JSX (JavaScript XML) to describe UI

// Example of a functional component:
// This component receives 'name' as a prop and displays a greeting
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}

// ============================================
// 2. STATE
// ============================================
// - Internal data storage for components
// - When state changes, component re-renders automatically
// - Use useState hook in functional components
// - useState returns an array: [currentValue, setterFunction]

// Example with useState:
// A simple counter that increments when button is clicked
function Counter() {
    // Destructure the array returned by useState
    // count = current state value (initialized to 0)
    // setCount = function to update the state
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            {/* onClick handler calls setCount to update state */}
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}

// ============================================
// 3. KEY CONCEPTS
// ============================================
// - Props: Read-only data passed from parent to child component
// - State: Mutable data managed within the component itself
// - Re-rendering: Component updates when state/props change
// - Immutability: Always create new state objects, don't mutate existing ones

// ============================================
// 4. COMPONENT LIFECYCLE (with hooks)
// ============================================
// - useEffect: Handle side effects (API calls, subscriptions, DOM manipulation, etc.)
// - Runs after the component renders
// - Can specify dependencies array to control when it runs:
//   - [] empty array = run once on mount
//   - [dep1, dep2] = run when dependencies change
//   - no array = run on every render (avoid this usually)

// Example with useEffect:
function Example() {
    // State to store fetched data
    const [data, setData] = useState(null);

    useEffect(() => {
        // This is a side effect - runs after component mounts
        // Simulating an API call with a mock function
        const fetchData = async () => {
            // In real app, this would be: fetch('/api/data').then(res => res.json())
            return 'Fetched Data';
        };

        fetchData().then(result => setData(result));
    }, []); // Empty dependency array = run only once when component mounts

    return <div>{data}</div>;
}

// ============================================
// 5. BUTTON CLICK COUNTER - Component Composition
// ============================================
// Demonstrates how to create reusable components and pass props

// Reusable Button Component
// Uses destructuring to extract props: { count, onClick }
// This is cleaner than using props.count and props.onClick
function Button({ count, onClick }) {
    return (
        <button
            onClick={onClick}
            // Inline styles in React are passed as JavaScript objects
            // CSS properties use camelCase (backgroundColor instead of background-color)
            style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            count-{count}
        </button>
    );
}

// Counter Component using the Button component
// Demonstrates "lifting state up" - parent manages state, passes to child
function ButtonClickCounter() {
    // State is managed in parent component
    const [count, setCount] = useState(0);

    return (
        <div>
            {/* Pass state and handler as props to child component */}
            <Button count={count} onClick={() => setCount(count + 1)} />
        </div>
    );
}

// Default export - this component can be imported without curly braces
// import ButtonClickCounter from './9.1-react-basics'
export default ButtonClickCounter;

// ============================================
// 6. INDEX.JSX - Entry Point of React Application
// ============================================
// index.jsx (or main.jsx) - Entry Point of React Application
// This file is responsible for:
// 1. Importing React and ReactDOM
// 2. Selecting the root DOM element from index.html
// 3. Rendering the root component (App) into the DOM

// Example index.jsx structure:
/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Get the root element from HTML
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component into the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/

// How it works:
// - ReactDOM.createRoot() creates a root container for React to manage
// - document.getElementById('root') finds the <div id="root"></div> in index.html
// - root.render() mounts the React component tree starting with <App />
// - React.StrictMode is a wrapper that helps identify potential problems in development
// - All React components are rendered inside this root element 

// ============================================
// 7. TODO APP - Practical Example
// ============================================
// A complete example demonstrating:
// - Multiple state variables
// - Array state manipulation (add, update, delete)
// - Controlled inputs
// - List rendering with keys
// - Conditional rendering

function TodoApp() {
    // State for the list of todos (array of objects)
    const [todos, setTodos] = useState([]);
    // State for the input field (controlled component)
    const [inputValue, setInputValue] = useState('');

    // Add a new todo to the list
    const addTodo = () => {
        // Only add if input is not empty (after trimming whitespace)
        if (inputValue.trim() !== '') {
            // Use spread operator to create new array (immutability)
            // Date.now() generates unique ID based on timestamp
            setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
            // Clear the input field after adding
            setInputValue('');
        }
    };

    // Toggle the completed status of a todo
    const toggleTodo = (id) => {
        // Map creates a new array - we find the matching todo and toggle its completed status
        // Spread operator creates a new object with updated property
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    // Delete a todo from the list
    const deleteTodo = (id) => {
        // Filter creates a new array excluding the todo with matching id
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div>
            <h1>Todo App</h1>
            <div>
                {/* Controlled input - value is controlled by React state */}
                <input
                    type="text"
                    value={inputValue}
                    // Update state on every keystroke
                    onChange={(e) => setInputValue(e.target.value)}
                    // Allow adding todo by pressing Enter key
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="Enter a todo..."
                />
                <button onClick={addTodo}>
                    Add
                </button>
            </div>
            <ul>
                {/* Map over todos array to render each item */}
                {/* key prop is required for list items - helps React track changes efficiently */}
                {todos.map(todo => (
                    <li key={todo.id}>
                        <span onClick={() => toggleTodo(todo.id)}>
                            {/* Conditional rendering: show strikethrough if completed */}
                            {todo.completed ? <s>{todo.text}</s> : todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Named export - can be imported with curly braces
// import { TodoApp } from './9.1-react-basics'
export { TodoApp, Welcome, Counter, Example };