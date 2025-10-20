import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma/index.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || ''

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) }, select: { id: true, name: true, email: true, username: true, credits: true } })
    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, username, password } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (username) updateData.username = username
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10)

    try {
      const user = await prisma.user.update({ where: { id: Number(payload.sub) }, data: updateData, select: { id: true, name: true, email: true, username: true, credits: true } })
      return NextResponse.json({ user })
    } catch (e: any) {
      if (e.code === 'P2002') return NextResponse.json({ error: 'Email or username already in use' }, { status: 409 })
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
