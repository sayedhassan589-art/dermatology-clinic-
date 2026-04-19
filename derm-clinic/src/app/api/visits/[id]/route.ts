import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const visit = await db.visit.findUnique({
      where: { id },
      include: {
        patient: true,
        creator: { select: { id: true, name: true } },
      },
    })

    if (!visit) {
      return NextResponse.json({ error: 'الزيارة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ visit })
  } catch (error) {
    console.error('GET visit by id error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات الزيارة' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const visit = await db.visit.update({
      where: { id },
      data: {
        doctorId: body.doctorId,
        visitDate: body.visitDate ? new Date(body.visitDate) : undefined,
        visitType: body.visitType,
        diagnosis: body.diagnosis,
        prescription: body.prescription,
        examination: body.examination,
        fees: body.fees !== undefined ? (body.fees ? parseFloat(body.fees) : null) : undefined,
        paidAmount: body.paidAmount !== undefined ? parseFloat(body.paidAmount) : undefined,
        notes: body.notes,
      },
      include: { patient: true },
    })

    emitSync('visit:updated', { visit, userId: body.userId })

    return NextResponse.json({ visit })
  } catch (error: unknown) {
    console.error('PUT visit error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to update not found')
      ? 'الزيارة غير موجودة'
      : 'خطأ في تحديث الزيارة'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.visit.delete({ where: { id } })

    emitSync('visit:deleted', { visitId: id })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE visit error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to delete not found')
      ? 'الزيارة غير موجودة'
      : 'خطأ في حذف الزيارة'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}
