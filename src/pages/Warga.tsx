import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wargaApi } from '../services/api'

export default function Warga() {
  const queryClient = useQueryClient()
  const { data: wargaList, isLoading } = useQuery({ queryKey: ['warga'], queryFn: wargaApi.getAll })
  
  const seedDataMutation = useMutation({
    mutationFn: async () => {
      // First, delete all existing warga
      if (wargaList && wargaList.length > 0) {
        for (const warga of wargaList) {
          await wargaApi.delete(warga.id)
        }
      }
      
      // Then insert new data
      const wargas = [
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
      return await wargaApi.createMany(wargas)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warga'] })
    }
  })
  
  if (isLoading) return <div>Loading...</div>

  // Check if warga list is empty or needs re-seeding and seed data
  if (wargaList && (wargaList.length === 0 || wargaList.length > 22) && !seedDataMutation.isPending) {
    seedDataMutation.mutate()
    return <div>Updating data...</div>
  }

  if (seedDataMutation.isPending) return <div>Initializing data...</div>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Data Warga</h1>
      <div className="space-y-2">
        {wargaList?.map(w => (
          <div key={w.id} className="border rounded p-3">
            <div className="font-semibold">{w.blok} - {w.nama}</div>
          </div>
        ))}
      </div>
    </div>
  )
}