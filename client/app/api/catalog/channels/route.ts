import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (id) {
      const cid = Number(id)
      if (!Number.isFinite(cid)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
      }
      const channel = await prisma.iPTVChannel.findUnique({
        where: { id: cid },
        include: { subscriptions: true }
      })
      if (!channel) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json({ channel })
    }

    const q = (searchParams.get('q') || '').trim()
    const rawCategory = (searchParams.get('category') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 12)))

    const and: any[] = []
    
    if (q) {
      and.push({ name: { contains: q, mode: 'insensitive' } })
    }

    if (rawCategory) {
      const lc = rawCategory.toLowerCase()
      if (lc === 'iptv') {
        and.push({ category: 'IPTV' })
      } else if (lc === 'streaming') {
        and.push({ category: 'STREAMING' })
      }
    }

    const where = and.length ? { AND: and } : {}

    const [total, channels] = await Promise.all([
      prisma.iPTVChannel.count({ where }),
      prisma.iPTVChannel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { subscriptions: true }
      }),
    ])

    return NextResponse.json({ channels, total, page, pageSize })
  } catch (err: any) {
    console.error('CHANNELS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
