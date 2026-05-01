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

// Seed data for initial warga population
export const WARGA_SEED_DATA: Omit<Warga, 'id'>[] = [
  { blok: 'B01', nama: 'P. Pras/Katim' },
  { blok: 'B02', nama: 'P. Richard' },
  { blok: 'B03', nama: 'P. Farid' },
  { blok: 'B05', nama: 'P. P. Yoyok' },
  { blok: 'B07', nama: 'P. Hendra' },
  { blok: 'B08', nama: 'P. Agus' },
  { blok: 'B09', nama: 'P. Rizky' },
  { blok: 'B10', nama: 'P. Junaidi' },
  { blok: 'B11', nama: 'P. Hendrawan' },
  { blok: 'B12', nama: 'P. Daud' },
  { blok: 'B14', nama: 'P. Joko' },
  { blok: 'B15', nama: 'P. Dedi' },
  { blok: 'B16', nama: 'P. Bendra' },
  { blok: 'B17', nama: 'P. Andik' },
  { blok: 'B20', nama: 'P. Wito' },
  { blok: 'B21', nama: 'P. Endro' },
  { blok: 'B22', nama: 'P. Andre' },
  { blok: 'B23', nama: 'P. Robby' },
  { blok: 'B24', nama: 'P. Gita' },
  { blok: 'B25', nama: 'P. Andri' },
  { blok: 'B26', nama: 'P. Sunari' },
  { blok: 'B28', nama: 'P. Eko' },
]