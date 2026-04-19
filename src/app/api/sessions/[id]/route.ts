import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await db.session.findUnique({
      where: { id },
      include: {
        patient: true,
        service: true,
        creator: { select: { id: true, name: true } },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('GET session by id error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات الجلسة' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const session = await db.session.update({
      where: { id },
      data: {
        doctorId: body.doctorId,
        serviceId: body.serviceId,
        status: body.status,
        sessionDate: body.sessionDate ? new Date(body.sessionDate) : undefined,
        notes: body.notes,
        totalPrice: body.totalPrice !== undefined ? (body.totalPrice ? parseFloat(body.totalPrice) : null) : undefined,
        paidAmount: body.paidAmount !== undefined ? parseFloat(body.paidAmount) : undefined,
      },
      include: { patient: true, service: true },
    })

    emitSync('session:updated', { session, userId: body.userId })

    return NextResponse.json({ session })
  } catch (error: unknown) {
    console.error('PUT session error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to update not found')
      ? 'الجلسة غير موجودة'
      : 'خطأ في تحديث الجلسة'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.session.delete({ where: { id } })

    emitSync('session:deleted', { sessionId: id })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE session error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to delete not found')
      ? 'الجلسة غير موجودة'
      : 'خطأ في حذف الجلسة'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}
