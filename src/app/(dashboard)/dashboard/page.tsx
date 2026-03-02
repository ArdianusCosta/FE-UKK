"use client"

import * as React from "react"
import {
    Box,
    ClipboardList,
    Archive,
    RotateCcw,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../../../../services/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

class ChartErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false, error: undefined }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Chart Error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    <div className="text-center">
                        <p>Chart tidak dapat dimuat</p>
                        <p className="text-sm">Mohon refresh halaman</p>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default function DashboardPage() {
    const { data: statsResponse, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: apiService.dashboard.getStats,
    })

    const stats = statsResponse?.data || {
        summary: {
            total_alat: 0,
            alat_dipinjam: 0,
            alat_tersedia: 0,
            alat_maintenance: 0,
            total_peminjaman: 0
        },
        peminjaman_activity: [],
        pengembalian_distribution: []
    }

    const borrowingData = stats.peminjaman_activity.length > 0
        ? stats.peminjaman_activity
        : [
            { name: "Mon", total: 0 },
            { name: "Tue", total: 0 },
            { name: "Wed", total: 0 },
            { name: "Thu", total: 0 },
            { name: "Fri", total: 0 },
            { name: "Sat", total: 0 },
            { name: "Sun", total: 0 },
        ]

    const returnData = stats.pengembalian_distribution.length > 0
        ? stats.pengembalian_distribution
        : [
            { name: "Belum Ada Data", total: 0 }
        ]

    const {
        total_alat,
        alat_dipinjam,
        alat_tersedia,
        alat_maintenance,
        total_peminjaman
    } = stats.summary

    const divisor = (alat_dipinjam || 0) + (alat_maintenance || 0)
    const rawTrend = divisor > 0 ? ((alat_tersedia || 0) / divisor) * 100 : 100
    const trendValue = Math.min(rawTrend, 100).toFixed(1)

    const isTrendPositive = parseFloat(trendValue) > 50

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight dark:text-white">Dashboard Overview</h1>
                <p className="text-muted-foreground">Selamat datang kembali, Admin! Berikut ringkasan sistem saat ini.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Alat"
                    value={(total_alat || 0).toString()}
                    icon={Box}
                    isLoading={isLoading}
                    trend={{ value: "+Realtime", positive: true }}
                    description="Alat terdaftar di sistem"
                />
                <StatCard
                    title="Alat Dipinjam"
                    value={(alat_dipinjam || 0).toString()}
                    icon={ClipboardList}
                    isLoading={isLoading}
                    trend={{ value: "Aktif", positive: true }}
                    description="Sedang dalam peminjaman"
                />
                <StatCard
                    title="Alat Tersedia"
                    value={(alat_tersedia || 0).toString()}
                    icon={Archive}
                    isLoading={isLoading}
                    trend={{ value: `${trendValue}%`, positive: isTrendPositive }}
                    description="Siap untuk dipinjam"
                />
                <StatCard
                    title="Total Peminjaman"
                    value={(total_peminjaman || 0).toLocaleString()}
                    icon={RotateCcw}
                    isLoading={isLoading}
                    trend={{ value: "Total", positive: true }}
                    description="Histori peminjaman keseluruhan"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4 glass border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Overview Peminjaman</CardTitle>
                        <CardDescription>Aktivitas peminjaman alat dalam 7 hari terakhir.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ChartErrorBoundary>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <LineChart data={borrowingData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" stroke="currentColor" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--popover)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--radius)",
                                            color: "var(--popover-foreground)"
                                        }}
                                        itemStyle={{ color: "#3b82f6" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartErrorBoundary>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3 glass border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Overview Pengembalian</CardTitle>
                        <CardDescription>Distribusi pengembalian berdasarkan kategori.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ChartErrorBoundary>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={returnData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" stroke="currentColor" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        hide
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--popover)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--radius)",
                                            color: "var(--popover-foreground)"
                                        }}
                                        itemStyle={{ color: "#3b82f6" }}
                                    />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                        {returnData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#3b82f6" : "#6366f1"} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartErrorBoundary>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
