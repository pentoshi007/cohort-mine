import { useState, useEffect, useRef } from 'react';

//useState-> store a variable and re-render the component when the variable changes
//useEffect-> run an effect after dependency changes
//useRef-> store a value that persists across re-renders without causing re-renders

//any custom hook should start with "use"

function useCounter() {
    // const [count, setCount] = useState(0);
    // return [count, setCount];
    const [count, setCount] = useState(0);
    const increment = () => {
        setCount(count + 1);
    }
    return [count, increment];
}

// Custom hook to track the previous value of any variable
// This is useful when you need to compare current value with previous value
function usePrev(value) {
    // useRef creates a mutable object that persists across re-renders
    // Unlike useState, changing ref.current does NOT trigger a re-render
    const ref = useRef();

    // useEffect runs AFTER the render is committed to the screen
    // So during the current render, ref.current still holds the OLD value
    // After render completes, we update ref.current to the NEW value
    useEffect(() => {
        ref.current = value;
    });

    // Return the previous value (which is still in ref.current during this render)
    return ref.current;
}

// Custom hook to debounce a value
// Debouncing delays updating the value until the user stops changing it for a specified time
// This is commonly used for search inputs to avoid making API calls on every keystroke
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function: clear the timeout if value changes before delay expires
        // This ensures only the last value (after user stops typing) gets set
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function usePostTitle(url) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchPosts() {
        setLoading(true);
        const response = await fetch(url);
        const data = await response.json();
        setPosts(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts();
    }, [url]);
    //whenever the url changes, the fetchPosts function will be called



    return [posts, loading];
}

function App() {
    return (
        <div>
            <Counter />
            <SearchWithDebounce />
            <Post />
        </div>
    );
}

function Counter() {
    const [count, increment] = useCounter();

    // usePrev hook tracks the previous value of count
    // On first render, prevCount will be undefined
    // On subsequent renders, prevCount will be the count from the previous render
    const prevCount = usePrev(count);

    return (
        <div>
            <h1>Counter: {count}</h1>
            <button onClick={increment}>Increment</button>
            {/* Display the previous count value */}
            <p>Previous count was: {prevCount !== undefined ? prevCount : 'N/A'}</p>
        </div>
    );
}

// Component demonstrating useDebounce hook
// This simulates a search input where we only want to perform the search
// after the user has stopped typing for 500ms
function SearchWithDebounce() {
    const [searchTerm, setSearchTerm] = useState('');
    // The debouncedSearchTerm will only update 500ms after the user stops typing
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // This effect runs only when debouncedSearchTerm changes
    // Not on every keystroke, but only after user stops typing for 500ms
    useEffect(() => {
        if (debouncedSearchTerm) {
            console.log('Searching for:', debouncedSearchTerm);
            // Here you would typically make an API call
            // fetch(`/api/search?q=${debouncedSearchTerm}`)
        }
    }, [debouncedSearchTerm]);

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
            <h2>Search with Debounce</h2>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                style={{ padding: '8px', width: '300px' }}
            />
            <div style={{ marginTop: '10px' }}>
                <p><strong>Current input:</strong> {searchTerm}</p>
                <p><strong>Debounced value (used for search):</strong> {debouncedSearchTerm}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                    Notice: The debounced value updates 500ms after you stop typing
                </p>
            </div>
        </div>
    );
}

function Post() {
    const [currentUrl, setCurrentUrl] = useState('https://jsonplaceholder.typicode.com/posts');
    const [posts, loading] = usePostTitle(currentUrl);

    return (
        <div>
            <h1>Posts</h1>
            <div>
                <button onClick={() => setCurrentUrl('https://jsonplaceholder.typicode.com/posts')}>
                    Posts
                </button>
                <button onClick={() => setCurrentUrl('https://jsonplaceholder.typicode.com/users')}>
                    Users
                </button>
                <button onClick={() => setCurrentUrl('https://jsonplaceholder.typicode.com/comments')}>
                    Comments
                </button>
            </div>
            {loading ? <div>Loading...</div> : null}
            {posts.map(post => (
                <div key={post.id}>
                    <h2>{post.title || post.name || post.email}</h2>
                </div>
            ))}
        </div>
    );
}


export default App;