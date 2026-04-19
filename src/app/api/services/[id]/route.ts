import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emitSync } from '@/lib/socket-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const service = await db.service.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { sessionDate: 'desc' }, take: 10 },
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('GET service by id error:', error)
    return NextResponse.json({ error: 'خطأ في جلب بيانات الخدمة' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const service = await db.service.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        duration: body.duration !== undefined ? (body.duration ? parseInt(body.duration) : null) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    })

    emitSync('service:updated', { service })

    return NextResponse.json({ service })
  } catch (error: unknown) {
    console.error('PUT service error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to update not found')
      ? 'الخدمة غير موجودة'
      : 'خطأ في تحديث الخدمة'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if service has active sessions
    const activeSessions = await db.session.count({
      where: { serviceId: id, status: 'scheduled' },
    })

    if (activeSessions > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف الخدمة لوجود ${activeSessions} جلسة مجدولة مرتبطة بها` },
        { status: 400 }
      )
    }

    await db.service.delete({ where: { id } })

    emitSync('service:deleted', { serviceId: id })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE service error:', error)
    const errMsg = error instanceof Error ? error.message : String(error)
    const msg = errMsg.includes('Record to delete not found')
      ? 'الخدمة غير موجودة'
      : 'خطأ في حذف الخدمة'
    return NextResponse.json({ error: msg, debug: errMsg }, { status: 500 })
  }
}
