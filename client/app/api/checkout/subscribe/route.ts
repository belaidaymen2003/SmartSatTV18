import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

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

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'SOLD_OUT'
      }
    })

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: `Successfully purchased subscription code: ${subscription.code}`
    })
  } catch (err: any) {
    console.error('CHECKOUT API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
