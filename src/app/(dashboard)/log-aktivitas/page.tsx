"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

const MOCK_LOGS = [
    { id: 1, user: "Admin Utama", action: "Login ke sistem", timestamp: "18 Feb 2026, 22:15", ip: "192.168.1.1" },
    { id: 2, user: "Budi Santoso", action: "Menambahkan Alat Baru (Proyektor)", timestamp: "18 Feb 2026, 21:05", ip: "192.168.1.25" },
    { id: 3, user: "Admin Utama", action: "Menghapus User (Jane)", timestamp: "18 Feb 2026, 20:30", ip: "192.168.1.1" },
    { id: 4, user: "Siti Aminah", action: "Proses Pengembalian TRX-099", timestamp: "18 Feb 2026, 19:45", ip: "192.168.1.10" },
]

export default function LogAktivitasPage() {
    const columns = [
        {
            header: "Waktu",
            accessorKey: "timestamp" as const,
            renderCell: (val: string) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {val}
                </div>
            )
        },
        { header: "User", accessorKey: "user" as const },
        {
            header: "Aksi",
            accessorKey: "action" as const,
            renderCell: (val: string) => (
                <span className="font-medium text-primary">{val}</span>
            )
        },
        { header: "IP Address", accessorKey: "ip" as const },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Log Aktivitas</h1>
                    <p className="text-muted-foreground">Daftar riwayat aksi seluruh user dalam sistem.</p>
                </div>
            </div>

            <DataTable
                title="Riwayat Log"
                data={MOCK_LOGS}
                columns={columns}
                searchPlaceholder="Cari log..."
                showHeading={false}
            />
        </div>
    )
}
