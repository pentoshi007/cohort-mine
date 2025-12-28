// RECOIL - Modern State Management Library for React
// 
// WHY RECOIL?
// - Context API causes unnecessary re-renders of all consumers when state changes
// - Redux has too much boilerplate (actions, reducers, dispatch)
// - Recoil provides atomic state management with minimal setup
//
// KEY CONCEPTS:
// 1. Atoms - Individual pieces of state that components can subscribe to
//    - Only components using that specific atom re-render when it changes
//    - Can be read and written from any component
//
// 2. Selectors - Derived state (computed values based on atoms)
//    - Pure functions that transform atom values
//    - Automatically update when dependencies change
//    - Can be synchronous or asynchronous
//
// RECOIL VS OTHER SOLUTIONS:
// 
// Context API:
//   - Context: All consumers re-render on any state change
//   - Recoil: Only components using specific atoms re-render
//
// Redux:
//   - Redux: Heavy boilerplate (actions, reducers, dispatch, connect)
//   - Recoil: Minimal setup, hooks-based API (useRecoilState, useRecoilValue)
//
// Zustand:
//   - Zustand: Simpler but fewer features, single store approach
//   - Recoil: More powerful selectors, better async support, atomic updates
//
// WHEN TO USE RECOIL:
// - Medium to large apps with complex state
// - Need fine-grained control over re-renders
// - Want React-like API without Redux complexity
// - Need derived/computed state with selectors

// Simple Counter using Context API (for comparison)
import React, { createContext, useContext, useState } from 'react';

const CountContext = createContext();

function CountProvider({ children }) {
    const [count, setCount] = useState(0);
    return (
        <CountContext.Provider value={{ count, setCount }}>
            {children}
        </CountContext.Provider>
    );
}

function Counter() {
    const { count, setCount } = useContext(CountContext);
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
        </div>
    );
}

function AppWithContext() {
    return (
        <CountProvider>
            <Counter />
        </CountProvider>
    );
}
// Note: This Context API approach is not optimal - it re-renders all consumers
// even if they don't use the changed state. Recoil solves this problem.

//=============================================================================
// RECOIL CORE CONCEPTS:
//
// 1. atom: Basic unit of state (like useState but global)
//    - Creates a piece of state that can be read/written from any component
//    - Each atom has a unique key and a default value
//    - Example: const countState = atom({ key: 'count', default: 0 });
//
// 2. selector: Derived/computed state (like useMemo but global)
//    - Computes values based on atoms or other selectors
//    - Can be synchronous or asynchronous
//    - Automatically updates when dependencies change
//    - Example: const doubleCount = selector({ key: 'double', get: ({get}) => get(countState) * 2 });
//
// 3. useRecoilState: Read and write atom (like useState)
//    - Returns [value, setter] tuple
//    - Component re-renders when atom changes
//    - Example: const [count, setCount] = useRecoilState(countState);
//
// 4. useRecoilValue: Read-only access to atom/selector
//    - Only returns the value, no setter
//    - Component re-renders when value changes
//    - Example: const count = useRecoilValue(countState);
//
// 5. useSetRecoilState: Write-only access to atom
//    - Only returns the setter, no value
//    - Component does NOT re-render when atom changes
//    - Example: const setCount = useSetRecoilState(countState);
//
// 6. RecoilRoot: Provider component that wraps your app
//    - Must wrap all components that use Recoil hooks
//    - Creates the context for Recoil state
//    - Example: <RecoilRoot><App /></RecoilRoot>

//================================================================================
//npm install recoil
import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

// Define the atom outside of components (global state)
const counterState = atom({
    key: 'counter',
    default: 0
});

function AppWithRecoil() {
    return (
        <RecoilRoot>
            <Counter />
            <CounterDisplay />
            <CounterButtons />
        </RecoilRoot>
    );
}

// Component that reads and writes the counter
function Counter() {
    const [count, setCount] = useRecoilState(counterState);

    return (
        <div>
            <h1>Counter: {count}</h1>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
        </div>
    );
}

// Component that only reads the counter (read-only)
function CounterDisplay() {
    const count = useRecoilValue(counterState);

    return (
        <div>
            <p>Current count (read-only): {count}</p>
        </div>
    );
}

// Component that only writes to the counter (write-only, won't re-render)
function CounterButtons() {
    const setCount = useSetRecoilState(counterState);

    return (
        <div>
            <button onClick={() => setCount(c => c + 1)}>Increment (no re-render)</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}

//================================================================================
// RECOIL WITH SELECTORS - Derived/Computed State
// Selectors compute values based on atoms or other selectors
// They automatically update when their dependencies change

// Define selectors for derived state
const doubleCountState = selector({
    key: 'doubleCount',
    get: ({ get }) => {
        const count = get(counterState);
        return count * 2;
    }
});

const isEvenState = selector({
    key: 'isEven',
    get: ({ get }) => {
        const count = get(counterState);
        return count % 2 === 0;
    }
});

const countSquaredState = selector({
    key: 'countSquared',
    get: ({ get }) => {
        const count = get(counterState);
        return count * count;
    }
});

function AppWithRecoilSelectors() {
    return (
        <RecoilRoot>
            <h2>Recoil with Selectors Example</h2>
            <CounterWithSelectors />
            <DerivedValues />
        </RecoilRoot>
    );
}

// Component that reads and writes the counter
function CounterWithSelectors() {
    const [count, setCount] = useRecoilState(counterState);

    return (
        <div>
            <h3>Counter: {count}</h3>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}

// Component that displays derived/computed values using selectors
function DerivedValues() {
    const doubleCount = useRecoilValue(doubleCountState);
    const isEven = useRecoilValue(isEvenState);
    const countSquared = useRecoilValue(countSquaredState);

    return (
        <div>
            <h4>Derived Values (using selectors):</h4>
            <p>Double Count: {doubleCount}</p>
            <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
            <p>Count Squared: {countSquared}</p>
        </div>
    );
}

//================================================================================
//if a state in parent is changing so parent will re-render and all the children will re-render even if the children are not using the state
//MEMO
import { memo } from 'react';
//memo is a hook that memoizes a component and only re-renders it if the props change
//it is a performance optimization
//use memo for this example
function App2() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Parent Count: {count}</h1>
            <button onClick={() => setCount(count + 1)}>Increment Parent</button>
            <ChildWithoutMemo />
            <ChildWithMemo />
        </div>
    );
}

// This child will re-render every time parent re-renders
function ChildWithoutMemo() {
    console.log('ChildWithoutMemo rendered');
    return <p>Child without memo - I re-render on every parent update</p>;
}

// This child will only re-render if its props change
const ChildWithMemo = memo(function ChildWithMemo() {
    console.log('ChildWithMemo rendered');
    return <p>Child with memo - I only re-render if my props change</p>;
});