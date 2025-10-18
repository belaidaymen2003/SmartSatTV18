import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 12)))

    const and: any[] = []
    if (q) and.push({ title: { contains: q, mode: 'insensitive' } })

    const where = and.length ? { AND: and } : {}

    // Try standard prisma query first. If the DB schema is missing some columns (e.g. userId),
    // fall back to raw SQL selecting only known columns to avoid crashing.
    try {
      const [total, videos] = await Promise.all([
        prisma.video.count({ where }),
        prisma.video.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      ])
      return NextResponse.json({ videos, total, page, pageSize })
    } catch (err: any) {
      console.error('STREAMING API (prisma) ERROR, falling back to raw SQL:', err?.message || err)
      // Fallback: select explicit columns that are expected to exist in older schemas
      try {
        const offset = (page - 1) * pageSize
        const videos: any[] = await prisma.$queryRaw`
          SELECT id, title, description, thumbnail, "videoUrl", price, "createdAt", "updatedAt"
          FROM "Video"
          ${prisma.raw(`ORDER BY "createdAt" DESC LIMIT ${pageSize} OFFSET ${offset}`)}
        `

        const countRaw: any = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "Video"`
        const total = Array.isArray(countRaw) && countRaw[0] && (countRaw[0].count ?? countRaw[0].COUNT) ? Number(countRaw[0].count ?? countRaw[0].COUNT) : videos.length
        return NextResponse.json({ videos, total, page, pageSize, fallback: true })
      } catch (err2: any) {
        console.error('STREAMING API fallback failed:', err2?.message || err2)
        return NextResponse.json({ error: err2?.message || String(err2) }, { status: 500 })
      }
    }
  } catch (err: any) {
    console.error('STREAMING API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
