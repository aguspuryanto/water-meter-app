import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wargaApi, readingApi } from '../services/api'
import { useState, useEffect } from 'react'

export default function CatatMeter() {
  const { data: wargaList } = useQuery({ queryKey: ['warga'], queryFn: wargaApi.getAll })
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [tahun, setTahun] = useState(2026)
  const [meterReadings, setMeterReadings] = useState<Record<string, number>>({})
  const queryClient = useQueryClient()

  // Get existing readings for the selected month/year
  const { data: existingReadings } = useQuery({
    queryKey: ['readings', bulan, tahun],
    queryFn: async () => {
      if (!wargaList) return []
      const readings = []
      for (const warga of wargaList) {
        const res = await readingApi.getByWarga(warga.id)
        const reading = res.find(r => r.bulan === bulan && r.tahun === tahun)
        if (reading) {
          readings.push(reading)
        }
      }
      return readings
    },
    enabled: !!wargaList
  })

  // Initialize meter readings with existing data
  useEffect(() => {
    if (existingReadings) {
      const readings: Record<string, number> = {}
      existingReadings.forEach(reading => {
        readings[reading.warga_id] = reading.meteran
      })
      setMeterReadings(readings)
    }
  }, [existingReadings])

  const mutation = useMutation({
    mutationFn: async (readings: Record<string, number>) => {
      const promises = Object.entries(readings).map(([wargaId, meteran]) => 
        readingApi.upsert({
          warga_id: wargaId,
          bulan,
          tahun,
          meteran
        })
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] })
      alert('Data meter berhasil disimpan!')
    }
  })

  const handleMeterChange = (wargaId: string, value: string) => {
    const meteran = Number(value) || 0
    setMeterReadings(prev => ({ ...prev, [wargaId]: meteran }))
  }

  const handleSaveAll = () => {
    mutation.mutate(meterReadings)
  }

  const handleReset = () => {
    setMeterReadings({})
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Catat Meter Bulanan</h1>
      
      <div className="mb-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Bulan</label>
            <select 
              className="w-full p-2 border rounded" 
              value={bulan} 
              onChange={e => setBulan(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <input 
              type="number" 
              className="p-2 border rounded w-24" 
              value={tahun} 
              onChange={e => setTahun(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {wargaList?.map(w => (
          <div key={w.id} className="flex items-start gap-4 p-3 border rounded">
            <div className="flex-1 text-left">
              <span className="font-semibold">{w.blok}</span>
              <span className="ml-2 text-gray-600">{w.nama}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Meter:</label>
              <input 
                type="number" 
                className="w-32 p-2 border rounded" 
                placeholder="0"
                value={meterReadings[w.id] || ''}
                onChange={e => handleMeterChange(w.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleReset} 
          className="flex-1 bg-gray-500 text-white p-3 rounded font-semibold"
          disabled={mutation.isPending}
        >
          Reset
        </button>
        <button 
          onClick={handleSaveAll} 
          className="flex-1 bg-green-600 text-white p-3 rounded font-semibold"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
      
    </div>
  )
}