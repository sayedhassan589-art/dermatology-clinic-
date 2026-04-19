import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where: any = {}
    if (status) where.status = status
    if (date) {
      const start = new Date(date)
      const end = new Date(date + 'T23:59:59.999Z')
      where.arrivedAt = { gte: start, lte: end }
    }

    const queue = await db.waitingQueue.findMany({
      where,
      include: { patient: { select: { id: true, name: true, phone: true } } },
      orderBy: [{ priority: 'desc' }, { arrivedAt: 'asc' }],
    })

    return NextResponse.json({ queue })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId, reason, priority, notes, createdBy } = body

    if (!patientId) {
      return NextResponse.json({ error: 'يرجى اختيار المريض' }, { status: 400 })
    }

    const item = await db.waitingQueue.create({
      data: {
        patientId,
        reason: reason || null,
        priority: priority ? parseInt(priority) : 0,
        notes: notes || null,
        createdBy,
      },
      include: { patient: true },
    })

    return NextResponse.json({ queueItem: item }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
