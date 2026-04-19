import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Default laser settings to seed
const DEFAULT_SETTINGS = [
  { settingKey: 'default_machine', settingValue: 'Soprano Titanium', settingType: 'text', category: 'machine' },
  { settingKey: 'default_energy', settingValue: '10', settingType: 'number', category: 'treatment' },
  { settingKey: 'default_pulse', settingValue: '15', settingType: 'number', category: 'treatment' },
  { settingKey: 'default_spot_size', settingValue: '15', settingType: 'number', category: 'treatment' },
  { settingKey: 'default_freeze', settingValue: 'DCC', settingType: 'text', category: 'treatment' },
  { settingKey: 'session_interval_days', settingValue: '30', settingType: 'number', category: 'scheduling' },
  { settingKey: 'default_total_sessions', settingValue: '8', settingType: 'number', category: 'treatment' },
  { settingKey: 'reminder_days_before', settingValue: '3', settingType: 'number', category: 'notifications' },
  { settingKey: 'currency', settingValue: 'جنيه', settingType: 'text', category: 'general' },
  { settingKey: 'clinic_name', settingValue: 'عيادة المغازى', settingType: 'text', category: 'general' },
  { settingKey: 'skin_types', settingValue: '1,2,3,4,5,6', settingType: 'list', category: 'treatment' },
  { settingKey: 'hair_colors', settingValue: 'أسود,بني,أشقر,أحمر,رمادي,أبيض', settingType: 'list', category: 'treatment' },
  { settingKey: 'energy_levels', settingValue: '6,8,10,12,14,16,18,20', settingType: 'list', category: 'treatment' },
  { settingKey: 'pulse_durations', settingValue: '10,15,20,25,30,35,40', settingType: 'list', category: 'treatment' },
  { settingKey: 'spot_sizes', settingValue: '8,10,12,15,18,20,25', settingType: 'list', category: 'treatment' },
]

export async function GET() {
  try {
    let settings = await db.laserSetting.findMany()
    if (settings.length === 0) {
      await db.laserSetting.createMany({ data: DEFAULT_SETTINGS })
      settings = await db.laserSetting.findMany()
    }
    const settingsMap: Record<string, any> = {}
    for (const s of settings) {
      if (s.settingType === 'number') {
        settingsMap[s.settingKey] = parseFloat(s.settingValue) || 0
      } else if (s.settingType === 'list') {
        settingsMap[s.settingKey] = s.settingValue.split(',').map(v => v.trim())
      } else if (s.settingType === 'boolean') {
        settingsMap[s.settingKey] = s.settingValue === 'true'
      } else {
        settingsMap[s.settingKey] = s.settingValue
      }
    }
    return NextResponse.json({ settings: settingsMap, rawSettings: settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { settings } = body

    const results = []
    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.laserSetting.findUnique({ where: { settingKey: key } })
      if (existing) {
        const strValue = Array.isArray(value) ? value.join(',') : String(value)
        const type = existing.settingType
        if (type === 'number') {
          await db.laserSetting.update({ where: { settingKey: key }, data: { settingValue: strValue } })
        } else if (type === 'boolean') {
          await db.laserSetting.update({ where: { settingKey: key }, data: { settingValue: String(value) } })
        } else {
          await db.laserSetting.update({ where: { settingKey: key }, data: { settingValue: strValue } })
        }
      } else {
        await db.laserSetting.create({
          data: {
            settingKey: key,
            settingValue: Array.isArray(value) ? value.join(',') : String(value),
            settingType: typeof value === 'number' ? 'number' : 'text',
            category: 'custom',
          }
        })
      }
      results.push(key)
    }

    return NextResponse.json({ success: true, updated: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
