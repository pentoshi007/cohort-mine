// ============================================
// REACT PART 2 - useState, useEffect & Component Lifecycle
// ============================================

import { useState, useEffect } from "react";

// ============================================
// APP COMPONENT - State lifted here (parent owns the state)
// ============================================
function App() {
    const [counterVisible, setCounterVisible] = useState(true);
    const [count, setCount] = useState(0);

    // ============================================
    // WITHOUT useEffect (if we wrote this outside):
    // ============================================
    // setTimeout(() => setCounterVisible(false), 5000);
    // setInterval(() => setCount(c => c + 1), 1000);
    //
    // PROBLEM: These would run on EVERY RENDER!
    // - Each state update → re-render → new timer created
    // - Would create INFINITE timers, crash the app
    // - setInterval would keep stacking up
    // ============================================

    // ============================================
    // WITH useEffect (correct way):
    // ============================================
    // - Runs AFTER render, not during
    // - [] dependency = runs ONLY ONCE on mount
    // - Cleanup prevents memory leaks
    // - No infinite loop, controlled execution

    useEffect(() => {
        const timer = setTimeout(() => setCounterVisible(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const clock = setInterval(() => setCount((c) => c + 1), 1000);
        return () => clearInterval(clock);
    }, []);

    return (
        <div>
            {counterVisible && <Counter count={count} />}
        </div>
    );
}

// ============================================
// COUNTER COMPONENT - Receives count as prop
// ============================================
function Counter({ count }) {
    // ============================================
    // WITHOUT useEffect (if we wrote side effects directly):
    // ============================================
    // console.log("effect"); 
    // document.title = `Count: ${count}`;
    //
    // PROBLEM:
    // - Runs DURING render (blocks UI)
    // - No cleanup mechanism for subscriptions
    // - No control over WHEN it runs
    // - Can cause issues with strict mode (double render)
    // ============================================

    // ============================================
    // WITH useEffect (correct way):
    // ============================================
    // - Runs AFTER render completes (non-blocking)
    // - Cleanup function handles unmount
    // - Dependency array controls execution timing
    // - React can optimize and batch effects

    // [] = MOUNT only
    useEffect(() => {
        console.log("MOUNT: Counter added to DOM");
        return () => console.log("UNMOUNT: Counter removed from DOM");
    }, []);

    // [count] = runs when count changes
    useEffect(() => {
        console.log(`COUNT CHANGED: ${count}`);
        document.title = `Count: ${count}`;
    }, [count]);

    // No array = EVERY render
    useEffect(() => {
        console.log("RE-RENDERED");
    });

    return (
        <div>
            <h1 id="text">{count}</h1>
        </div>
    );
}

export default App;

// ============================================
// SUMMARY: useEffect vs No useEffect
// ============================================
// WITHOUT useEffect:
//   ❌ Side effects run DURING render
//   ❌ No cleanup = memory leaks
//   ❌ Runs on EVERY render = infinite loops
//   ❌ Blocks UI rendering
//
// WITH useEffect:
//   ✅ Side effects run AFTER render
//   ✅ Cleanup function prevents leaks
//   ✅ Dependency array controls execution
//   ✅ Non-blocking, React optimized
// ============================================