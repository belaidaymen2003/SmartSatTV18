import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/generated/prisma'

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
    const rawType = (searchParams.get('type') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 12)))

    // Advanced filters
    const minCredit = searchParams.get('minCredit')
    const maxCredit = searchParams.get('maxCredit')
    const duration = (searchParams.get('duration') || '').trim()
    const sortBy = (searchParams.get('sortBy') || 'newest').trim()
    const sortDir = (searchParams.get('sortDir') || 'desc').trim() as 'asc' | 'desc'

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

    if (rawType) {
      // Accept comma separated types
      const types = rawType.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
      if (types.length === 1) {
        and.push({ type: types[0] })
      } else if (types.length > 1) {
        and.push({ type: { in: types } })
      }
    }

    // Filter by subscription credits (min/max) or duration
    if (minCredit || maxCredit || duration) {
      const subWhere: any = {}
      if (minCredit) subWhere.credit = { gte: Number(minCredit) }
      if (maxCredit) subWhere.credit = { ...(subWhere.credit || {}), lte: Number(maxCredit) }
      if (duration) subWhere.duration = duration
      // require at least one subscription matching
      and.push({ subscriptions: { some: subWhere } })
    }

    const where = and.length ? { AND: and } : {}

    // Build orderBy
    const orderBy: any[] = []
    if (sortBy === 'price') {
      // order by minimal subscription credit when ascending, or maximal when descending
      if (sortDir === 'asc') orderBy.push({ subscriptions: { _min: { credit: 'asc' } } })
      else orderBy.push({ subscriptions: { _max: { credit: 'desc' } } })
    } else if (sortBy === 'name') {
      orderBy.push({ name: sortDir })
    } else if (sortBy === 'rating') {
      // rating is not stored on channel; fallback to createdAt
      orderBy.push({ createdAt: sortDir })
    } else {
      orderBy.push({ createdAt: 'desc' })
    }

    const [total, channels] = await Promise.all([
      prisma.iPTVChannel.count({ where }),
      prisma.iPTVChannel.findMany({
        where,
        orderBy,
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
