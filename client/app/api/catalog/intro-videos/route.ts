import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const videos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        videoUrl: true,
        price: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    })

    return NextResponse.json({ videos })
  } catch (err: any) {
    console.error('INTRO VIDEOS API ERROR', err?.message || err)
    return NextResponse.json({ videos: [], error: err?.message || String(err) }, { status: 500 })
  }
}
