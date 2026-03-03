"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface LaporanTableProps {
    data: any[]
}

export default function LaporanTable({ data }: LaporanTableProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Pending": return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm">Pending</Badge>
            case "Dipinjam": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm">Dipinjam</Badge>
            case "Dikembalikan": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm">Selesai</Badge>
            case "Terlambat": return <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm">Terlambat</Badge>
            case "Ditolak": return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 shadow-sm">Ditolak</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <Card className="border border-white/5 shadow-2xl bg-card/20 backdrop-blur-xl overflow-hidden group">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/5 bg-white/[0.02]">
                                <TableHead className="w-[80px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 text-center">No</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Peminjam</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Alat Detail</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Tgl Pinjam</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Tgl Kembali</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableCell colSpan={6} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                                                <span className="text-xl">?</span>
                                            </div>
                                            <p className="text-sm font-medium">Tidak ada data laporan ditemukan</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, i) => (
                                    <TableRow key={item.id} className="hover:bg-white/[0.03] border-white/5 transition-all duration-300 cursor-default group/row">
                                        <TableCell className="text-center font-mono text-xs opacity-40 group-hover/row:opacity-100 transition-opacity">
                                            {String(i + 1).padStart(2, '0')}
                                        </TableCell>
                                        <TableCell className="font-semibold group-hover/row:text-primary transition-colors duration-300">{item.peminjam?.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium group-hover/row:text-foreground transition-colors">{item.alat?.nama}</span>
                                                <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">{item.alat?.kategori_alat?.nama_kategori_alat}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="tabular-nums text-muted-foreground/80 group-hover/row:text-foreground transition-colors">
                                            {item.tanggal_pinjam}
                                        </TableCell>
                                        <TableCell className="tabular-nums text-muted-foreground/80 group-hover/row:text-foreground transition-colors">
                                            {item.tanggal_kembali || <span className="opacity-20">—</span>}
                                        </TableCell>
                                        <TableCell className="group-hover/row:scale-105 transition-transform duration-500 origin-left">
                                            {getStatusBadge(item.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
