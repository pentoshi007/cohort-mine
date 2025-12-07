import { useState, useEffect, Component } from 'react'
import './App.css'

// Error Boundary: A special React component that catches JavaScript errors in child components
// Error boundaries catch errors during:
// 1. Rendering
// 2. In lifecycle methods
// 3. In constructors of the whole tree below them
// 
// Error boundaries DO NOT catch errors in:
// 1. Event handlers (use try-catch for those)
// 2. Asynchronous code (setTimeout, promises)
// 3. Server-side rendering
// 4. Errors thrown in the error boundary itself
//
// Note: Error boundaries must be class components (not functional components)
// They use special lifecycle methods: componentDidCatch() and getDerivedStateFromError()
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // getDerivedStateFromError: Updates state so next render shows fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // componentDidCatch: Logs error information
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error: error });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div style={{
          padding: 20,
          backgroundColor: '#ffebee',
          borderRadius: 10,
          border: '2px solid #f44336',
          maxWidth: 400,
          margin: '50px auto'
        }}>
          <h2 style={{ color: '#d32f2f', margin: 0 }}>⚠️ Something went wrong</h2>
          <p style={{ color: '#666', marginTop: 10 }}>
            Please refresh the page or try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 15,
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component that might throw an error (for demonstration)
function BuggyComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Intentional error for demonstration!');
  }
  return <div style={{ color: 'green' }}>✓ Component OK</div>;
}

function App() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      name: 'Aniket',
      followers: '23k',
      time: '12m',
      image: 'https://picsum.photos/200/300',
      content: 'Want to win big?'
    },
    {
      id: 2,
      name: 'John Doe',
      followers: '15k',
      time: '5m',
      image: 'https://picsum.photos/200/301',
      content: 'Check out this amazing post!'
    }
  ]);

  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [simulateError, setSimulateError] = useState(false);

  // useEffect handles side effects (operations that affect things outside the component)
  // Side effects include: timers, API calls, subscriptions, DOM manipulation, etc.
  // Without useEffect, setting up setInterval directly in the component body would:
  // 1. Create a new interval on every render (memory leak)
  // 2. Never clean up old intervals
  // useEffect fixes this by:
  // 1. Running the effect only when dependencies change (or once if empty array)
  // 2. Providing a cleanup function to remove side effects when component unmounts

  // Example 1: Empty dependency array [] - runs once on mount
  useEffect(() => {
    console.log('Component mounted - this runs only once');
    // Set up an interval that increments notification count every second
    const intervalId = setInterval(() => {
      setNotificationCount(prevCount => prevCount + 1);
    }, 3000);

    // Cleanup function: clear the interval when component unmounts
    return () => {
      console.log('Component unmounting - cleaning up interval');
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Example 2: With dependencies [selectedPostId] - runs when selectedPostId changes
  useEffect(() => {
    if (selectedPostId !== null) {
      console.log(`Selected post changed to: ${selectedPostId}`);
      // You could fetch post details, update analytics, etc.
    }
  }, [selectedPostId]); // Runs whenever selectedPostId changes

  // Example 3: With multiple dependencies [posts, notificationCount] - runs when either changes
  useEffect(() => {
    console.log(`Posts count: ${posts.length}, Notifications: ${notificationCount}`);
    // This runs whenever posts array or notificationCount changes
  }, [posts, notificationCount]); // Runs when posts OR notificationCount changes

  // Example 4: No dependency array - runs after EVERY render (usually not recommended)
  // useEffect(() => {
  //   console.log('This runs after every render - can cause performance issues!');
  // }); // No dependency array = runs on every render

  // New useEffect: Runs when activeTab changes - simulates backend request
  useEffect(() => {
    console.log(`Fetching data for tab: ${activeTab}`);
    // Simulate backend API call
    // In real app, you would do: fetch(`/api/${activeTab}`)
    // For now, just logging to console
  }, [activeTab]); // Runs whenever activeTab changes

  const addPost = () => {
    const newPost = {
      id: Date.now(),
      name: 'User ' + (posts.length + 1),
      followers: Math.floor(Math.random() * 50) + 'k',
      time: Math.floor(Math.random() * 60) + 'm',
      image: `https://picsum.photos/200/${300 + posts.length}`,
      content: 'This is a new post #' + (posts.length + 1)
    };
    setPosts([...posts, newPost]);
  };

  const tabs = ['feed', 'notification', 'messages', 'jobs'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: 20
    }}>
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 20,
        fontWeight: 'bold',
        fontSize: 18,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        🔔 Notifications: {notificationCount}
      </div>

      {/* Example of children prop: Card component wraps content */}
      <Card>
        <h2 style={{ margin: 0, color: '#333' }}>Welcome to the Feed!</h2>
        <p style={{ margin: '10px 0', color: '#666' }}>This content is passed as children to the Card component</p>
      </Card>

      {/* Error Boundary Demo Section */}
      <Card>
        <h3 style={{ margin: 0, color: '#333' }}>Error Boundary Demo</h3>
        <p style={{ margin: '10px 0', color: '#666', fontSize: 14 }}>
          Click to simulate an error. Error Boundary will catch it.
        </p>
        <button
          onClick={() => setSimulateError(!simulateError)}
          style={{
            padding: '8px 16px',
            backgroundColor: simulateError ? '#f44336' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer'
          }}
        >
          {simulateError ? 'Stop Error' : 'Trigger Error'}
        </button>

        {/* Wrapping potentially buggy component in Error Boundary */}
        <div style={{ marginTop: 10, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 5 }}>
          <ErrorBoundary>
            <BuggyComponent shouldThrow={simulateError} />
          </ErrorBoundary>
        </div>
      </Card>

      {/* Rendering lists in React: Use .map() to transform array into JSX elements */}
      {/* Keys: Each element in a list needs a unique 'key' prop to help React identify which items changed */}
      {/* Keys should be stable (not change between renders) and unique among siblings */}
      {/* Good keys: database IDs, unique identifiers. Bad keys: array index (if list can reorder) */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab ? '#4CAF50' : '#888',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <button
        onClick={addPost}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 'bold'
        }}
      >
        Add Post
      </button>

      {/* Rendering list of posts: Each post has a unique 'id' which we use as the key */}
      {/* Using post.id as key helps React efficiently update the list when posts are added/removed */}
      {/* Wrapping posts in Error Boundary to prevent one broken post from crashing the entire list */}
      <ErrorBoundary>
        {posts.map(post => (
          <PostComponent
            key={post.id}
            name={post.name}
            followers={post.followers}
            time={post.time}
            image={post.image}
            content={post.content}
            isSelected={selectedPostId === post.id}
            onSelect={() => setSelectedPostId(post.id)}
          />
        ))}
      </ErrorBoundary>
    </div>
  )
}

// Card component demonstrates the 'children' prop
// 'children' is a special prop that contains whatever you put between the opening and closing tags
// Example: <Card>This text is the children</Card>
function Card({ children }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: 400
    }}>
      {children}
    </div>
  )
}

function PostComponent({ name, followers, time, image, content, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        width: 200,
        backgroundColor: isSelected ? '#e0e0e0' : 'grey',
        height: 200,
        borderRadius: 10,
        border: isSelected ? '3px solid #4CAF50' : '1px solid gray',
        padding: 10,
        cursor: 'pointer'
      }}>
      <div style={{ display: 'flex', padding: 10, alignItems: 'center' }}>
        <img
          src={image}
          alt="random image"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20
          }}
        />
        <div style={{ marginLeft: 10 }}>
          <b>{name}</b>
          <div>{followers} followers</div>
          <div>{time}</div>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>{content}</div>
    </div>
  )
}

export default App
