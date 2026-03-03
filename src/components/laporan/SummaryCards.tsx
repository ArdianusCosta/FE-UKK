"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, CheckCircle2, AlertCircle, Clock } from "lucide-react"

interface SummaryCardsProps {
    summary: {
        total_peminjaman: number
        total_selesai: number
        total_terlambat: number
        total_dipinjam: number
    }
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
    const cards = [
        {
            title: "Total Peminjaman",
            value: summary.total_peminjaman,
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-500/5",
            accent: "bg-blue-500",
            border: "border-blue-500/20"
        },
        {
            title: "Peminjaman Selesai",
            value: summary.total_selesai,
            icon: CheckCircle2,
            color: "text-emerald-500",
            bg: "bg-emerald-500/5",
            accent: "bg-emerald-500",
            border: "border-emerald-500/20"
        },
        {
            title: "Peminjaman Terlambat",
            value: summary.total_terlambat,
            icon: AlertCircle,
            color: "text-rose-500",
            bg: "bg-rose-500/5",
            accent: "bg-rose-500",
            border: "border-rose-500/20"
        },
        {
            title: "Sedang Dipinjam",
            value: summary.total_dipinjam,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/5",
            accent: "bg-amber-500",
            border: "border-amber-500/20"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <Card key={i} className={`relative overflow-hidden border border-white/5 shadow-lg backdrop-blur-md bg-card/30 group hover:bg-card/40 transition-all duration-300`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${card.accent} opacity-70`} />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{card.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold tracking-tight">{card.value}</h3>
                                    <span className="text-[10px] text-emerald-500 font-medium">+0%</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} border ${card.border} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
