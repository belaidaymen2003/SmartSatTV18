import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../admin/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ favorites: [] })

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ favorites: [] })
    }

    // No explicit favorites model in schema. Fallback: return user's videos and apps as 'favorites' preview
    const videos = await prisma.video.findMany({ where: { userId: Number(payload.sub) }, select: { id: true, title: true, thumbnail: true, createdAt: true } })
    const apps = await prisma.catalogApp.findMany({ where: { downloadedBy:{some : {id: Number(payload.sub)}} }, select: { id: true, name: true, image: true, createdAt: true } })

    return NextResponse.json({ favorites: { videos, apps } })
  } catch (error: any) {
    return NextResponse.json({ favorites: { videos: [], apps: [] } })
  }
}
