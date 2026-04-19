import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const packages = await db.laserPackage.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ packages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, bodyArea, sessions, price } = body

    if (!name || !bodyArea || !sessions || !price) {
      return NextResponse.json({ error: 'يرجى إدخال جميع البيانات المطلوبة' }, { status: 400 })
    }

    const pkg = await db.laserPackage.create({
      data: {
        name,
        description: description || null,
        bodyArea,
        sessions: parseInt(sessions),
        price: parseFloat(price),
      },
    })

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
