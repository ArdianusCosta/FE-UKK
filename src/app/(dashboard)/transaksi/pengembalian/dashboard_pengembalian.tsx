"use client"

import * as React from "react"
import { Package, RotateCcw, Clock, AlertTriangle } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"
import { isToday, parseISO } from "date-fns"
import { useAuth } from "@/contexts/auth-context"

/**
 * DashboardPengembalian
 * Komponen ringkasan statistik peminjaman dan pengembalian khusus petugas.
 */
export function DashboardPengembalianOverview() {
    const { user } = useAuth()
    const isPetugas = user?.role?.toLowerCase() === 'petugas'

    const { data: peminjamanResponse, isLoading: isLoadingPeminjaman } = useQuery({
        queryKey: ["peminjamans"],
        queryFn: apiService.peminjaman.getAll,
        enabled: isPetugas
    })

    const { data: pengembalianResponse, isLoading: isLoadingPengembalian } = useQuery({
        queryKey: ["pengembalians"],
        queryFn: apiService.pengembalian.getAll,
        enabled: isPetugas
    })

    // Hanya tampilkan jika role adalah petugas
    if (!isPetugas) return null

    const peminjamans = peminjamanResponse?.data || []
    const pengembalians = pengembalianResponse?.data || []

    const stats = React.useMemo(() => {
        // Filter peminjaman yang terjadi hari ini
        const dipinjamHariIni = peminjamans.filter((p: any) => {
            const date = p.tanggal_pinjam || p.created_at
            return date && isToday(parseISO(date))
        }).length

        // Filter pengembalian yang terjadi hari ini
        const kembaliHariIni = pengembalians.filter((p: any) => {
            const date = p.tanggal_dikembalikan || p.created_at
            return date && isToday(parseISO(date))
        }).length

        // Total yang masih dipinjam (Global - tidak terbatas hari ini)
        const belumKembali = peminjamans.filter((p: any) =>
            p.status === "Dipinjam" || p.status === "Terlambat"
        ).length

        // Total yang terlambat (Global - tidak terbatas hari ini)
        const terlambat = peminjamans.filter((p: any) =>
            p.status === "Terlambat"
        ).length

        return {
            dipinjamHariIni,
            kembaliHariIni,
            belumKembali,
            terlambat
        }
    }, [peminjamans, pengembalians])

    const isLoading = isLoadingPeminjaman || isLoadingPengembalian

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight">Ringkasan Hari Ini</h2>
                <p className="text-sm text-muted-foreground">Statistik aktivitas alat untuk mempermudah pemantauan.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Alat Dipinjam Hari Ini"
                    value={stats.dipinjamHariIni.toString()}
                    icon={Package}
                    isLoading={isLoading}
                    description="Total alat dipinjam hari ini"
                    trend={{ value: "📦", positive: true }}
                />
                <StatCard
                    title="Pengembalian Hari Ini"
                    value={stats.kembaliHariIni.toString()}
                    icon={RotateCcw}
                    isLoading={isLoading}
                    description="Total pengembalian hari ini"
                    trend={{ value: "🔁", positive: true }}
                />
                <StatCard
                    title="Belum Dikembalikan"
                    value={stats.belumKembali.toString()}
                    icon={Clock}
                    isLoading={isLoading}
                    description="Total alat yang sedang dipinjam"
                    trend={{ value: "⏳", positive: false }}
                />
                <StatCard
                    title="Terlambat"
                    value={stats.terlambat.toString()}
                    icon={AlertTriangle}
                    isLoading={isLoading}
                    description="Total pinjaman yang terlambat"
                    trend={{ value: "⚠️", positive: false }}
                />
            </div>
        </div>
    )
}
