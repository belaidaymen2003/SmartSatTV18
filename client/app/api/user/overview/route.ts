import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../admin/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        credits: true,
        status: true,
        video: { select: { id: true, title: true, thumbnail: true, videoUrl: true, createdAt: true } },
        downloadedApps: {
          select: {
            id: true,
            purchasedAt: true,
            app: { select: { id: true, name: true, downloadLink: true, image: true, credit: true, version: true, createdAt: true } }
          }
        },
        userSubscriptions: {
          select: {
            id: true,
            status: true,
            code: true,
            startDate: true,
            endDate: true,
            subscription: {
              select: {
                id: true,
                credit: true,
                duration: true,
                channel: { select: { id: true, name: true, logo: true, category: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
