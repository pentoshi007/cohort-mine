import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Add database logic and password verification here
    // Example: 
    // const user = await prisma.user.findUnique({ where: { email } });
    // if (!user || !await bcrypt.compare(password, user.password)) {
    //   return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    // }
    // const token = jwt.sign({ userId: user.id }, SECRET_KEY);

    // For now, we'll mock the response
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: 'Mock User',
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: mockUser,
        token: mockToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
