"use client"

import * as React from "react"
import { Package, RotateCcw, Clock, AlertTriangle } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"
import { isToday, parseISO } from "date-fns"
import { useAuth } from "@/contexts/auth-context"

export function DashboardPengembalianOverview() {
    const { user, isStaff } = useAuth()
    const { data: peminjamanResponse, isLoading: isLoadingPeminjaman } = useQuery({
        queryKey: ["peminjamans"],
        queryFn: apiService.peminjaman.getAll,
        enabled: isStaff
    })
    const { data: pengembalianResponse, isLoading: isLoadingPengembalian } = useQuery({
        queryKey: ["pengembalians"],
        queryFn: apiService.pengembalian.getAll,
        enabled: isStaff
    })
    const peminjamans = peminjamanResponse?.data || []
    const pengembalians = pengembalianResponse?.data || []

    const stats = React.useMemo(() => {
        const dipinjamTotal = peminjamans.length
        const kembaliTotal = pengembalians.length
        const belumKembali = peminjamans.filter((p: any) =>
            p.status === "Dipinjam" || p.status === "Terlambat"
        ).length

        const terlambat = peminjamans.filter((p: any) =>
            p.status === "Terlambat"
        ).length

        return {
            dipinjamTotal,
            kembaliTotal,
            belumKembali,
            terlambat
        }
    }, [peminjamans, pengembalians])

    if (!isStaff) return null

    const isLoading = isLoadingPeminjaman || isLoadingPengembalian

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight">Ringkasan Statistik</h2>
                <p className="text-sm text-muted-foreground">Gambaran umum seluruh aktivitas peminjaman dan pengembalian.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Alat Dipinjam"
                    value={stats.dipinjamTotal.toString()}
                    icon={Package}
                    isLoading={isLoading}
                    description="Keseluruhan riwayat peminjaman"
                    trend={{ value: "Total", icon: Package, positive: true }}
                />
                <StatCard
                    title="Total Pengembalian"
                    value={stats.kembaliTotal.toString()}
                    icon={RotateCcw}
                    isLoading={isLoading}
                    description="Keseluruhan riwayat pengembalian"
                    trend={{ value: "Total", icon: RotateCcw, positive: true }}
                />
                <StatCard
                    title="Belum Dikembalikan"
                    value={stats.belumKembali.toString()}
                    icon={Clock}
                    isLoading={isLoading}
                    description="Total alat yang sedang dipinjam"
                    trend={{ value: "Aktif", icon: Clock, positive: false }}
                />
                <StatCard
                    title="Terlambat"
                    value={stats.terlambat.toString()}
                    icon={AlertTriangle}
                    isLoading={isLoading}
                    description="Total pinjaman yang terlambat"
                    trend={{ value: "Late", icon: AlertTriangle, positive: false }}
                />
            </div>
        </div>
    )
}
