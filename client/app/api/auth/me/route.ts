import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ user: null })

    try {
      const payload: any = jwt.verify(token, JWT_SECRET)
      if (!payload?.sub) return NextResponse.json({ user: null })

      const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) }, select: { id: true, name: true, email: true, username: true, credits: true, status: true } })
      if (!user) return NextResponse.json({ user: null })

      return NextResponse.json({ user })
    } catch (err) {
      return NextResponse.json({ user: null })
    }
  } catch (error: any) {
    return NextResponse.json({ user: null })
  }
}
