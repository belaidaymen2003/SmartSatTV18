import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const channelId = parseInt(params.channelId)
    if (!Number.isFinite(channelId)) {
      return NextResponse.json({ error: 'Invalid channelId' }, { status: 400 })
    }

    const statusFilter = (req.nextUrl.searchParams.get('status') || 'ACTIVE').toUpperCase()

    const subscriptions = await prisma.subscription.findMany({
      where: {
        channelId,
        status: statusFilter as any
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ subscriptions, total: subscriptions.length })
  } catch (err: any) {
    console.error('SUBSCRIPTIONS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
