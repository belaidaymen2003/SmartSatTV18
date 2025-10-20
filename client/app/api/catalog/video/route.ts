import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const vid = Number(id)
    if (!Number.isFinite(vid)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const video = await prisma.video.findUnique({ where: { id: vid } })
    if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ video })
  } catch (err: any) {
    console.error('VIDEO API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
