import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { jwtDecode } from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = parseInt(params.id, 10)
    if (isNaN(appId)) {
      return NextResponse.json({ error: 'Invalid app ID' }, { status: 400 })
    }

    const app = await prisma.catalogApp.findUnique({
      where: { id: appId }
    })

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    let isOwned = false
    try {
      const token = req.cookies.get('token')?.value
      if (token) {
        const decoded: any = jwtDecode(token)
        if (decoded?.userId) {
          const userApp = await prisma.catalogApp.findFirst({
            where: {
              id: appId,
              userId: decoded.userId
            }
          })
          isOwned = !!userApp
        }
      }
    } catch (e) {
      // Ignore token decode errors
    }

    return NextResponse.json({ app, isOwned })
  } catch (err: any) {
    console.error('GET APP ERROR', err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
