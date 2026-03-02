"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const MOCK_LAPORAN_PEMINJAMAN = [
    { id: 1, trx_code: "TRX-101", user: "Budi Santoso", item: "Proyektor Epson", date: "2026-02-18", status: "Active" },
    { id: 2, trx_code: "TRX-098", user: "Siti Aminah", item: "Kamera Canon EOS", date: "2026-02-14", status: "Returned" },
    { id: 3, trx_code: "TRX-102", user: "Siti Aminah", item: "Laptop ASUS ROG", date: "2026-02-17", status: "Overdue" },
]

export default function LaporanPeminjamanPage() {
    const columns = [
        { header: "Kode TRX", accessorKey: "trx_code" as const },
        { header: "Nama Peminjam", accessorKey: "user" as const },
        { header: "Nama Alat", accessorKey: "item" as const },
        { header: "Tanggal", accessorKey: "date" as const },
        {
            header: "Status",
            accessorKey: "status" as const,
            renderCell: (val: string) => (
                <Badge variant={val === 'Returned' ? 'secondary' : 'default'} className={
                    val === 'Active' ? 'bg-blue-500' :
                        val === 'Overdue' ? 'bg-red-500' :
                            'bg-green-500'
                }>
                    {val}
                </Badge>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Laporan Peminjaman</h1>
                    <p className="text-muted-foreground">Rekapitulasi seluruh data peminjaman alat.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="glass flex-1 sm:flex-none">
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak PDF
                    </Button>
                    <Button variant="outline" className="glass flex-1 sm:flex-none">
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>

            <DataTable
                title="Data Laporan"
                data={MOCK_LAPORAN_PEMINJAMAN}
                columns={columns}
                showHeading={false}
            />
        </div>
    )
}
