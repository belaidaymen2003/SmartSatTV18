import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/generated/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ notifications: [] })

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ notifications: [] })
    }

    const userId = Number(payload.sub)

    // Upcoming or recent subscription-related notifications
    const upcomingSubs = await prisma.userSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        subscription: { select: { id: true, credit: true, channel: { select: { id: true, name: true } } } },
      },
      orderBy: { startDate: 'desc' },
      take: 10,
    })

    // BeInSportActivation entries targeted to this user (customerId may be email or phone)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true } })
    const activations = user?.email ? await prisma.beInSportActivation.findMany({ where: { customerId: user.email }, select: { id: true, code: true, months: true, createdAt: true } }) : []

    // Map into a unified notifications list
    const notifications: any[] = []

    for (const s of upcomingSubs) {
      notifications.push({
        id: `sub-${s.id}`,
        type: 'subscription',
        title: s.subscription?.channel?.name || 'Subscription',
        message: `Plan ${s.status} — ends ${s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}`,
        date: s.startDate || null,
      })
    }

    for (const a of activations) {
      notifications.push({
        id: `act-${a.id}`,
        type: 'activation',
        title: 'beIN Activation',
        message: `Code ${a.code} — ${a.months} months`,
        date: a.createdAt,
      })
    }

    // sort by date desc
    notifications.sort((x, y) => {
      const dx = x.date ? new Date(x.date).getTime() : 0
      const dy = y.date ? new Date(y.date).getTime() : 0
      return dy - dx
    })

    return NextResponse.json({ notifications })
  } catch (error: any) {
    return NextResponse.json({ notifications: [] })
  }
}
