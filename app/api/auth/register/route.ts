import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie } from '@/lib/serverAuth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, password } = await req.json();

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, name, phone, password: hashedPassword },
    });

    const token = await createToken(user.id, user.role);
    await setAuthCookie(token);

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
