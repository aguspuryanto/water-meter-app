import { supabase } from '../lib/supabase'
import type { Warga, MeterReading } from '../types'

export const wargaApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('warga').select('*').order('blok')
    if (error) throw error
    return data as Warga[]
  },
  create: async (warga: Omit<Warga, 'id'>) => {
    const { data, error } = await supabase.from('warga').insert(warga).select().single()
    if (error) throw error
    return data
  },
  createMany: async (wargas: Omit<Warga, 'id'>[]) => {
    const { data, error } = await supabase.from('warga').insert(wargas).select()
    if (error) throw error
    return data
  },
  update: async (id: string, warga: Partial<Warga>) => {
    const { data, error } = await supabase.from('warga').update(warga).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('warga').delete().eq('id', id)
    if (error) throw error
  },
}

export const readingApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*, warga(*)')
      .order('tahun', { ascending: true })
      .order('bulan', { ascending: true })
    if (error) throw error
    return data
  },
  getByWarga: async (wargaId: string) => {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*')
      .eq('warga_id', wargaId)
      .order('tahun', { ascending: true })
      .order('bulan', { ascending: true })
    if (error) throw error
    return data as MeterReading[]
  },
  upsert: async (reading: Omit<MeterReading, 'id'>) => {
    const { data, error } = await supabase
      .from('meter_readings')
      .upsert(reading, { onConflict: 'warga_id, bulan, tahun' })
      .select()
      .single()
    if (error) throw error
    return data
  },
}