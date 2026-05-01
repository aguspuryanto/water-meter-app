import { z } from 'zod'

export const wargaSchema = z.object({
  id: z.string().uuid().optional(),
  blok: z.string().min(1, "Blok wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
})

export const meterReadingSchema = z.object({
  warga_id: z.string().uuid(),
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().default(2026),
  meteran: z.number().int().min(0, "Meteran tidak boleh negatif"),
})

export type Warga = z.infer<typeof wargaSchema> & { id: string; created_at?: string }
export type MeterReading = z.infer<typeof meterReadingSchema> & { id: string; created_at?: string }