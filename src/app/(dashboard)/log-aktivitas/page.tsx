"use client"

import * as React from "react"
import api from "@/lib/axios"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Monitor, PlusCircle, Edit, Trash2, ArrowLeftRight, CheckCircle2, XCircle, Loader2, Calendar, Activity as ActivityIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ActivityLog } from "@/types/log.types"

export default function LogAktivitasPage() {
    const [logs, setLogs] = React.useState<ActivityLog[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const response = await api.get("/activity-logs")
            setLogs(response.data.data.data)
        } catch (error) {
            console.error("Gagal mengambil log:", error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchLogs()
    }, [])

    const getEventIcon = (event: string) => {
        switch (event) {
            case "created": return <PlusCircle className="h-5 w-5 text-emerald-500" />
            case "updated": return <Edit className="h-5 w-5 text-amber-500" />
            case "deleted": return <Trash2 className="h-5 w-5 text-rose-500" />
            case "restored": return <CheckCircle2 className="h-5 w-5 text-blue-500" />
            default: return <ActivityIcon className="h-5 w-5 text-slate-500" />
        }
    }

    const getEventBadge = (event: string) => {
        switch (event) {
            case "created": return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Dibuat</Badge>
            case "updated": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">Diperbarui</Badge>
            case "deleted": return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20">Dihapus</Badge>
            default: return <Badge variant="outline">{event}</Badge>
        }
    }

    const formatModelName = (modelName: string | null) => {
        if (!modelName) return 'Autentikasi'
        const parts = modelName.split('\\')
        const name = parts[parts.length - 1]
        if (name === 'MDKategoriAlat') return 'Kategori Alat'
        return name
    }

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto space-y-8 w-full max-w-[1400px] px-4 md:px-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ActivityIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Log Sistem</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">Pencatatan aktivitas detail untuk keamanan dan penelusuran sistem.</p>
            </div>

            <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        Timeline Aktivitas
                    </CardTitle>
                    <CardDescription>Menampilkan aktivitas terakhir di dalam sistem.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
                        {logs.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Tidak ada riwayat aktivitas ditemukan.</div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={log.id} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-950 ring-4 ring-slate-50 dark:ring-slate-900 z-10 shadow-md border border-slate-100 dark:border-slate-800">
                                        {getEventIcon(log.event)}
                                    </div>

                                    <div className="ml-14 flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                                    {log.causer?.name || "Sistem"}
                                                </span>
                                                {getEventBadge(log.event)}
                                                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border-none">
                                                    {formatModelName(log.subject_type)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                                <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {format(new Date(log.created_at), "HH:mm", { locale: id })}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(log.created_at), "dd MMM yyyy", { locale: id })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-300">
                                            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                                {log.description} pada data <span className="font-mono text-primary font-bold px-1.5 py-0.5 bg-primary/5 rounded">{formatModelName(log.subject_type)}</span>
                                            </p>

                                            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                    {log.causer?.email || "system@internal"}
                                                </div>
                                                <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
                                                    <Monitor className="h-4 w-4 text-slate-400" />
                                                    <span className="text-slate-400">IP:</span>
                                                    <span className="text-primary/70">{log.properties.ip || "Unknown"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
