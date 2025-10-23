import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../../admin/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 12)))

    const minCredit = searchParams.get('minCredit')
    const maxCredit = searchParams.get('maxCredit')
    const version = (searchParams.get('version') || '').trim()
    const platforms = (searchParams.get('platforms') || '').trim()
    const internet = searchParams.get('internet')
    const minStorage = searchParams.get('minStorage')
    const maxStorage = searchParams.get('maxStorage')
    const sortBy = (searchParams.get('sortBy') || 'newest').trim()
    const sortDir = (searchParams.get('sortDir') || 'desc').trim() as 'asc' | 'desc'

    const and: any[] = []
    if (q) and.push({ name: { contains: q, mode: 'insensitive' } })

    if (minCredit) and.push({ credit: { gte: Number(minCredit) } })
    if (maxCredit) and.push({ credit: { lte: Number(maxCredit) } })
    if (version) and.push({ version: { contains: version, mode: 'insensitive' } })

    if (platforms) {
      const pls = platforms.split(',').map(s => s.trim()).filter(Boolean)
      if (pls.length) and.push({ deviceOperatingSystems: { hasSome: pls } })
    }

    if (internet === 'true') and.push({ internetConnection: true })
    else if (internet === 'false') and.push({ internetConnection: false })

    if (minStorage) and.push({ storageRequired: { gte: Number(minStorage) } })
    if (maxStorage) and.push({ storageRequired: { lte: Number(maxStorage) } })

    const where = and.length ? { AND: and } : {}

    const orderBy: any[] = []
    if (sortBy === 'price') orderBy.push({ credit: sortDir })
    else if (sortBy === 'name') orderBy.push({ name: sortDir })
    else if (sortBy === 'version') orderBy.push({ version: sortDir })
    else orderBy.push({ createdAt: 'desc' })

    const [total, apps] = await Promise.all([
      prisma.catalogApp.count({ where }),
      prisma.catalogApp.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    ])

    return NextResponse.json({ apps, total, page, pageSize })
  } catch (err: any) {
    console.error('APPS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
