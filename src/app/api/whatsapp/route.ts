import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId, message, type } = body

    if (!patientId) {
      return NextResponse.json({ error: 'يرجى اختيار المريض' }, { status: 400 })
    }

    const patient = await db.patient.findUnique({ where: { id: patientId } })
    if (!patient) {
      return NextResponse.json({ error: 'المريض غير موجود' }, { status: 404 })
    }

    const phone = patient.phone?.replace(/\D/g, '') || ''
    if (!phone) {
      return NextResponse.json({ error: 'لا يوجد رقم هاتف للمريض' }, { status: 400 })
    }

    const egyptPhone = phone.startsWith('0') ? '20' + phone.slice(1) : phone
    const defaultMessage = message || 'مرحباً، نتمنى لكم الشفاء العاجل. عيادة المغازى'

    const encodedMessage = encodeURIComponent(defaultMessage)
    const whatsappUrl = `https://wa.me/${egyptPhone}?text=${encodedMessage}`

    const templates = [
      { type: 'reminder', message: 'مرحباً، تذكير بموعدكم القادم في عيادة المغازى. نتمنى لكم الشفاء العاجل.' },
      { type: 'appointment', message: 'مرحباً، تم تأكيد موعدكم في عيادة المغازى. في انتظاركم!' },
      { type: 'followup', message: 'مرحباً، نتمنى أن تكونوا بأفضل حال. متابعة معكم من عيادة المغازى.' },
      { type: 'payment', message: 'مرحباً، تذكير بوجود مبلغ متبقي. عيادة المغازى.' },
    ]

    return NextResponse.json({ url: whatsappUrl, phone: egyptPhone, templates })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  const templates = [
    { type: 'reminder', label: 'تذكير بموعد', message: 'مرحباً، تذكير بموعدكم القادم في عيادة المغازى. نتمنى لكم الشفاء العاجل.' },
    { type: 'appointment', label: 'تأكيد موعد', message: 'مرحباً، تم تأكيد موعدكم في عيادة المغازى. في انتظاركم!' },
    { type: 'followup', label: 'متابعة', message: 'مرحباً، نتمنى أن تكونوا بأفضل حال. متابعة معكم من عيادة المغازى.' },
    { type: 'payment', label: 'تذكير بدفعة', message: 'مرحباً، تذكير بوجود مبلغ متبقي. عيادة المغازى.' },
    { type: 'custom', label: 'رسالة مخصصة', message: '' },
  ]

  return NextResponse.json({ templates })
}
