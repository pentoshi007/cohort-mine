// Importing ReactDOM for rendering the React app to the DOM
import ReactDOM from "react-dom/client";

// Importing routing components from react-router-dom
// BrowserRouter: Provides routing context for the app
// Routes: Container for all Route components
// Route: Defines individual routes and their corresponding components
// Link: Component for navigation that prevents page reload (replaces <a> tags)
// useNavigate: Hook for programmatic navigation (useful for redirects after actions)
// Outlet: A placeholder component that renders child routes within a parent route
//         This allows for nested routing and shared layouts
import { BrowserRouter, Routes, Route, Link, useNavigate, Outlet } from "react-router-dom";

// Importing React hooks
// useRef: Creates a mutable reference that persists across re-renders
//         - Doesn't trigger re-renders when changed (unlike useState)
//         - Used for storing values that don't need to trigger UI updates
//         - Used for accessing DOM elements directly
// useState: For managing state that triggers re-renders
import { useRef, useState } from "react";

// Importing page components
import Home from "./pages/Home";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";

// Layout Component: Provides a consistent structure across all pages
// The Outlet component acts as a placeholder where child route components will be rendered
// This pattern allows you to:
// 1. Share common UI elements (nav, footer) across multiple pages
// 2. Avoid code duplication
// 3. Maintain consistent styling and structure
function Layout() {
    return (
        <div>
            {/* Navigation Section - appears on all pages */}
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/blogs">Blogs</Link>
                    </li>
                    <li>
                        <Link to="/contact">Contact</Link>
                    </li>
                </ul>
            </nav>

            {/* Content Section - where child routes are rendered */}
            {/* Outlet is the key component that renders the matched child route */}
            {/* When you navigate to "/blogs", the Blogs component renders here */}
            {/* When you navigate to "/contact", the Contact component renders here */}
            <main>
                <Outlet />
            </main>

            {/* Footer Section - appears on all pages */}
            <footer>
                <p>© 2024 My SPA Application</p>
            </footer>
        </div>
    );
}

// useNavigate hook for programmatic navigation
// Useful for navigation after form submissions, button clicks, or conditional logic
function NavigateExample() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/'); // Navigate to specific path
    };

    const handleGoBack = () => {
        navigate(-1); // Go back in history (like browser back button)
    };

    const handleGoForward = () => {
        navigate(1); // Go forward in history
    };

    const handleReplaceNavigation = () => {
        // Replace current history entry (useful after login/form submission)
        navigate('/blogs', { replace: true });
    };

    const handleNavigateWithState = () => {
        // Pass data to next route (accessible via useLocation hook)
        navigate('/contact', { state: { from: 'navigate-example', message: 'Hello from useNavigate!' } });
    };

    const handleConditionalNavigation = () => {
        const isLoggedIn = true; // Example auth check
        if (isLoggedIn) {
            navigate('/blogs');
        } else {
            navigate('/login');
        }
    };

    return (
        <div>
            <h3>useNavigate Hook Examples:</h3>
            <p>Programmatic navigation without Link components</p>

            <button onClick={handleGoHome}>
                Go to Home (navigate('/'))
            </button>

            <button onClick={handleGoBack}>
                Go Back (navigate(-1))
            </button>

            <button onClick={handleGoForward}>
                Go Forward (navigate(1))
            </button>

            <button onClick={handleReplaceNavigation}>
                Replace with Blogs (navigate('/blogs', {'{'}replace: true{'}'}))
            </button>

            <button onClick={handleNavigateWithState}>
                Navigate with State (navigate('/contact', {'{'}state: {'{'} ... {'}'}{'}'})
            </button>

            <button onClick={handleConditionalNavigation}>
                Conditional Navigation (if/else logic)
            </button>
        </div>
    );
}

// useRef Example 1: Storing Values (Timer Counter)
// useRef is perfect for storing values that:
// 1. Need to persist across re-renders
// 2. Don't need to trigger re-renders when changed
// 3. Need to be accessed in async operations (like setInterval)
function TimerExample() {
    // useState for the counter display (triggers re-render to update UI)
    const [count, setCount] = useState(0);

    // useRef to store the interval ID
    // Why useRef instead of useState?
    // - We don't need to re-render when intervalId changes
    // - We need to access the same interval ID to clear it later
    // - intervalId.current persists across re-renders
    const intervalId = useRef(null);

    const startTimer = () => {
        // Only start if timer isn't already running
        if (intervalId.current !== null) return;

        // Store the interval ID in the ref
        // .current is how you access/modify the ref's value
        intervalId.current = setInterval(() => {
            setCount(prevCount => prevCount + 1);
        }, 1000);
    };

    const stopTimer = () => {
        // Clear the interval using the stored ID
        if (intervalId.current !== null) {
            clearInterval(intervalId.current);
            intervalId.current = null; // Reset the ref
        }
    };

    const resetTimer = () => {
        stopTimer();
        setCount(0);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px 0' }}>
            <h3>useRef Example 1: Timer Counter (Value Storage)</h3>
            <p>Counter: {count} seconds</p>
            <p>
                <strong>Key Concept:</strong> intervalId is stored in useRef because:
                <br />• It doesn't need to trigger re-renders
                <br />• It needs to persist across re-renders
                <br />• We need the same reference to clear the interval
            </p>
            <button onClick={startTimer}>Start Timer</button>
            <button onClick={stopTimer}>Stop Timer</button>
            <button onClick={resetTimer}>Reset Timer</button>
        </div>
    );
}

// useRef Example 2: DOM Element Reference
// useRef is commonly used to access DOM elements directly
// This is useful for:
// 1. Focus management
// 2. Measuring element dimensions
// 3. Integrating with third-party DOM libraries
// 4. Triggering animations
function FormExample() {
    // Create refs for DOM elements
    // Initially, inputRef.current is null
    // After render, React assigns the actual DOM element to inputRef.current
    const inputRef = useRef(null);
    const emailRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Access the DOM element directly via .current
        // This is equivalent to document.querySelector() but React-friendly
        const nameValue = inputRef.current.value;
        const emailValue = emailRef.current.value;

        if (!nameValue) {
            // Focus on the first input if empty
            // .focus() is a native DOM method
            inputRef.current.focus();
            alert('Please enter your name');
            return;
        }

        if (!emailValue) {
            // Focus on email input if empty
            emailRef.current.focus();
            alert('Please enter your email');
            return;
        }

        alert(`Form submitted!\nName: ${nameValue}\nEmail: ${emailValue}`);
    };

    const focusNameInput = () => {
        // Programmatically focus the input
        inputRef.current.focus();
    };

    const focusEmailInput = () => {
        emailRef.current.focus();
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px 0' }}>
            <h3>useRef Example 2: DOM Element Reference</h3>
            <p>
                <strong>Key Concept:</strong> useRef can store references to DOM elements:
                <br />• Attach ref to element using ref={'{'}refName{'}'}
                <br />• Access DOM element via refName.current
                <br />• Call native DOM methods like .focus(), .scrollIntoView(), etc.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Name:
                        {/* Attach the ref to the input element */}
                        {/* After render, inputRef.current will point to this input */}
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter your name"
                            style={{ marginLeft: '10px' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Email:
                        {/* Attach the ref to the email input */}
                        <input
                            ref={emailRef}
                            type="email"
                            placeholder="Enter your email"
                            style={{ marginLeft: '10px' }}
                        />
                    </label>
                </div>

                <button type="submit">Submit (focuses on empty field)</button>
            </form>

            <div style={{ marginTop: '10px' }}>
                <button onClick={focusNameInput}>Focus Name Input</button>
                <button onClick={focusEmailInput}>Focus Email Input</button>
            </div>
        </div>
    );
}

// Main App component that sets up routing with nested routes
// Nested Routing Pattern:
// - Layout is the parent route that wraps all other routes
// - Child routes (Home, Blogs, Contact) are rendered inside Layout's <Outlet />
// - This creates a consistent structure: Nav -> Content (changes) -> Footer
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Parent Route: Layout component wraps all child routes */}
                {/* Parent Route: Layout component wraps all child routes 
                    Note: If you change path="/" to something else like path="/app",
                    all child routes will be relative to that path:
                    - "/" would become "/app"
                    - "/blogs" would become "/app/blogs"
                    - "/contact" would become "/app/contact"
                */}
                <Route path="/" element={<Layout />}>
                    {/* Child Routes: These render inside Layout's <Outlet /> component */}

                    {/* index route - renders at "/" */}
                    <Route index element={
                        <>
                            <NavigateExample />
                            <TimerExample />
                            <FormExample />
                            <Home />
                        </>
                    } />

                    {/* Route for blogs page - accessible at /blogs */}
                    <Route path="blogs" element={<Blogs />} />

                    {/* Route for contact page - accessible at /contact */}
                    <Route path="contact" element={<Contact />} />

                    {/* Catch-all route for 404 */}
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

// Creating root element and rendering the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
