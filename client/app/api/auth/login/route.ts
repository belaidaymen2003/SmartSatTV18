import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma/index.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let match = false
    try {
      if (user.passwordHash.startsWith('$2')) {
        match = await bcrypt.compare(password, user.passwordHash)
      } else {
        // legacy plaintext password in DB — accept and rehash
        match = password === user.passwordHash
        if (match) {
          // rehash and store asynchronously
          const newHash = await bcrypt.hash(password, 10)
          await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } })
        }
      }
    } catch (e) {
      // fallback
      match = false
    }

    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign({ sub: user.id, email: user.email, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    })

    await prisma.user.update({ where: { id: user.id }, data: { auth: 'CONNECTED', authLastAt: new Date() } })

    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, credits: user.credits } })
    // Use SameSite=None and Secure to allow cookie to be set in preview/proxy environments (cross-site)
    res.cookies.set('token', token, { httpOnly: true, sameSite: 'none', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
