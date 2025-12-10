// ============================================================================
// COMPLETE LIGHT BULB APP - Demonstrating State Management Patterns in React
// ============================================================================
// This single example demonstrates:
// 1. Rolling Up State (Lifting State Up)
// 2. Prop Drilling
// 3. Context API
//
// Component Tree Structure:
//    App
//     └── Light
//          └── LightBulb
//               └── ToggleBulb
// ============================================================================

import React, { useState, createContext, useContext } from 'react';

// ============================================================================
// APPROACH 1: PROP DRILLING (The Problem)
// ============================================================================
// In this approach, we pass isOn and toggleBulb through every component,
// even if intermediate components don't need them.
//
// Flow: App -> Light -> LightBulb -> ToggleBulb
// Problem: Light and LightBulb act as "middlemen", passing props they don't use

function AppWithPropDrilling() {
    // ROLLING UP STATE: State is "lifted up" to the top-most parent
    // This is the single source of truth for the bulb's on/off state
    const [isOn, setIsOn] = useState(false);

    // Toggle function to flip the bulb state
    const toggleBulb = () => setIsOn(prev => !prev);

    return (
        <div>
            <h1>Light Bulb App (Prop Drilling)</h1>
            {/* Pass isOn and toggleBulb down through props */}
            <LightWithDrilling isOn={isOn} toggleBulb={toggleBulb} />
        </div>
    );
}

// Light component - DOESN'T USE isOn or toggleBulb, just passes them down
// This is PROP DRILLING - acting as a middleman
function LightWithDrilling({ isOn, toggleBulb }) {
    return (
        <div>
            <h2>Light Component</h2>
            <p>(I don't need isOn or toggleBulb, but I have to pass them down)</p>
            {/* Passing props further down */}
            <LightBulbWithDrilling isOn={isOn} toggleBulb={toggleBulb} />
        </div>
    );
}

// LightBulb component - USES isOn to display state, passes toggleBulb down
function LightBulbWithDrilling({ isOn, toggleBulb }) {
    return (
        <div>
            <h3>LightBulb Component</h3>
            <p>Bulb is: {isOn ? 'ON 💡' : 'OFF 🌑'}</p>
            {/* Still passing toggleBulb down */}
            <ToggleBulbWithDrilling toggleBulb={toggleBulb} />
        </div>
    );
}

// ToggleBulb component - USES toggleBulb to modify state
function ToggleBulbWithDrilling({ toggleBulb }) {
    return <button onClick={toggleBulb}>Toggle Bulb</button>;
}

// ============================================================================
// APPROACH 2: CONTEXT API (The Solution)
// ============================================================================
// Context API eliminates prop drilling by providing a way to share values
// between components without explicitly passing props through every level.
//
// Steps:
// 1. Create a Context (createContext)
// 2. Wrap components with Context.Provider and pass value
// 3. Consume the Context using useContext(ContextName)

// Step 1: CREATE THE CONTEXT
const BulbContext = createContext();

// Step 2: CREATE A PROVIDER COMPONENT
// This wraps children and provides the context value to all descendants
function BulbProvider({ children }) {
    const [bulbOn, setBulbOn] = useState(true);

    return (
        <BulbContext.Provider value={{
            bulbOn: bulbOn,
            setBulbOn: setBulbOn
        }}>
            {children}
        </BulbContext.Provider>
    );
}

// App component with Context API
function AppWithContext() {
    return (
        <div>
            <h1>Light Bulb App (Context API)</h1>
            {/* Step 3: WRAP components with BulbProvider */}
            <BulbProvider>
                <Light />
            </BulbProvider>
        </div>
    );
}

// Light component - NO PROPS NEEDED!
// Doesn't need to know about isOn or toggleBulb at all
function Light() {
    return (
        <div>
            <h2>Light Component</h2>
            <p>(Clean! No props to pass through)</p>
            {/* Just render child, no prop passing */}
            <LightBulb />
        </div>
    );
}

// LightBulb component - CONSUMES bulbOn from context
function LightBulb() {
    // Step 4: CONSUME THE CONTEXT using useContext hook
    const { bulbOn } = useContext(BulbContext);

    return (
        <div>
            <h3>LightBulb Component</h3>
            <p>Bulb is: {bulbOn ? 'ON 💡' : 'OFF 🌑'}</p>
            {/* No need to pass setBulbOn, ToggleBulb gets it from context */}
            <ToggleBulb />
        </div>
    );
}

// ToggleBulb component - CONSUMES setBulbOn from context
function ToggleBulb() {
    // Step 4: CONSUME THE CONTEXT
    const { bulbOn, setBulbOn } = useContext(BulbContext);

    return <button onClick={() => setBulbOn(!bulbOn)}>Toggle Bulb</button>;
}

// ============================================================================
// MAIN APP - Export this to see all three approaches
// ============================================================================
export default function App() {
    return (
        <div>
            <AppWithPropDrilling />
            <hr />
            <AppWithContext />
            <hr />
            <AppWithRecoil />
        </div>
    );
}

// ============================================================================
// SUMMARY NOTES
// ============================================================================
//
// 1. ROLLING UP STATE (Lifting State Up)
//    - State lives in the closest common ancestor of components that need it
//    - In both approaches, `isOn` state is defined at the top level (App)
//    - Creates a single source of truth for shared data
//    - Children can modify state through callback functions (toggleBulb)
//
// 2. PROP DRILLING (The Problem)
//    - Passing props through intermediate components that don't need them
//    - Light component receives isOn and toggleBulb but doesn't use them
//    - Makes code harder to maintain - changing prop names requires updates everywhere
//    - Components become tightly coupled
//
// 3. CONTEXT API (The Solution)
//    - createContext() - Creates a context object
//    - Context.Provider - Wraps components and provides value to all children
//    - useContext(ContextName) - Hook to consume context value in any component
//    - Eliminates prop drilling - components directly access what they need
//    - Best for: theme, auth state, language preferences, global settings
//
// WHEN TO USE WHAT?
// -----------------
// Props:                     1-2 levels deep, specific to parent-child
// Context API:               3+ levels deep, many components need same data
// State Management Libraries: Complex state logic, large apps, time-travel debugging
//                            (Redux, Zustand, Jotai, etc.)


// ============================================================================
// APPROACH 3: RECOIL (Modern State Management Library)
// ============================================================================
//npm install recoil
// Recoil is a state management library by Facebook that provides:
// - Atoms: Units of state (like useState but globally accessible)
// - Selectors: Derived state (computed values based on atoms)
// - No prop drilling, no Context boilerplate
//
// Installation: npm install recoil
//
// Key Concepts:
// - atom(): Creates a piece of state with a unique key
// - useRecoilState(): Like useState, returns [value, setter]
// - useRecoilValue(): Read-only access to atom/selector
// - useSetRecoilState(): Write-only access (setter function)
// - RecoilRoot: Provider component that wraps your app

import { atom, useRecoilState, useRecoilValue, useSetRecoilState, RecoilRoot } from 'recoil';

// Step 1: CREATE AN ATOM (global state)
// atom() creates a piece of state that any component can subscribe to
const bulbState = atom({
    key: 'bulbState',    // Unique ID (must be unique across all atoms)
    default: true        // Default/initial value
});

// App component with Recoil
function AppWithRecoil() {
    return (
        // Step 2: WRAP with RecoilRoot (similar to Context.Provider)
        // RecoilRoot provides Recoil state to all descendant components
        <RecoilRoot>
            <div>
                <h1>Light Bulb App (Recoil)</h1>
                {/* No props needed! */}
                <LightRecoil />
            </div>
        </RecoilRoot>
    );
}

// Light component - NO PROPS NEEDED!
function LightRecoil() {
    return (
        <div>
            <h2>Light Component</h2>
            <p>(Clean! No props, no context consumption needed here)</p>
            <LightBulbRecoil />
        </div>
    );
}

// LightBulb component - READS bulbState atom
function LightBulbRecoil() {
    // Step 3: READ the atom using useRecoilValue (read-only)
    // This component only needs to READ the state, not modify it
    const bulbOn = useRecoilValue(bulbState);

    return (
        <div>
            <h3>LightBulb Component</h3>
            <p>Bulb is: {bulbOn ? 'ON 💡' : 'OFF 🌑'}</p>
            <ToggleBulbRecoil />
        </div>
    );
}

// ToggleBulb component - MODIFIES bulbState atom
function ToggleBulbRecoil() {
    // Option 1: useRecoilState - returns [value, setter] like useState
    // const [bulbOn, setBulbOn] = useRecoilState(bulbState);

    // Option 2: useSetRecoilState - returns only the setter (write-only)
    // Use this when component only needs to UPDATE state, not read it
    // This prevents unnecessary re-renders when state changes
    const setBulbOn = useSetRecoilState(bulbState);

    return <button onClick={() => setBulbOn(prev => !prev)}>Toggle Bulb</button>;
}

// ============================================================================
// RECOIL SUMMARY
// ============================================================================
//
// SETUP:
// 1. npm install recoil
// 2. Wrap app with <RecoilRoot>
//
// ATOMS (State):
// const myState = atom({ key: 'uniqueKey', default: initialValue })
//
// HOOKS:
// useRecoilState(atom)      - Read + Write (returns [value, setter])
// useRecoilValue(atom)      - Read only (returns value)
// useSetRecoilState(atom)   - Write only (returns setter)
//
// WHY RECOIL OVER CONTEXT?
// - Less boilerplate (no Provider component needed for each state)
// - Better performance (components only re-render when subscribed atoms change)
// - Selectors for derived/computed state
// - Easy to split state into small atoms
// - Built-in support for async state
//
// CONTEXT API vs RECOIL:
// ----------------------
// Context API:
//   - Built into React (no extra dependency)
//   - Good for simple, infrequently changing state (theme, auth)
//   - All consumers re-render when any part of context changes
//
// Recoil:
//   - External library (adds to bundle size)
//   - Great for complex, frequently changing state
//   - Fine-grained subscriptions (only re-render when specific atom changes)
//   - Easier to manage many pieces of related state
