import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

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

    let payload: any
    let userId: number
    try {
      payload = jwt.verify(token, JWT_SECRET)
      userId = Number(payload.sub)
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
    const existingAppDownload = await prisma.userCatalogApp.findUnique({
      where: {
        userId_appId: {
          userId: userId,
          appId: appId
        }
      }
    })

    if (existingAppDownload) {
      return NextResponse.json(
        { error: 'You already own this app' },
        { status: 409 }
      )
    }

    // Update user credits
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: Math.floor(app.credit)
        }
      }
    })

    // Create junction record linking user to app
    await prisma.userCatalogApp.create({
      data: {
        userId: userId,
        appId: appId,
        purchasedAt: new Date()
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
