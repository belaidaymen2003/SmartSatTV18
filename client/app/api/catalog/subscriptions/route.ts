import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const id = searchParams.get('id')
    if (id) {
      const sid = Number(id)
      if (!Number.isFinite(sid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
      const sub = await prisma.subscription.findUnique({ where: { id: sid } as any, include: { user: true, channel: true } })
      if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ subscription: sub })
    }

    if (channelId) {
      const cid = Number(channelId)
      if (!Number.isFinite(cid)) return NextResponse.json({ error: 'Invalid channelId' }, { status: 400 })
      const subs = await prisma.subscription.findMany({ where: { channelId: cid }, include: { user: true } })
      return NextResponse.json({ subscriptions: subs })
    }

    const subs = await prisma.subscription.findMany({ include: { user: true, channel: true }, orderBy: { startDate: 'desc' } })
    return NextResponse.json({ subscriptions: subs })
  } catch (err: any) {
    console.error('SUBSCRIPTIONS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
