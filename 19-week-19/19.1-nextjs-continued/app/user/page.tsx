// ❌ OLD APPROACH (Client-Side Fetching) - NOT RECOMMENDED IN NEXT.JS
// 'use client';
// import { useEffect, useState } from "react";
// import axios from "axios";
// 
// export default function User() {
//     const [name, setName] = useState('');
//     
//     useEffect(() => {
//         axios.get('https://jsonplaceholder.typicode.com/users/1')
//             .then(res => setName(res.data.name))
//             .catch(error => console.error('Error fetching user:', error));
//     }, []);
//     
//     return (
//         <div>
//             <h1>User</h1>
//             <p>{name}</p>
//         </div>
//     );
// }
// 
// Problems with this approach:
// 1. Client makes the request after page loads (slower, causes loading state)
// 2. Data is fetched on every page visit (no caching)
// 3. SEO unfriendly - search engines don't see the data
// 4. Exposes API calls to the client
// 5. Increases bundle size with client-side code

// ✅ NEW APPROACH (Server-Side Fetching) - RECOMMENDED IN NEXT.JS
// Server Component - fetches data on the server before sending HTML to client

import axios from "axios";
import Link from "next/link";

export default async function User() {
    // Fetch data directly in the server component using async/await
    // This runs on the server during build time or request time
    const res = await axios.get('http://localhost:3000/api/v1/user/details?id=1');
    const user = res.data;
    
    // Benefits of this approach:
    // 1. Faster initial page load - HTML comes with data already rendered
    // 2. Better SEO - search engines can see the content
    // 3. Automatic caching and revalidation support
    // 4. Reduced client-side JavaScript bundle
    // 5. More secure - API keys/secrets stay on server
    
    return (
        <div>
            <h1>User</h1>
           
            {/* React can't render objects directly; stringify to show raw JSON */}
            <pre className="whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
}

// ==================================================================================
// HOW TO ADD LOADING STATE IN NEXT.JS - STEP BY STEP GUIDE
// ==================================================================================
//
// STEP 1: Create a loading.tsx file in the SAME directory as page.tsx
// -----------------------------------------------------------------------
// File: app/user/loading.tsx
//
// export default function Loading() {
//     return (
//         <div className="flex items-center justify-center min-h-screen">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Loading user data...</p>
//             </div>
//         </div>
//     );
// }
//
// STEP 2: How it works automatically
// -----------------------------------------------------------------------
// - Next.js automatically wraps your page.tsx in a <Suspense> boundary
// - While the async function User() is fetching data, loading.tsx is shown
// - Once data is fetched, the actual page content replaces the loading UI
// - No manual Suspense wrapper needed!
//
// STEP 3: File structure should look like this:
// -----------------------------------------------------------------------
// app/
// ├── user/
// │   ├── page.tsx       ← This file (async server component)
// │   └── loading.tsx    ← Loading UI (automatically shown during fetch)
// └── layout.tsx
//
// STEP 4: Alternative - Manual Suspense (for more control)
// -----------------------------------------------------------------------
// If you want more granular control, you can use Suspense manually:
//
// import { Suspense } from 'react';
//
// async function UserData() {
//     const res = await axios.get('https://jsonplaceholder.typicode.com/users/1');
//     return <p>{res.data.name}</p>;
// }
//
// export default function User() {
//     return (
//         <div>
//             <h1>User</h1>
//             <Suspense fallback={<p>Loading user name...</p>}>
//                 <UserData />
//             </Suspense>
//         </div>
//     );
// }
//
// STEP 5: Testing the loading state
// -----------------------------------------------------------------------
// To see the loading state in action, you can add an artificial delay:
//
// const res = await axios.get('https://jsonplaceholder.typicode.com/users/1');
// await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
// const name = res.data.name;
//
// STEP 6: Advanced - Streaming with multiple Suspense boundaries
// -----------------------------------------------------------------------
// You can have multiple loading states for different parts of the page:
//
// export default function User() {
//     return (
//         <div>
//             <h1>User Profile</h1>
//             <Suspense fallback={<div>Loading name...</div>}>
//                 <UserName />
//             </Suspense>
//             <Suspense fallback={<div>Loading posts...</div>}>
//                 <UserPosts />
//             </Suspense>
//         </div>
//     );
// }