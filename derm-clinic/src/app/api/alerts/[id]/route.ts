import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const alert = await db.alert.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'التنبيه غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('GET alert by id error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات التنبيه' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const alert = await db.alert.update({
      where: { id },
      data: {
        title: body.title,
        message: body.message,
        alertDate: body.alertDate ? new Date(body.alertDate) : undefined,
        isRead: body.isRead !== undefined ? body.isRead : undefined,
        alertType: body.alertType,
      },
      include: { patient: { select: { id: true, name: true } } },
    })

    emitSync('alert:updated', { alert })

    return NextResponse.json({ alert })
  } catch (error: unknown) {
    console.error('PUT alert error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to update not found')
      ? 'التنبيه غير موجود'
      : 'خطأ في تحديث التنبيه'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.alert.delete({ where: { id } })

    emitSync('alert:deleted', { alertId: id })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE alert error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to delete not found')
      ? 'التنبيه غير موجود'
      : 'خطأ في حذف التنبيه'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}
