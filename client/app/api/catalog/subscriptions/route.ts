import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channelId')
    const id = searchParams.get('id')
    if (id) {
      const sid = Number(id)
      if (!Number.isFinite(sid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
      const sub = await prisma.subscription.findUnique({ where: { id: sid } as any, select: { id: true, credit: true, code: true, channelId: true, duration: true, status: true, createAt: true, updatedAt: true } })
      if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      // try to fetch channel info without relying on relation joins
      const channel = sub.channelId ? await prisma.iPTVChannel.findUnique({ where: { id: sub.channelId } as any, select: { id: true, name: true, logo: true, description: true, type: true } }) : null
      return NextResponse.json({ subscription: { ...sub, channel } })
    }

    if (channelId) {
      const cid = Number(channelId)
      if (!Number.isFinite(cid)) return NextResponse.json({ error: 'Invalid channelId' }, { status: 400 })
      const subs = await prisma.subscription.findMany({ where: { channelId: cid }, select: { id: true, credit: true, code: true, channelId: true, duration: true, status: true, createAt: true, updatedAt: true } })
      return NextResponse.json({ subscriptions: subs })
    }

    const subs = await prisma.subscription.findMany({ select: { id: true, credit: true, code: true, channelId: true, duration: true, status: true, createAt: true, updatedAt: true }, orderBy: { startDate: 'desc' } })
    // fetch channel data for listed subscriptions
    const channelIds = Array.from(new Set(subs.map(s => s.channelId).filter(Boolean)))
    const channels = channelIds.length ? await prisma.iPTVChannel.findMany({ where: { id: { in: channelIds } }, select: { id: true, name: true, logo: true, description: true, type: true } }) : []
    const channelMap: Record<number, any> = {}
    channels.forEach(c => { channelMap[c.id] = c })
    const enriched = subs.map(s => ({ ...s, channel: channelMap[s.channelId] ?? null }))
    return NextResponse.json({ subscriptions: enriched })
  } catch (err: any) {
    console.error('SUBSCRIPTIONS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
