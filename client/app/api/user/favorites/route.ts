import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma/index.js'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
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
    const apps = await prisma.catalogApp.findMany({ where: { userId: Number(payload.sub) }, select: { id: true, name: true, image: true, createdAt: true } })

    return NextResponse.json({ favorites: { videos, apps } })
  } catch (error: any) {
    return NextResponse.json({ favorites: { videos: [], apps: [] } })
  }
}
