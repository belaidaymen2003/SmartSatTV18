import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { jwtDecode } from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = parseInt(params.id, 10)
    if (isNaN(appId)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 })
    }

    // Get user from token
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: number
    try {
      const decoded: any = jwtDecode(token)
      userId = decoded?.userId
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get app
    const app = await prisma.catalogApp.findUnique({
      where: { id: appId }
    })

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // Get user and check credits
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.credits < app.credit) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // Check if user already owns this app
    const existingAppDownload = await prisma.catalogApp.findFirst({
      where: {
        id: appId,
        userId: userId
      }
    })

    if (existingAppDownload) {
      return NextResponse.json(
        { error: 'You already own this app' },
        { status: 409 }
      )
    }

    // Update user credits and add app to user's downloads
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: app.credit
        }
      }
    })

    // Link app to user
    await prisma.catalogApp.update({
      where: { id: appId },
      data: {
        userId: userId
      }
    })

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        credits: updatedUser.credits
      },
      message: 'App purchased successfully'
    })
  } catch (err: any) {
    console.error('PURCHASE APP ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
