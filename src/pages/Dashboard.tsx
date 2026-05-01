import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { readingApi } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

export default function Dashboard() {
  const { data: readings, isLoading } = useQuery({ queryKey: ['readings'], queryFn: readingApi.getAll })
//   console.log({ readings })

  // Hitung total pemakaian air per bulan dengan useMemo
  // Rule: pemakaian bulan ini = meteran bulan lalu - meteran bulan ini
  const usagePerMonth = useMemo(() => {
    const result: { month: string; usage: number }[] = []
    
    // Group readings by warga_id and bulan for easier access
    const readingsByWargaAndMonth = new Map<string, Map<number, number>>()
    readings?.forEach((r: any) => {
      if (!readingsByWargaAndMonth.has(r.warga_id)) {
        readingsByWargaAndMonth.set(r.warga_id, new Map())
      }
      readingsByWargaAndMonth.get(r.warga_id)!.set(r.bulan, r.meteran)
    })
    // console.log({ readingsByWargaAndMonth })

    for (let bulan = 1; bulan <= 12; bulan++) {
      let totalUsage = 0
      
      // Calculate usage for each warga
      readingsByWargaAndMonth.forEach((monthlyReadings, wargaId) => {
        const currentMonthReading = monthlyReadings.get(bulan)
        const previousMonthReading = monthlyReadings.get(bulan + 1)
        console.log({ wargaId, bulan, currentMonthReading, previousMonthReading })
        
        // Only calculate if both readings exist
        if (currentMonthReading !== undefined && previousMonthReading !== undefined) {
          // Usage = previous month meter - current month meter
          const usage = previousMonthReading - currentMonthReading
          // console.log({ wargaId, bulan, usage })
          if (usage > 0) { // Only count positive usage
            totalUsage += usage
          }
        }
      })
      
      result.push({ month: format(new Date(2026, bulan - 1), 'MMM'), usage: totalUsage })
      // console.log({ month: format(new Date(2026, bulan - 1), 'MMM'), usage: totalUsage })
    }
    
    return result
  }, [readings])

  if (isLoading) return <div className="p-4">Memuat grafik...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Pemakaian Air</h1>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            2026
          </div>
        </div>
        {/* <p className="text-gray-600 text-sm">Monitoring konsumsi air bulanan</p> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Total Tahun Ini</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {usagePerMonth.reduce((a,b) => a + b.usage, 0)}
              </p>
              <p className="text-gray-500 text-xs">m³</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Rata-rata Bulanan</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {Math.round(usagePerMonth.reduce((a,b) => a + b.usage, 0) / usagePerMonth.filter(m => m.usage > 0).length || 0)}
              </p>
              <p className="text-gray-500 text-xs">m³/bulan</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Bulan Aktif</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {usagePerMonth.filter(m => m.usage > 0).length}
              </p>
              <p className="text-gray-500 text-xs">bulan</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Grafik Pemakaian Bulanan</h2>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>m³</span>
          </div>
        </div>
        
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usagePerMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="usage" 
                fill="#3B82F6" 
                name="Total Pemakaian (m³)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-xs">
          💧 Data pemakaian air diperbarui secara real-time
        </p>
      </div>
    </div>
  )
}