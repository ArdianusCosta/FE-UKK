"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import FilterSection from "@/components/laporan/FilterSection"
import SummaryCards from "@/components/laporan/SummaryCards"
import LaporanTable from "@/components/laporan/LaporanTable"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6'];

export default function LaporanPage() {
    const [params, setParams] = useState({
        start: "",
        end: "",
        status: "all",
        user_id: "all",
    })

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["laporan", params],
        queryFn: async () => {
            const queryParams = new URLSearchParams()
            if (params.start) queryParams.append("start", params.start)
            if (params.end) queryParams.append("end", params.end)
            if (params.status !== "all") queryParams.append("status", params.status)
            if (params.user_id !== "all") queryParams.append("user_id", params.user_id)

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/laporan?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
            return response.data
        }
    })

    const handleFilter = (newFilters: any) => {
        setParams(newFilters)
    }

    const handleExport = async (type: "excel" | "pdf") => {
        try {
            const queryParams = new URLSearchParams()
            if (params.start) queryParams.append("start", params.start)
            if (params.end) queryParams.append("end", params.end)
            if (params.status !== "all") queryParams.append("status", params.status)
            if (params.user_id !== "all") queryParams.append("user_id", params.user_id)

            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/laporan/export-${type}?${queryParams.toString()}`

            const toastId = toast.loading(`Mengunduh ${type.toUpperCase()}...`)

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                responseType: 'blob'
            })

            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', `laporan-peminjaman-${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'pdf'}`)
            document.body.appendChild(link)
            link.click()
            link.remove()

            toast.dismiss(toastId)
            toast.success(`${type.toUpperCase()} berhasil diunduh`)
        } catch (error) {
            toast.dismiss()
            console.error(`Export ${type} failed`, error)
            toast.error(`Gagal mengunduh ${type.toUpperCase()}`)
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] p-6 lg:p-10 space-y-10 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-1.5 bg-primary rounded-full" />
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                        Laporan & Statistik
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg ml-4.5">Monitor aktivitas peminjaman dan ekspor data laporan secara profesional.</p>
            </div>

            <FilterSection onFilter={handleFilter} onExport={handleExport} />

            {isLoading ? (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[400px] bg-white/5 animate-pulse rounded-2xl" />
                        <div className="h-[400px] bg-white/5 animate-pulse rounded-2xl" />
                    </div>
                </div>
            ) : (
                <>
                    <SummaryCards summary={data?.summary || { total_peminjaman: 0, total_selesai: 0, total_terlambat: 0, total_dipinjam: 0 }} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <Card className="lg:col-span-7 border border-white/5 shadow-xl bg-card/30 backdrop-blur-xl overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Trend Peminjaman Bulanan</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data?.charts?.stats_per_month || []}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                        <XAxis
                                            dataKey="bulan"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        />
                                        <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-5 border border-white/5 shadow-xl bg-card/30 backdrop-blur-xl group overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Alat Populer</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] flex items-center justify-center pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.charts?.top_alat || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="total"
                                            nameKey="nama"
                                            stroke="none"
                                        >
                                            {data?.charts?.top_alat?.map((entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Daftar Peminjaman Detail</h3>
                        </div>
                        <LaporanTable data={data?.data || []} />
                    </div>
                </>
            )}
        </div>
    )
}
