import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const updateData: any = {}
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'in-progress') updateData.startedAt = new Date()
      if (body.status === 'completed') updateData.completedAt = new Date()
    }
    if (body.priority !== undefined) updateData.priority = parseInt(body.priority)
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.reason !== undefined) updateData.reason = body.reason

    const item = await db.waitingQueue.update({
      where: { id },
      data: updateData,
      include: { patient: true },
    })

    return NextResponse.json({ queueItem: item })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.waitingQueue.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
