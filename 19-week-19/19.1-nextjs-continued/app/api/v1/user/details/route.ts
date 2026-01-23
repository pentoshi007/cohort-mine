// ==================================================================================
// NEXT.JS API ROUTES vs EXPRESS.JS - KEY DIFFERENCES
// ==================================================================================
//
// ❌ OLD WAY (Express.js):
// --------------------------------------------------
// app.get('/api/v1/user/details', async (req, res) => {
//     const id = req.query.id;
//     const user = await User.findById(id);
//     res.json(user);
// });
//
// app.post('/api/v1/user/details', async (req, res) => {
//     const { name } = req.body;
//     res.json({ message: "User created", name });
// });
//
// ✅ NEW WAY (Next.js App Router):
// --------------------------------------------------
// 1. File-based routing: File location determines the route
//    - This file is at: app/api/v1/user/details/route.ts
//    - Route becomes: /api/v1/user/details
//
// 2. Named exports for HTTP methods: Export functions named after HTTP methods
//    - Express: app.get(), app.post(), etc.
//    - Next.js: export async function GET(), POST(), etc.
//
// 3. Request/Response objects are different:
//    - Express: (req, res) => {}
//    - Next.js: (request: NextRequest) => NextResponse
//
// 4. No middleware chain like Express - use middleware.ts for global middleware
//
// 5. Query params: req.query.id → new URL(request.url).searchParams.get('id')
//
// 6. Request body: req.body → await request.json()
//
// 7. Response: res.json() → NextResponse.json()
//
// ==================================================================================

import { NextRequest, NextResponse } from "next/server";

// Note: The import below is incorrect - User is a React component, not a database model
// In a real app, you would import a Prisma/Mongoose model like:
// import { prisma } from "@/lib/prisma";
// or
// import UserModel from "@/models/User";

export async function GET(request: NextRequest) {
    // Extract query parameters from URL
    // Express equivalent: const id = req.query.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // TODO: Replace with actual database query
    // Example with Prisma: const user = await prisma.user.findUnique({ where: { id } });
    // Example with Mongoose: const user = await UserModel.findById(id);
    const user = { id, name: "Mock User" }; // Placeholder
    
    // Return JSON response
    // Express equivalent: res.json(user);
    return NextResponse.json(user);
}

export async function POST(request: NextRequest) {
    // Parse JSON body from request
    // Express equivalent: const { name } = req.body;
    const { name } = await request.json();
    
    // TODO: Add actual database insertion logic here
    // Example: const user = await prisma.user.create({ data: { name } });
    
    return NextResponse.json({ message: "User created", name });
}

export async function PUT(request: NextRequest) {
    // PUT is typically used for full resource replacement
    const { id, name } = await request.json();
    
    // TODO: Add actual database update logic
    // Example: const user = await prisma.user.update({ where: { id }, data: { name } });
    
    return NextResponse.json({ message: "User updated", id, name });
}

export async function DELETE(request: NextRequest) {
    // DELETE request - body parsing works the same way
    const { id } = await request.json();
    
    // TODO: Add actual database deletion logic
    // Example: await prisma.user.delete({ where: { id } });
    
    return NextResponse.json({ message: "User deleted", id });
}

export async function PATCH(request: NextRequest) {
    // PATCH is typically used for partial resource updates
    const { id, name } = await request.json();
    
    // TODO: Add actual database patch logic
    // Example: const user = await prisma.user.update({ where: { id }, data: { name } });
    
    return NextResponse.json({ message: "User patched", id, name });
}

export async function OPTIONS(request: NextRequest) {
    // OPTIONS is used for CORS preflight requests
    // In Express, you'd use cors() middleware
    // In Next.js, you can handle it here or in middleware.ts
    return NextResponse.json({ message: "User options" });
}
