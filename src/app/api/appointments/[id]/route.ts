import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, gender: true, age: true, fileNumber: true },
        },
      },
    })
    if (!appointment) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    return NextResponse.json({ appointment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        ...(body.appointmentDate !== undefined && { appointmentDate: new Date(body.appointmentDate) }),
        ...(body.duration !== undefined && { duration: parseInt(body.duration) }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod || null }),
        ...(body.paymentStatus !== undefined && { paymentStatus: body.paymentStatus }),
        ...(body.amount !== undefined && { amount: body.amount !== null ? parseFloat(body.amount) : null }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.reminderSent !== undefined && { reminderSent: body.reminderSent }),
        ...(body.whatsappSent !== undefined && { whatsappSent: body.whatsappSent }),
      },
      include: {
        patient: {
          select: { id: true, name: true, phone: true, gender: true, age: true, fileNumber: true },
        },
      },
    })
    return NextResponse.json({ appointment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.appointment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
