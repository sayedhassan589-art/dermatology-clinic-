import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')
    const durationParam = searchParams.get('duration')

    if (!dateStr) {
      return NextResponse.json({ error: 'يرجى تحديد التاريخ' }, { status: 400 })
    }

    const date = new Date(dateStr)
    // Friday = 5 in JS getDay()
    if (date.getDay() === 5) {
      return NextResponse.json({ slots: [], message: 'العيادة مغلقة يوم الجمعة' })
    }

    const SLOT_DURATION = durationParam ? parseInt(durationParam) : 20
    const START_HOUR = 13 // 1 PM
    const END_HOUR = 21 // 9 PM

    // Generate all possible slots
    const allSlots: { time: string; hour: number; minute: number; display: string; available: boolean }[] = []
    for (let h = START_HOUR; h < END_HOUR; h++) {
      for (let m = 0; m < 60; m += SLOT_DURATION) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        const endH = h + Math.floor((m + SLOT_DURATION) / 60)
        const endM = (m + SLOT_DURATION) % 60
        // Don't go past 9 PM
        if (endH > END_HOUR || (endH === END_HOUR && endM > 0)) break

        const hour12 = h > 12 ? h - 12 : h
        const endHour12 = endH > 12 ? endH - 12 : endH
        const ampm = h >= 12 ? 'م' : 'ص'
        const display = `${hour12}:${String(m).padStart(2, '0')} ${ampm} - ${endHour12}:${String(endM).padStart(2, '0')} ${ampm}`

        allSlots.push({ time: timeStr, hour: h, minute: m, display, available: true })
      }
    }

    // Get existing appointments for this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await db.appointment.findMany({
      where: {
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['pending', 'confirmed'] },
      },
      select: { appointmentDate: true, duration: true },
    })

    // Mark booked slots
    for (const appt of existingAppointments) {
      const apptStart = new Date(appt.appointmentDate)
      const apptHour = apptStart.getHours()
      const apptMinute = apptStart.getMinutes()
      const apptDuration = appt.duration || 20
      const apptEndMinutes = apptHour * 60 + apptMinute + apptDuration

      for (const slot of allSlots) {
        const slotStartMinutes = slot.hour * 60 + slot.minute
        const slotEndMinutes = slotStartMinutes + SLOT_DURATION
        // Check overlap
        if (slotStartMinutes < apptEndMinutes && slotEndMinutes > apptHour * 60 + apptMinute) {
          slot.available = false
        }
      }
    }

    return NextResponse.json({ slots: allSlots })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
