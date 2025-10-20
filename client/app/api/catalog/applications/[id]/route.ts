import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../admin/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

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
        const payload: any = jwt.verify(token, JWT_SECRET)
        const userId = Number(payload.sub)
        if (userId) {
          const userApp = await prisma.userCatalogApp.findUnique({
            where: {
              userId_appId: {
                userId: userId,
                appId: appId
              }
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
