"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, RotateCcw, FileText, Download, Calendar as CalendarIcon, Filter } from "lucide-react"
import axios from "axios"

interface FilterSectionProps {
    onFilter: (filters: any) => void
    onExport: (type: "excel" | "pdf") => void
}

export default function FilterSection({ onFilter, onExport }: FilterSectionProps) {
    const [filters, setFilters] = useState({
        start: "",
        end: "",
        status: "all",
        user_id: "all",
    })
    const [users, setUsers] = useState<any[]>([])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users-profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                })
                setUsers(response.data.data)
            } catch (error) {
                console.error("Failed to fetch users", error)
            }
        }
        fetchUsers()
    }, [])

    const handleReset = () => {
        const resetFilters = { start: "", end: "", status: "all", user_id: "all" }
        setFilters(resetFilters)
        onFilter(resetFilters)
    }

    return (
        <Card className="border border-white/5 shadow-2xl bg-card/30 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 opacity-30" />
            <CardContent className="p-0">
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">Filter Laporan</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 ml-1">Rentang Awal</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                <Input
                                    type="date"
                                    value={filters.start}
                                    onChange={(e) => setFilters({ ...filters, start: e.target.value })}
                                    className="bg-background/20 border-white/5 pl-10 focus:ring-primary/20 h-10 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 ml-1">Rentang Akhir</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                <Input
                                    type="date"
                                    value={filters.end}
                                    onChange={(e) => setFilters({ ...filters, end: e.target.value })}
                                    className="bg-background/20 border-white/5 pl-10 focus:ring-primary/20 h-10 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 ml-1">Status Aktivitas</Label>
                            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                <SelectTrigger className="bg-background/20 border-white/5 h-10 transition-all">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                                    <SelectItem value="Dikembalikan">Dikembalikan</SelectItem>
                                    <SelectItem value="Terlambat">Terlambat</SelectItem>
                                    <SelectItem value="Ditolak">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground/60 ml-1">Filter User</Label>
                            <Select value={filters.user_id} onValueChange={(v) => setFilters({ ...filters, user_id: v })}>
                                <SelectTrigger className="bg-background/20 border-white/5 h-10 transition-all">
                                    <SelectValue placeholder="Semua Peminjam" />
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                                    <SelectItem value="all">Semua Peminjam</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => onFilter(filters)}
                            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-9 px-6 transition-all active:scale-95"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Tampilkan Data
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground h-9 px-4 hover:bg-white/5 transition-all"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-background/40 rounded-lg border border-white/5 shadow-inner">
                        <Button
                            onClick={() => onExport("excel")}
                            variant="ghost"
                            className="h-8 px-3 text-xs font-semibold text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all rounded-md"
                        >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            EXCEL
                        </Button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <Button
                            onClick={() => onExport("pdf")}
                            variant="ghost"
                            className="h-8 px-3 text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all rounded-md"
                        >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            PDF
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
