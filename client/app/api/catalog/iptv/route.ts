import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 12)))

    const and: any[] = []
    if (q) and.push({ name: { contains: q, mode: 'insensitive' } })
    if (category && category !== 'all') and.push({ category: category.toUpperCase() })

    const where = and.length ? { AND: and } : {}

    const [total, channels] = await Promise.all([
      prisma.iPTVChannel.count({ where }),
      prisma.iPTVChannel.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ])

    return NextResponse.json({ channels, total, page, pageSize })
  } catch (err: any) {
    console.error('IPTV API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
