import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma/index.js'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || ''

function calculateEndDate(duration: string, startDate: Date = new Date()): Date {
  const date = new Date(startDate)

  switch (duration) {
    case 'ONE_MONTH':
      date.setMonth(date.getMonth() + 1)
      break
    case 'SIX_MONTHS':
      date.setMonth(date.getMonth() + 6)
      break
    case 'ONE_YEAR':
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscriptionId, userEmail } = body

    if (!subscriptionId || !userEmail) {
      return NextResponse.json(
        { error: 'subscriptionId and userEmail are required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { channel: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Subscription is ${subscription.status}` },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.credits < subscription.credit) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${subscription.credit} credits but only have ${user.credits}` },
        { status: 400 }
      )
    }

    const startDate = new Date()
    const endDate = calculateEndDate(subscription.duration, startDate)

    const result = await prisma.$transaction(async (tx: any) => {
      const userSub = await tx.userSubscription.create({
        data: {
          userId: user.id,
          subscriptionId: subscription.id,
          code: subscription.code,
          startDate,
          endDate,
          status: 'ACTIVE'
        },
        include: {
          subscription: {
            include: { channel: true }
          }
        }
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: subscription.credit
          }
        }
      })

      await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'SOLD_OUT'
        }
      })

      return userSub
    })

    return NextResponse.json({
      success: true,
      userSubscription: result,
      message: `Successfully purchased subscription code: ${subscription.code}`
    })
  } catch (err: any) {
    console.error('CHECKOUT API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
