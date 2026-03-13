"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"
import { QRScanner } from "@/components/qr-scanner"
import { useAuth } from "@/contexts/auth-context"
import { Scan, Trash2, Plus, History, Loader2, Search, Edit2, AlertCircle, RefreshCcw, Eye, ScanLine } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { DashboardPengembalianOverview } from "./dashboard_pengembalian"

export default function PengembalianPage() {
    const { user, isStaff, isAdmin } = useAuth()

    const queryClient = useQueryClient()
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [isScannerOpen, setIsScannerOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [editingReturn, setEditingReturn] = React.useState<any>(null)
    const [viewingReturn, setViewingReturn] = React.useState<any>(null)
    const [detailId, setDetailId] = React.useState<number | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
    const [returnToDelete, setReturnToDelete] = React.useState<any>(null)
    const [isScanConfirmOpen, setIsScanConfirmOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [imagePreview, setImagePreview] = React.useState<string | null>(null)

    // Form State
    const [formData, setFormData] = React.useState<{
        peminjaman_id: string;
        kode_peminjaman: string;
        tanggal_kembali: string;
        kondisi_kembali: string;
        catatan: string;
        foto: File | null;
        metode: string;
    }>({
        peminjaman_id: "",
        kode_peminjaman: "",
        tanggal_kembali: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        kondisi_kembali: "baik",
        catatan: "",
        foto: null,
        metode: "manual"
    })

    // Queries
    const { data: pengembalians, isLoading: isLoadingReturns } = useQuery({
        queryKey: ["pengembalians"],
        queryFn: apiService.pengembalian.getAll
    })

    const { data: peminjamans } = useQuery({
        queryKey: ["peminjamans"],
        queryFn: apiService.peminjaman.getAll
    })

    const { data: detailData, isLoading: isLoadingDetail } = useQuery({
        queryKey: ["pengembalian", detailId],
        queryFn: () => apiService.pengembalian.getById(detailId!),
        enabled: !!detailId && isDetailModalOpen,
    })

    // Update viewingReturn when detailData arrives
    React.useEffect(() => {
        if (detailData?.data) {
            setViewingReturn(detailData.data)
        }
    }, [detailData])

    const activePeminjamans = React.useMemo(() => {
        return peminjamans?.data?.filter((p: any) => p.status === "Dipinjam" || p.status === "Terlambat") || []
    }, [peminjamans])

    const createMutation = useMutation({
        mutationFn: apiService.pengembalian.create,
        onSuccess: () => {
            toast.success("Pengembalian berhasil dicatat")
            queryClient.invalidateQueries({ queryKey: ["pengembalians"] })
            queryClient.invalidateQueries({ queryKey: ["peminjamans"] })
            setIsAddModalOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal mencatat pengembalian")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => apiService.pengembalian.update(id, data),
        onSuccess: () => {
            toast.success("Data pengembalian berhasil diupdate")
            queryClient.invalidateQueries({ queryKey: ["pengembalians"] })
            setIsEditModalOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal mengupdate data")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: apiService.pengembalian.delete,
        onSuccess: () => {
            toast.success("Data berhasil dihapus")
            queryClient.invalidateQueries({ queryKey: ["pengembalians"] })
            queryClient.invalidateQueries({ queryKey: ["trashed"] })
            queryClient.invalidateQueries({ queryKey: ["peminjamans"] })
            setIsDeleteModalOpen(false)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghapus data")
        }
    })

    const restoreMutation = useMutation({
        mutationFn: apiService.pengembalian.restore,
        onSuccess: () => {
            toast.success("Data berhasil dikembalikan")
            queryClient.invalidateQueries({ queryKey: ["pengembalians"] })
            queryClient.invalidateQueries({ queryKey: ["trashed"] })
            queryClient.invalidateQueries({ queryKey: ["peminjamans"] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal mengembalikan data")
        }
    })

    const { data: trashedItems, isLoading: isLoadingTrashed } = useQuery({
        queryKey: ["trashed"],
        queryFn: apiService.pengembalian.getTrashed
    })

    const resetForm = () => {
        setFormData({
            peminjaman_id: "",
            kode_peminjaman: "",
            tanggal_kembali: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            kondisi_kembali: "baik",
            catatan: "",
            foto: null,
            metode: "manual"
        })
        setImagePreview(null)
        setIsEditModalOpen(false)
        setIsScanConfirmOpen(false)
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, foto: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingReturn) {
            updateMutation.mutate({
                id: editingReturn.id,
                data: {
                    kondisi_kembali: formData.kondisi_kembali,
                    catatan: formData.catatan,
                    tanggal_kembali: formData.tanggal_kembali,
                    foto: formData.foto
                }
            })
        } else {
            if (!formData.peminjaman_id && !formData.kode_peminjaman) {
                toast.error("Pilih data peminjaman")
                return
            }
            createMutation.mutate(formData)
        }
    }

    const handleScan = (decodedText: string) => {
        const found = activePeminjamans.find((p: any) => p.kode === decodedText)
        if (found) {
            toast.success(`Scan berhasil: ${found.kode}`)
            setFormData({
                peminjaman_id: found.id.toString(),
                kode_peminjaman: found.kode,
                tanggal_kembali: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                kondisi_kembali: "baik",
                catatan: "",
                foto: null,
                metode: "scan"
            })
            setIsScannerOpen(false)
            setIsScanConfirmOpen(true)
        } else {
            toast.error("Kode tidak ditemukan atau sudah dikembalikan")
        }
    }

    const handleEdit = (ret: any) => {
        setEditingReturn(ret)
        const date = ret.tanggal_dikembalikan || ret.created_at
        setFormData({
            peminjaman_id: ret.peminjaman_id.toString(),
            kode_peminjaman: ret.peminjaman?.kode || "",
            tanggal_kembali: format(new Date(date), "yyyy-MM-dd'T'HH:mm"),
            kondisi_kembali: ret.kondisi_kembali,
            catatan: ret.catatan || "",
            foto: null
        })
        if (ret.foto) {
            setImagePreview(`${API_URL}/uploads/pengembalian/${ret.foto}`)
        } else {
            setImagePreview(null)
        }
        setIsEditModalOpen(true)
    }

    // Filter results
    const filteredResults = pengembalians?.data?.filter((p: any) =>
        p.peminjaman?.kode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.peminjaman?.peminjam?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.peminjaman?.alat?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengembalian Alat</h1>
                    <p className="text-muted-foreground">Kelola riwayat pengembalian alat dan proses scan QR.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 shadow-md group"
                        onClick={() => setIsScannerOpen(true)}
                    >
                        <Scan className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                        Scan QR
                    </Button>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" />
                                Catat Pengembalian
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] glass border-white/10 max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Catat Pengembalian Baru</DialogTitle>
                                <DialogDescription>
                                    Lengkapi data pengembalian dan simpan bukti foto jika ada.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Manual Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2 ">
                                        <Label htmlFor="peminjaman">Pilih Peminjaman</Label>
                                        <Select
                                            value={formData.peminjaman_id}
                                            onValueChange={(val) => setFormData(p => ({ ...p, peminjaman_id: val }))}
                                        >
                                            <SelectTrigger className="glass">
                                                <SelectValue placeholder="-- Pilih Data Peminjaman --" />
                                            </SelectTrigger>
                                            <SelectContent className="glass border-white/10">
                                                {activePeminjamans.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.kode} - {p.peminjam?.name} ({p.alat?.nama})
                                                    </SelectItem>
                                                ))}
                                                {activePeminjamans.length === 0 && (
                                                    <SelectItem value="none" disabled>Tidak ada peminjaman aktif</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggal_kembali">Tanggal & Waktu Kembali</Label>
                                            <Input
                                                id="tanggal_kembali"
                                                type="datetime-local"
                                                className="glass h-10"
                                                value={formData.tanggal_kembali}
                                                onChange={(e) => setFormData(p => ({ ...p, tanggal_kembali: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="kondisi_kembali">Kondisi Alat</Label>
                                            <Select
                                                value={formData.kondisi_kembali}
                                                onValueChange={(val) => setFormData(p => ({ ...p, kondisi_kembali: val }))}
                                            >
                                                <SelectTrigger className="glass h-10 w-full">
                                                    <SelectValue placeholder="Pilih Kondisi" />
                                                </SelectTrigger>
                                                <SelectContent className="glass border-white/10">
                                                    <SelectItem value="baik">Baik</SelectItem>
                                                    <SelectItem value="rusak">Rusak</SelectItem>
                                                    <SelectItem value="hilang">Hilang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="catatan">Catatan Kondisi</Label>
                                        <Input
                                            id="catatan"
                                            placeholder="Kondisi alat saat kembali..."
                                            className="glass h-10"
                                            value={formData.catatan}
                                            onChange={(e) => setFormData(p => ({ ...p, catatan: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Foto Bukti (Opsional)</Label>
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => document.getElementById("foto-upload")?.click()}
                                        >
                                            <div className={`
                                                border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all
                                                ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/40'}
                                            `}>
                                                {imagePreview ? (
                                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-inner">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-medium text-sm">
                                                            Ganti Foto
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all shrink-0">
                                                            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-sm font-bold">Upload Foto Bukti</div>
                                                            <p className="text-[10px] text-muted-foreground">PNG, JPG atau GIF (Max. 2MB)</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Input
                                            id="foto-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        {imagePreview && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 text-[11px] rounded-lg mt-2"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setImagePreview(null)
                                                    setFormData(p => ({ ...p, foto: null }))
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3 mr-2" />
                                                Hapus & Ganti Foto
                                            </Button>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Simpan Data Pengembalian
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <DashboardPengembalianOverview />

            <Card className="glass shadow-xl border-white/10 overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <History className="h-5 w-5 text-primary" />
                                Riwayat Pengembalian
                            </CardTitle>
                            <CardDescription>Daftar alat yang telah dikembalikan ke gudang.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode, nama, atau alat..."
                                className="pl-9 glass border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-transparent border-white/10">
                                    <TableHead className="w-[150px] font-bold">Kode Pinjam</TableHead>
                                    <TableHead className="font-bold">Info Alat</TableHead>
                                    <TableHead className="font-bold">Peminjam</TableHead>
                                    <TableHead className="font-bold">Waktu Kembali</TableHead>
                                    <TableHead className="font-bold text-center">Kondisi</TableHead>
                                    <TableHead className="font-bold text-center">Bukti</TableHead>
                                    <TableHead className="text-right font-bold">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingReturns ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm text-muted-foreground animate-pulse">Memuat riwayat...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredResults.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <History className="h-8 w-8 opacity-20" />
                                                <p className="text-sm italic">Tidak ada data pengembalian ditemukan.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredResults.map((p: any) => (
                                        <TableRow key={p.id} className="hover:bg-white/5 transition-colors border-white/5">
                                            <TableCell className="font-mono font-bold text-primary">{p.peminjaman?.kode}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{p.peminjaman?.alat?.nama}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="glass border-white/10 font-medium">
                                                    {p.peminjaman?.peminjam?.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm opacity-80">
                                                {format(new Date(p.tanggal_dikembalikan || p.created_at || new Date()), "dd MMMM yyyy", { locale: id })}
                                                <div className="text-[10px] font-mono opacity-50">{format(new Date(p.tanggal_dikembalikan || p.created_at || new Date()), "HH:mm:ss", { locale: id })}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={`
                                                    uppercase font-bold text-[10px] px-2 py-0.5 rounded-full
                                                    ${p.kondisi_kembali === 'baik' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                                                        p.kondisi_kembali === 'rusak' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                                                            'bg-red-500/20 text-red-500 border-red-500/30'}
                                                `}>
                                                    {p.kondisi_kembali}
                                                </Badge>
                                                {p.catatan && (
                                                    <div className="mx-auto mt-1 max-w-[120px] truncate italic text-muted-foreground text-[10px]" title={p.catatan}>
                                                        {p.catatan}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    {p.foto ? (
                                                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-black/20 group cursor-zoom-in"
                                                            onClick={() => window.open(`${API_URL}/uploads/pengembalian/${p.foto}`, '_blank')}>
                                                            <img
                                                                src={`${API_URL}/uploads/pengembalian/${p.foto}`}
                                                                alt="Bukti"
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground italic">No Photo</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                                        onClick={() => {
                                                            setViewingReturn(p) // Show local data first for instant feedback
                                                            setDetailId(p.id)
                                                            setIsDetailModalOpen(true)
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                                                onClick={() => handleEdit(p)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                                onClick={() => {
                                                                    setReturnToDelete(p)
                                                                    setIsDeleteModalOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Trash Section - Only for Staff */}
            {isStaff && (
                <Card className="glass border-white/10 shadow-2xl overflow-hidden mt-10">
                    <CardHeader className="bg-destructive/5 border-b border-white/5 py-4">
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-lg">Riwayat Dihapus (Trash)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/5">
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Peminjam</TableHead>
                                        <TableHead>Alat</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal Hapus</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingTrashed ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : trashedItems?.data?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Keranjang sampah kosong.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        trashedItems?.data?.map((item: any) => (
                                            <TableRow key={item.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                                                <TableCell className="font-mono text-xs">{item.peminjaman?.kode}</TableCell>
                                                <TableCell>{item.peminjaman?.peminjam?.name}</TableCell>
                                                <TableCell>{item.peminjaman?.alat?.nama}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 capitalize">
                                                        Terhapus
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {format(new Date(item.deleted_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-2 text-primary hover:bg-primary/10"
                                                        onClick={() => restoreMutation.mutate(item.id)}
                                                        disabled={restoreMutation.isPending}
                                                    >
                                                        {restoreMutation.isPending ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <RefreshCcw className="h-4 w-4" />
                                                        )}
                                                        Restore
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                setIsEditModalOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="sm:max-w-[500px] glass border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="h-5 w-5 text-primary" />
                            Edit Data Pengembalian
                        </DialogTitle>
                        <DialogDescription>
                            Perbarui informasi pengembalian untuk {editingReturn?.peminjaman?.kode}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit_tanggal_kembali">Tanggal & Waktu Kembali</Label>
                                    <Input
                                        id="edit_tanggal_kembali"
                                        type="datetime-local"
                                        className="glass h-10"
                                        value={formData.tanggal_kembali}
                                        onChange={(e) => setFormData(p => ({ ...p, tanggal_kembali: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit_kondisi_kembali">Kondisi Alat</Label>
                                    <Select
                                        value={formData.kondisi_kembali}
                                        onValueChange={(val) => setFormData(p => ({ ...p, kondisi_kembali: val }))}
                                    >
                                        <SelectTrigger className="glass h-10 w-full">
                                            <SelectValue placeholder="Pilih Kondisi" />
                                        </SelectTrigger>
                                        <SelectContent className="glass border-white/10">
                                            <SelectItem value="baik">Baik</SelectItem>
                                            <SelectItem value="rusak">Rusak</SelectItem>
                                            <SelectItem value="hilang">Hilang</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_catatan">Catatan Kondisi</Label>
                                <Input
                                    id="edit_catatan"
                                    placeholder="Kondisi alat saat kembali..."
                                    className="glass"
                                    value={formData.catatan}
                                    onChange={(e) => setFormData(p => ({ ...p, catatan: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Foto Bukti (Opsional)</Label>
                                <div className="grid grid-cols-1 gap-4">
                                    {imagePreview && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/20 group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setImagePreview(null)
                                                    setFormData(prev => ({ ...prev, foto: null }))
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className={`flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 transition-colors hover:border-primary/50 relative ${imagePreview ? 'h-32' : 'h-48'}`}>
                                        <Input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Plus className="h-8 w-8" />
                                            <span className="text-sm font-medium">
                                                {imagePreview ? 'Ganti Foto Bukti' : 'Upload Foto Bukti'}
                                            </span>
                                            <span className="text-xs">PNG, JPG atau GIF (Max. 2MB)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Menyimpan Perubahan...
                                    </>
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Scan Confirm Modal */}
            <Dialog open={isScanConfirmOpen} onOpenChange={(open) => {
                setIsScanConfirmOpen(open)
                if (!open) resetForm()
            }}>
                <DialogContent className="sm:max-w-[450px] glass border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ScanLine className="h-5 w-5 text-primary" />
                            Konfirmasi Pengembalian
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Lengkapi kondisi alat untuk: <span className="font-bold text-white uppercase tracking-wider">{formData.kode_peminjaman}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="confirm_kondisi" className="text-xs font-bold uppercase tracking-widest opacity-70">Pilih Kondisi Alat Saat Ini</Label>
                                <Select
                                    value={formData.kondisi_kembali}
                                    onValueChange={(val) => setFormData(p => ({ ...p, kondisi_kembali: val }))}
                                >
                                    <SelectTrigger className="glass h-12 w-full border-primary/20 hover:border-primary/50 transition-all">
                                        <SelectValue placeholder="Pilih Kondisi" />
                                    </SelectTrigger>
                                    <SelectContent className="glass border-white/10">
                                        <SelectItem value="baik">Kondisi Baik (Siap Pinjam)</SelectItem>
                                        <SelectItem value="rusak">Kondisi Rusak (Perlu Perbaikan)</SelectItem>
                                        <SelectItem value="hilang">Dinyatakan Hilang</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_catatan" className="text-xs font-bold uppercase tracking-widest opacity-70">Catatan/Keterangan</Label>
                                <Input
                                    id="confirm_catatan"
                                    placeholder="Contoh: Lecet sedikit, baterai habis, dll..."
                                    className="glass h-12"
                                    value={formData.catatan}
                                    onChange={(e) => setFormData(p => ({ ...p, catatan: e.target.value }))}
                                />
                            </div>

                            {formData.kondisi_kembali === 'rusak' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label className="text-destructive flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                        <AlertCircle className="h-3 w-3" />
                                        Foto Bukti Kerusakan (Wajib)
                                    </Label>
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => document.getElementById("confirm-foto-upload")?.click()}
                                    >
                                        <div className={`
                                            border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all
                                            ${imagePreview ? 'border-destructive/50 bg-destructive/5' : 'border-white/10 hover:border-destructive/40'}
                                        `}>
                                            {imagePreview ? (
                                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-inner">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-medium text-sm">
                                                        Ganti Foto
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 py-4">
                                                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
                                                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-destructive" />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-sm font-bold">Klik untuk upload foto</div>
                                                        <p className="text-[10px] text-muted-foreground italic">Foto alat yang rusak sebagai bukti</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Input
                                        id="confirm-foto-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 text-[11px] rounded-lg mt-1"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setImagePreview(null)
                                                setFormData(p => ({ ...p, foto: null }))
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            Hapus & Ganti Foto
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={createMutation.isPending || (formData.kondisi_kembali === 'rusak' && !formData.foto)} 
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sedang Menyimpan...
                                    </>
                                ) : (
                                    "Konfirmasi & Simpan Pengembalian"
                                )}
                            </Button>
                            {formData.kondisi_kembali === 'rusak' && !formData.foto && (
                                <p className="text-[10px] text-destructive/70 text-center mt-2 italic font-medium">
                                    * Mohon upload foto bukti kerusakan terlebih dahulu.
                                </p>
                            )}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-[600px] glass border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Eye className="h-6 w-6 text-blue-500" />
                            Detail Pengembalian
                            {isLoadingDetail && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
                        </DialogTitle>
                        <DialogDescription>
                            Informasi lengkap data pengembalian alat.
                        </DialogDescription>
                    </DialogHeader>

                    {viewingReturn && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Kode Peminjaman</Label>
                                        <div className="text-lg font-mono font-bold text-primary">{viewingReturn.peminjaman?.kode}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Nama Alat</Label>
                                        <div className="font-semibold text-foreground/90">{viewingReturn.peminjaman?.alat?.nama}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Peminjam</Label>
                                        <div className="font-medium">{viewingReturn.peminjaman?.peminjam?.name}</div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Tanggal Kembali</Label>
                                        <div className="text-sm">
                                            {format(new Date(viewingReturn.tanggal_dikembalikan || viewingReturn.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Kondisi Alat</Label>
                                        <div className="mt-1">
                                            <Badge className={`
                                                uppercase font-bold text-[10px] px-3 py-1 rounded-full
                                                ${viewingReturn.kondisi_kembali === 'baik' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                                                    viewingReturn.kondisi_kembali === 'rusak' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                                                        'bg-red-500/20 text-red-500 border-red-500/30'}
                                            `}>
                                                {viewingReturn.kondisi_kembali}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Foto Bukti</Label>
                                        <div className="mt-2 border border-white/10 rounded-xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center">
                                            {viewingReturn.foto ? (
                                                <img
                                                    src={`${API_URL}/uploads/pengembalian/${viewingReturn.foto}`}
                                                    alt="Bukti Pengembalian"
                                                    className="w-full h-full object-contain cursor-zoom-in"
                                                    onClick={() => window.open(`${API_URL}/uploads/pengembalian/${viewingReturn.foto}`, '_blank')}
                                                />
                                            ) : (
                                                <div className="text-muted-foreground/40 text-sm italic">Tidak ada foto bukti</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Catatan</Label>
                                        <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10 text-sm italic min-h-[60px]">
                                            {viewingReturn.catatan || "Tidak ada catatan."}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    className="w-full glass border-white/10"
                                    onClick={() => setIsDetailModalOpen(false)}
                                >
                                    Tutup Detail
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[400px] glass border-white/10">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Hapus Riwayat Pengembalian?</DialogTitle>
                        <DialogDescription className="text-center">
                            Tindakan ini tidak dapat dibatalkan. Status peminjaman akan dikembalikan menjadi <strong>Dipinjam</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            className="flex-1 glass hover:bg-white/5"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 shadow-lg shadow-destructive/20"
                            onClick={() => deleteMutation.mutate(returnToDelete?.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Ya, Hapus Data"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
