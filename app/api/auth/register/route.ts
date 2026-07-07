import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie } from '@/lib/serverAuth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, password, referredByCode } = await req.json();

    const hashedPassword = await hashPassword(password);
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const user = await prisma.$transaction(async (tx) => {
      let referrerId: string | null = null;
      if (referredByCode) {
        const referrer = await tx.user.findFirst({
          where: { referralCode: { equals: referredByCode, mode: "insensitive" } },
        });
        if (referrer) {
          referrerId = referrer.id;
          // Award referrer +100 bonuses
          await tx.user.update({
            where: { id: referrer.id },
            data: {
              bonusBalance: { increment: 100 },
              referralBonus: { increment: 100 },
              referralCount: { increment: 1 },
            },
          });
        }
      }

      return tx.user.create({
        data: {
          email,
          name,
          phone,
          password: hashedPassword,
          referralCode,
          referredById: referrerId,
        },
      });
    });

    const token = await createToken(user.id, user.role);
    await setAuthCookie(token);

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
