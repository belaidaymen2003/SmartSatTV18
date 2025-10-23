import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/generated/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ history: [] })

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ history: [] })
    }

    const plans = await prisma.userSubscription.findMany({
      where: { userId: Number(payload.sub) },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        subscription: { select: { id: true, credit: true, channel: { select: { id: true, name: true } } } },
      },
    })

    return NextResponse.json({ history: plans })
  } catch (error: any) {
    return NextResponse.json({ history: [] })
  }
}
