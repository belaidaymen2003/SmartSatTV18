import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../admin/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(10, Math.max(1, Number(searchParams.get('limit') || 5)))
    const featured = searchParams.get('featured') === 'true'

    if (featured) {
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
        take: 1,
      })

      if (videos.length === 0) {
        return NextResponse.json({
          featured: null,
          videos: [],
        })
      }

      return NextResponse.json({
        featured: videos[0],
        videos,
      })
    }

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
      take: limit,
    })

    return NextResponse.json({ videos, total: videos.length })
  } catch (err: any) {
    console.error('VIDEOS API ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
