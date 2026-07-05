import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/serverAuth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken(user.id, user.role);
    await setAuthCookie(token);

    return NextResponse.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
