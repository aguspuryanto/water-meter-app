import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { readingApi, wargaApi } from '../services/api'
import { Copy, Check, Send } from 'lucide-react'

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const TAHUN = new Date().getFullYear()

// Blok yang tidak menggunakan air — nilai laporan selalu 1
const BLOK_TETAP_SATU = [16, 21, 24]

const getBlokNumber = (blok: string) => {
  const match = blok.match(/B(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

type Row = {
  wargaId: string
  blok: string
  nama: string
  usage: number | 'xx'
}

export default function Laporan() {
  const now = new Date()
  // Periode laporan = bulan sebelumnya (di Juli, laporan periode Juni)
  const defaultPeriode = now.getMonth() === 0 ? 12 : now.getMonth()
  const [periode, setPeriode] = useState(defaultPeriode)
  const [manualBold, setManualBold] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const { data: wargas, isLoading: loadingWarga } = useQuery({ queryKey: ['warga'], queryFn: wargaApi.getAll })
  const { data: readings, isLoading: loadingReadings } = useQuery({ queryKey: ['readings'], queryFn: readingApi.getAll })

  const rows: Row[] = useMemo(() => {
    if (!wargas || !readings) return []

    const meterByWarga = new Map<string, Map<number, number>>()
    readings.forEach((r: any) => {
      if (r.tahun !== TAHUN) return
      if (!meterByWarga.has(r.warga_id)) meterByWarga.set(r.warga_id, new Map())
      meterByWarga.get(r.warga_id)!.set(r.bulan, r.meteran)
    })

    return [...wargas]
      .sort((a, b) => getBlokNumber(a.blok) - getBlokNumber(b.blok))
      .map((w) => {
        const blokNumber = getBlokNumber(w.blok)
        const cur = meterByWarga.get(w.id)?.get(periode)
        const prev = meterByWarga.get(w.id)?.get(periode - 1)
        let usage: number | 'xx' = cur !== undefined && prev !== undefined ? cur - prev : 'xx'
        if (BLOK_TETAP_SATU.includes(blokNumber) || usage === 0) usage = 1
        return {
          wargaId: w.id,
          blok: `B${blokNumber}`,
          nama: w.nama,
          usage,
        }
      })
  }, [wargas, readings, periode])

  const isBold = (row: Row) => row.usage === 'xx' || manualBold.has(row.wargaId)

  const text = useMemo(() => {
    const lines = rows.map((row) => {
      const sep = row.nama.length < 8 ? '\t\t' : '\t'
      const line = `${row.blok}\t${row.nama}${sep}${row.usage}`
      return isBold(row) ? `*${line}*` : line
    })
    return [
      'Assalamualaikum bpk2 warga GBR, ',
      `berikut Laporan Meteran Air Periode bulan ${NAMA_BULAN[periode - 1]} ${TAHUN}`,
      ...lines,
    ].join('\n')
  }, [rows, periode, manualBold])

  const toggleBold = (row: Row) => {
    if (row.usage === 'xx') return
    setManualBold((prev) => {
      const next = new Set(prev)
      if (next.has(row.wargaId)) next.delete(row.wargaId)
      else next.add(row.wargaId)
      return next
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loadingWarga || loadingReadings) return <div className="p-4">Memuat laporan...</div>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Laporan WA</h1>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-600">Periode:</label>
        <select
          value={periode}
          onChange={(e) => setPeriode(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {NAMA_BULAN.map((nama, i) => (
            <option key={i + 1} value={i + 1}>{nama} {TAHUN}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Pemakaian = meteran {NAMA_BULAN[periode - 1]} − meteran {NAMA_BULAN[(periode + 10) % 12]}.
        Baris tanpa data ditandai <b>xx</b>. Ketuk baris untuk menandai bold (*...*).
      </p>

      <div className="border rounded-lg bg-white shadow p-3 mb-4 text-sm font-mono whitespace-pre overflow-x-auto">
        <div>Assalamualaikum bpk2 warga GBR, </div>
        <div>berikut Laporan Meteran Air Periode bulan {NAMA_BULAN[periode - 1]} {TAHUN}</div>
        {rows.map((row) => (
          <div
            key={row.wargaId}
            onClick={() => toggleBold(row)}
            className={`cursor-pointer hover:bg-blue-50 rounded px-1 ${isBold(row) ? 'font-bold' : ''}`}
          >
            {row.blok}{'\t'}{row.nama}{row.nama.length < 8 ? '\t\t' : '\t'}{row.usage}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Tersalin!' : 'Salin Teks'}
        </button>
        <button
          onClick={handleSendWA}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700"
        >
          <Send size={18} />
          Kirim ke WA
        </button>
      </div>
    </div>
  )
}
