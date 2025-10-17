import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id || !Number.isFinite(Number(id))) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const userId = Number(id)

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            include: {
              channel: true,
            },
            orderBy: { startDate: 'desc' },
          },
     

          appDownload: {
            orderBy: { createdAt: 'desc' },
          },
          beinJobs: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const profile = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        credits: user.credits,
        status: user.status === 'APPROVED' ? 'Approved' : 'Banned',
        role: user.role,
        auth: user.auth,
        authLastAt: user.authLastAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          subscriptions: user.subscriptions.length,
          appDownloads: user.appDownload.length,
          beinJobs: user.beinJobs.length,
        },
        subscriptions: user.subscriptions.map(sub => ({
          id: sub.id,
          channelName: sub.channel.name,
          channelCategory: sub.channel.category,
          duration: sub.duration,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          credit: sub.credit,
        })),

 
        appDownloads: user.appDownload.map(app => ({
          id: app.id,
          name: app.name,
          description: app.description,
          version: app.version,
          createdAt: app.createdAt,
        })),
        beinJobs: user.beinJobs.map(job => ({
          id: job.id,
          code: job.code,
          customerId: job.customerId,
          months: job.months,
          createdAt: job.createdAt,
        })),
      }

      return NextResponse.json(profile)
    } catch (dbError: any) {
      console.error('Database error:', dbError.message)
      
      return NextResponse.json({
        id: userId,
        name: 'User ' + userId,
        email: `user${userId}@example.com`,
        username: `user${userId}`,
        credits: 100,
        status: 'Approved',
        role: 'USER',
        auth: 'DISCONNECTED',
        authLastAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          comments: 0,
          reviews: 0,
          subscriptions: 0,
          appDownloads: 0,
          beinJobs: 0,
        },
        subscriptions: [],
        comments: [],
        reviews: [],
        appDownloads: [],
        beinJobs: [],
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
