import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma/index.js'
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 12)))

    const and: any[] = []
    if (q) and.push({ name: { contains: q, mode: 'insensitive' } })

    const where = and.length ? { AND: and } : {}

    const [total, apps] = await Promise.all([
      prisma.catalogApp.count({ where }),
      prisma.catalogApp.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ])

    return NextResponse.json({ apps, total, page, pageSize })
  } catch (err: any) {
    console.error('APPS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
