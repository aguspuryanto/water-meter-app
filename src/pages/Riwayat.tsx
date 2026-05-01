import { useQuery } from '@tanstack/react-query'
import { readingApi } from '../services/api'

export default function Riwayat() {
  const { data: readings, isLoading } = useQuery({ queryKey: ['readings'], queryFn: readingApi.getAll })
  if (isLoading) return <div>Loading...</div>

  // Sort readings by warga.blok first
  const sortedReadings = readings?.sort((a: any, b: any) => {
    // Extract numeric part from blok (e.g., "B01" -> 1, "B10" -> 10)
    const getBlokNumber = (blok: string) => {
      const match = blok.match(/B(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    }
    
    const aBlok = getBlokNumber(a.warga.blok)
    const bBlok = getBlokNumber(b.warga.blok)
    
    return aBlok - bBlok
  })

  // Group by warga
  const grouped = sortedReadings?.reduce((acc: any, r: any) => {
    const name = `${r.warga.blok} - ${r.warga.nama}`
    if (!acc[name]) acc[name] = []
    acc[name].push({ bulan: r.bulan, meteran: r.meteran })
    return acc
  }, {})

  return (
    <div className="p-4 overflow-x-auto">
      <h1 className="text-xl font-bold mb-4">Riwayat Meteran</h1>
      {Object.entries(grouped).map(([nama, records]: [string, any]) => (
        <div key={nama} className="mb-4 border rounded p-2">
          <div className="font-semibold">{nama}</div>
          <div className="flex gap-2 overflow-x-auto text-sm">
            {records.sort((a:any,b:any)=>a.bulan-b.bulan).map((rec:any)=>(
              <div key={rec.bulan} className="bg-gray-100 p-1 rounded min-w-[60px] text-center">
                <div>Bulan {rec.bulan}</div>
                <div>{rec.meteran}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}