import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || ''

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      const res = NextResponse.json({ message: 'Logged out' })
      res.cookies.set('token', '', { httpOnly: true, sameSite: 'none', secure: true, path: '/', maxAge: 0 })
      return res
    }

    try {
      const payload: any = jwt.verify(token, JWT_SECRET)
      if (payload?.sub) {
        await prisma.user.update({ where: { id: payload.sub }, data: { auth: 'DISCONNECTED' } })
      }
    } catch (e) {
      // ignore
    }

    const res = NextResponse.json({ message: 'Logged out' })
    res.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 })
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
