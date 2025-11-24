// ============================================
// CLIENT-SIDE EXAMPLES
// How to use Cookie vs Authorization Header authentication
// ============================================

const BASE_URL = 'http://localhost:3000';

// ============================================
// METHOD 1: COOKIE-BASED AUTHENTICATION
// ============================================

async function cookieBasedAuth() {
    console.log('\n🍪 COOKIE-BASED AUTHENTICATION\n');
    
    // Step 1: Sign in
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testuser',
            password: 'password123'
        }),
        credentials: 'include' // ⚠️ IMPORTANT: This tells browser to save and send cookies
    });
    
    const signinData = await signinResponse.json();
    console.log('✅ Signed in:', signinData);
    // Server automatically sets cookie in browser
    // Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    
    // Step 2: Access protected route
    // NO NEED to manually add token - browser automatically sends cookie!
    const meResponse = await fetch(`${BASE_URL}/me`, {
        credentials: 'include' // ⚠️ IMPORTANT: This sends the cookie automatically
    });
    
    const meData = await meResponse.json();
    console.log('✅ User info (via cookie):', meData);
    
    // Step 3: Access dashboard
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard`, {
        credentials: 'include' // Cookie sent automatically
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard (via cookie):', dashboardData);
}

// ============================================
// METHOD 2: AUTHORIZATION HEADER (BEARER TOKEN)
// ============================================

async function bearerTokenAuth() {
    console.log('\n📋 AUTHORIZATION HEADER (BEARER TOKEN)\n');
    
    // Step 1: Sign in
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testuser',
            password: 'password123'
        })
    });
    
    const signinData = await signinResponse.json();
    console.log('✅ Signed in:', signinData);
    
    // ⚠️ IMPORTANT: You must manually save the token
    const token = signinData.token;
    // Typically stored in: localStorage, sessionStorage, or memory
    localStorage.setItem('token', token);
    
    // Step 2: Access protected route
    // ⚠️ MUST manually include Authorization header in EVERY request
    const meResponse = await fetch(`${BASE_URL}/me`, {
        headers: {
            'Authorization': `Bearer ${token}` // ⚠️ REQUIRED for every request
        }
    });
    
    const meData = await meResponse.json();
    console.log('✅ User info (via Bearer token):', meData);
    
    // Step 3: Access dashboard
    // ⚠️ Again, must manually include Authorization header
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard`, {
        headers: {
            'Authorization': `Bearer ${token}` // ⚠️ REQUIRED for every request
        }
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard (via Bearer token):', dashboardData);
}

// ============================================
// METHOD 3: CUSTOM HEADER
// ============================================

async function customHeaderAuth() {
    console.log('\n🔧 CUSTOM HEADER (x-auth-token)\n');
    
    // Step 1: Sign in
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testuser',
            password: 'password123'
        })
    });
    
    const signinData = await signinResponse.json();
    const token = signinData.token;
    
    // Step 2: Access protected route with custom header
    const meResponse = await fetch(`${BASE_URL}/me`, {
        headers: {
            'x-auth-token': token // Custom header
        }
    });
    
    const meData = await meResponse.json();
    console.log('✅ User info (via custom header):', meData);
}

// ============================================
// COMPARISON TABLE
// ============================================

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    COOKIE vs AUTHORIZATION HEADER                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ASPECT              │  COOKIE                │  AUTHORIZATION HEADER     ║
║ ─────────────────────┼────────────────────────┼──────────────────────────║
║  Set by Server?      │  ✅ Yes (res.cookie)   │  ❌ No (just returns it)  ║
║  Sent Automatically? │  ✅ Yes (by browser)   │  ❌ No (manual every time)║
║  Client Storage?     │  ❌ No (browser does)  │  ✅ Yes (localStorage)    ║
║  XSS Protection?     │  ✅ Yes (httpOnly)     │  ❌ No (JS can access)    ║
║  CSRF Risk?          │  ⚠️  Yes (use SameSite)│  ✅ No                    ║
║  Mobile Apps?        │  ❌ Harder             │  ✅ Easier                ║
║  SPAs?               │  ✅ Good               │  ✅ Good                  ║
║  Cross-domain?       │  ❌ Harder             │  ✅ Easier                ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

// ============================================
// WHAT HAPPENS IF YOU REMOVE COOKIE CODE?
// ============================================

console.log(`
⚠️  IF YOU REMOVE THE COOKIE CODE FROM SIGNIN:

// Before (sets cookie):
res.cookie('token', token, { httpOnly: true });
res.json({ token });

// After (only returns token):
res.json({ token });

RESULT:
✅ Authorization header method: STILL WORKS
   - Client gets token in response body
   - Client manually adds it to headers

❌ Cookie method: STOPS WORKING
   - No cookie is set by server
   - Browser has nothing to send automatically
   - Protected routes fail with "No token provided"

SOLUTION:
Keep both! Server sets cookie AND returns token in body.
This gives clients flexibility to choose their preferred method.
`);

// ============================================
// REAL-WORLD EXAMPLE: React Component
// ============================================

const ReactExample = `
// React Component using Bearer Token

import { useState, useEffect } from 'react';

function Dashboard() {
    const [userData, setUserData] = useState(null);
    
    useEffect(() => {
        const fetchDashboard = async () => {
            const token = localStorage.getItem('token');
            
            // ⚠️ Must manually add Authorization header
            const response = await fetch('http://localhost:3000/dashboard', {
                headers: {
                    'Authorization': \`Bearer \${token}\`  // REQUIRED!
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            } else {
                // Token invalid or expired
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        };
        
        fetchDashboard();
    }, []);
    
    return <div>{userData?.message}</div>;
}

// VS

// React Component using Cookies

function Dashboard() {
    const [userData, setUserData] = useState(null);
    
    useEffect(() => {
        const fetchDashboard = async () => {
            // ✅ No need to manually add token!
            const response = await fetch('http://localhost:3000/dashboard', {
                credentials: 'include'  // Browser sends cookie automatically
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            }
        };
        
        fetchDashboard();
    }, []);
    
    return <div>{userData?.message}</div>;
}
`;

console.log('\n📱 REACT EXAMPLE:\n', ReactExample);

// ============================================
// RUN EXAMPLES
// ============================================

// Uncomment to test:
// cookieBasedAuth();
// bearerTokenAuth();
// customHeaderAuth();

