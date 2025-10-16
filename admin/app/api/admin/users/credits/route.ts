import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

interface CreditPayload {
  userId: number
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount } = body as CreditPayload

    if (!userId || !Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    if (!Number.isFinite(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: Math.floor(amount),
          },
        },
        select: {
          id: true,
          credits: true,
        },
      })

      return NextResponse.json({
        message: 'Credits added successfully',
        userId: user.id,
        credits: user.credits,
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount } = body as CreditPayload

    if (!userId || !Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    if (!Number.isFinite(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: Math.max(0, Math.floor(amount)),
        },
        select: {
          id: true,
          credits: true,
        },
      })

      return NextResponse.json({
        message: 'Credits updated successfully',
        userId: user.id,
        credits: user.credits,
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')

    if (!userIdParam || !Number.isFinite(Number(userIdParam))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const userId = Number(userIdParam)

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: 0,
        },
        select: {
          id: true,
          credits: true,
        },
      })

      return NextResponse.json({
        message: 'Credits reset successfully',
        userId: user.id,
        credits: user.credits,
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to reset credits' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
