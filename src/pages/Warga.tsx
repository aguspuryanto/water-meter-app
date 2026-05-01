import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wargaApi } from '../services/api'
import { WARGA_SEED_DATA } from '../types'

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
      return await wargaApi.createMany(WARGA_SEED_DATA)
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