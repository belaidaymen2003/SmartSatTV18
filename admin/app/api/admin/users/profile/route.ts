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
          userSubscriptions: {
            include: {
              subscription: {
                include: {
                  channel: true,
                },
              },
            },
            orderBy: { startDate: 'desc' },
          },
          downloadedApps: {
            include: {
              app: true,
            },
            orderBy: { purchasedAt: 'desc' },
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
          subscriptions: user.userSubscriptions.length,
          appDownloads: user.downloadedApps.length,
          beinJobs: user.beinJobs.length,
        },
        subscriptions: user.userSubscriptions.map(sub => ({
          id: sub.id,
          channelName: sub.subscription.channel.name,
          channelCategory: sub.subscription.channel.category,
          duration: sub.subscription.duration,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          credit: sub.subscription.credit,
        })),
        appDownloads: user.downloadedApps.map(userApp => ({
          id: userApp.app.id,
          name: userApp.app.name,
          description: userApp.app.description,
          version: userApp.app.version,
          purchasedAt: userApp.purchasedAt,
          createdAt: userApp.app.createdAt,
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
      
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
