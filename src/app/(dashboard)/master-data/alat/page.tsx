"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PermissionGuard } from "@/components/permission-guard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Plus, Edit2, Trash2, Eye } from "lucide-react"
import { apiService } from "../../../../../services/api.service"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"

const STATUS_OPTIONS = [
    { value: "tersedia", label: "Tersedia", color: "bg-green-500" },
    { value: "dipinjam", label: "Dipinjam", color: "bg-blue-500" },
    { value: "maintenance", label: "Perbaikan", color: "bg-yellow-500" },
    { value: "habis", label: "Habis", color: "bg-red-500" },
]

export default function AlatPage() {
    const { user, isBorrower, isStaff, isAdmin } = useAuth()
    const queryClient = useQueryClient()
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [isOpenDetail, setIsOpenDetail] = React.useState(false)
    const [selectedAlat, setSelectedAlat] = React.useState<any>(null)
    const [kodeAlat, setKodeAlat] = React.useState("")
    const [namaAlat, setNamaAlat] = React.useState("")
    const [kategoriId, setKategoriId] = React.useState("")
    const [stok, setStok] = React.useState("1")
    const [status, setStatus] = React.useState("tersedia")
    const [foto, setFoto] = React.useState<File | null>(null)
    const [fotoPreview, setFotoPreview] = React.useState<string | null>(null)

    const { data: alatResponse, isLoading: isLoadingAlat } = useQuery({
        queryKey: ["alat"],
        queryFn: apiService.alat.getAll,
    })

    const { data: kategoriResponse } = useQuery({
        queryKey: ["kategori", "active"],
        queryFn: apiService.kategori.getActive,
    })

    const categories = kategoriResponse?.data || []
    const alats = (alatResponse?.data || []).map((alat: any) => ({
        ...alat,
        nama_kategori_alat: alat.nama_kategori_alat
            ?? categories.find((c: any) => c.id === alat.kategori_alat_id)?.nama_kategori_alat
            ?? "-",
        foto_url: alat.foto ? `${BACKEND_URL}/uploads/alat/${alat.foto}` : null,
    }))

    const resetForm = () => {
        setKodeAlat("")
        setNamaAlat("")
        setKategoriId("")
        setStok("1")
        setStatus("tersedia")
        setFoto(null)
        setFotoPreview(null)
        setSelectedAlat(null)
    }

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFoto(file)
        setFotoPreview(file ? URL.createObjectURL(file) : null)
    }

    const addMutation = useMutation({
        mutationFn: apiService.alat.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alat"] })
            toast.success("Alat berhasil ditambahkan")
            setIsOpenAdd(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menambahkan alat")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => apiService.alat.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alat"] })
            toast.success("Alat berhasil diperbarui")
            setIsOpenEdit(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui alat")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: apiService.alat.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alat"] })
            toast.success("Alat berhasil dihapus")
            setIsOpenDelete(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghapus alat")
        }
    })

    const columns = [
        {
            header: "Foto",
            accessorKey: "foto_url" as const,
            renderCell: (val: string) => val ? (
                <img
                    src={val}
                    alt="Foto alat"
                    className="h-10 w-10 rounded-md object-cover border"
                />
            ) : (
                <div className="h-10 w-10 rounded-md border flex items-center justify-center bg-muted">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
            )
        },
        { header: "Kode", accessorKey: "kode_alat" as const },
        { header: "Nama Alat", accessorKey: "nama_alat" as const },
        {
            header: "Kategori",
            accessorKey: "nama_kategori_alat" as const,
            renderCell: (val: string) => <Badge variant="outline">{val || "-"}</Badge>
        },
        { header: "Stok", accessorKey: "stok" as const },
        {
            header: "Status",
            accessorKey: "status" as const,
            renderCell: (val: string) => {
                const opt = STATUS_OPTIONS.find(s => s.value === val)
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${opt?.color || 'bg-gray-400'}`} />
                        <span>{opt?.label || val}</span>
                    </div>
                )
            }
        },
    ]

    const FotoUploadField = ({ id, hint }: { id: string; hint: string }) => (
        <div className="space-y-2">
            <Label htmlFor={id}>
                Foto Alat{" "}
                <span className="text-muted-foreground text-xs font-normal">({hint})</span>
            </Label>
            {fotoPreview ? (
                <div className="relative group">
                    <img
                        src={fotoPreview}
                        alt="Preview"
                        className="h-36 w-full object-cover rounded-lg border"
                    />
                    <button
                        type="button"
                        onClick={() => { setFoto(null); setFotoPreview(null) }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Hapus
                    </button>
                </div>
            ) : (
                <label
                    htmlFor={id}
                    className="flex flex-col items-center justify-center h-24 w-full border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Klik untuk upload foto</span>
                    <span className="text-xs text-muted-foreground">JPEG, PNG, JPG, GIF • maks 2MB</span>
                </label>
            )}
            <Input
                id={id}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                className="hidden"
                onChange={handleFotoChange}
            />
        </div>
    )

    return (
        <PermissionGuard permission="alat.view">
            <div className="space-y-6">
                {isLoadingAlat ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        {isStaff && <Skeleton className="h-10 w-full sm:w-32" />}
                    </div>
                ) : null}
                <DataTable
                    title=" "
                    data={alats}
                    columns={columns}
                    loading={isLoadingAlat}
                    showHeading={!isLoadingAlat}
                    onAdd={isStaff ? (() => { resetForm(); setIsOpenAdd(true) }) : undefined}
                    onEdit={isStaff ? ((alat) => {
                        const row = alat as any
                        setSelectedAlat(row)
                        setKodeAlat(row.kode_alat ?? row.kode ?? "")
                        setNamaAlat(row.nama_alat ?? row.nama ?? "")
                        setKategoriId(String(row.kategori_alat_id ?? ""))
                        setStok(String(row.stok ?? "1"))
                        setStatus(row.status || "tersedia")
                        setFoto(null)
                        setFotoPreview(row.foto_url ?? null)
                        setIsOpenEdit(true)
                    }) : undefined}
                    onDelete={isStaff ? ((alat) => {
                        setSelectedAlat(alat)
                        setIsOpenDelete(true)
                    }) : undefined}
                    renderActions={(alat) => (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => {
                                setSelectedAlat(alat)
                                setIsOpenDetail(true)
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                />

                <Dialog open={isOpenDetail} onOpenChange={setIsOpenDetail}>
                    <DialogContent className="sm:max-w-[500px] glass border-border/50">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold dark:text-white">Detail Alat</DialogTitle>
                        </DialogHeader>
                        {selectedAlat && (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-32 w-32 rounded-lg border overflow-hidden shrink-0">
                                        {selectedAlat.foto_url ? (
                                            <img src={selectedAlat.foto_url} alt={selectedAlat.nama_alat} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 py-1">
                                        <div className="text-xs font-mono text-muted-foreground">{selectedAlat.kode_alat}</div>
                                        <h3 className="text-xl font-bold">{selectedAlat.nama_alat}</h3>
                                        <Badge variant="secondary">{selectedAlat.nama_kategori_alat}</Badge>
                                        <div className="mt-2">
                                            {(() => {
                                                const opt = STATUS_OPTIONS.find(s => s.value === selectedAlat.status)
                                                return (
                                                    <Badge className={opt?.color}>{opt?.label || selectedAlat.status}</Badge>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Distribusi Stok</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-xl border bg-green-500/5 border-green-500/20 text-center">
                                            <div className="text-2xl font-bold text-green-500">{selectedAlat.stok_tersedia ?? 0}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Tersedia</div>
                                        </div>
                                        <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 text-center">
                                            <div className="text-2xl font-bold text-blue-500">{selectedAlat.stok_dipinjam ?? 0}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Dipinjam</div>
                                        </div>
                                        <div className="p-3 rounded-xl border bg-yellow-500/5 border-yellow-500/20 text-center">
                                            <div className="text-2xl font-bold text-yellow-500">{selectedAlat.stok_maintenance ?? 0}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Perbaikan</div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 pt-1">
                                        <div className="text-[10px] text-muted-foreground text-center italic">Total Alat: {selectedAlat.stok_total ?? 0} Unit</div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button variant="outline" onClick={() => setIsOpenDetail(false)} className="glass">Tutup</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <FormModal
                    isOpen={isOpenAdd}
                    onClose={() => { setIsOpenAdd(false); resetForm() }}
                    title="Tambah Alat Baru"
                    onSave={() => addMutation.mutate({
                        nama_alat: namaAlat,
                        kategori_alat_id: kategoriId,
                        stok: parseInt(stok),
                        status,
                        foto,
                    })}
                    loading={addMutation.isPending}
                >
                    <div className="space-y-4">
                        <FotoUploadField id="add-foto" hint="opsional" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-name">Nama Alat</Label>
                                <Input
                                    id="add-name"
                                    placeholder="Masukkan nama alat"
                                    className="glass"
                                    value={namaAlat}
                                    onChange={(e) => setNamaAlat(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-category">Kategori</Label>
                                <Select value={kategoriId} onValueChange={setKategoriId}>
                                    <SelectTrigger id="add-category" className="glass w-full">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat: any) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.nama_kategori_alat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-stock">Jumlah Stok</Label>
                                <Input
                                    id="add-stock"
                                    type="number"
                                    min="0"
                                    className="glass"
                                    value={stok}
                                    onChange={(e) => setStok(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="add-status" className="glass">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <span className="flex items-center gap-2">
                                                    <span className={`inline-block w-2 h-2 rounded-full ${opt.color}`} />
                                                    {opt.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </FormModal>

                <FormModal
                    isOpen={isOpenEdit}
                    onClose={() => { setIsOpenEdit(false); resetForm() }}
                    title="Edit Alat"
                    onSave={() => updateMutation.mutate({
                        id: selectedAlat.id,
                        data: {
                            nama_alat: namaAlat,
                            kategori_alat_id: kategoriId,
                            stok: parseInt(stok),
                            status,
                            foto
                        }
                    })}
                    saveLabel="Perbarui"
                    loading={updateMutation.isPending}
                >
                    <div className="space-y-4">
                        <FotoUploadField id="edit-foto" hint="kosongkan jika tidak ingin mengubah" />

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Kode Alat (otomatis)</Label>
                            <div className="px-3 py-2 rounded-md border bg-muted/40 text-sm font-mono text-muted-foreground">
                                {kodeAlat || "—"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Alat</Label>
                            <Input
                                id="edit-name"
                                className="glass"
                                value={namaAlat}
                                onChange={(e) => setNamaAlat(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Kategori</Label>
                            <Select value={kategoriId} onValueChange={setKategoriId}>
                                <SelectTrigger id="edit-category" className="glass w-full">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.nama_kategori_alat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-stock">Jumlah Stok</Label>
                                <Input
                                    id="edit-stock"
                                    type="number"
                                    min="0"
                                    className="glass"
                                    value={stok}
                                    onChange={(e) => setStok(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="edit-status" className="glass">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <span className="flex items-center gap-2">
                                                    <span className={`inline-block w-2 h-2 rounded-full ${opt.color}`} />
                                                    {opt.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </FormModal>

                <ConfirmDialog
                    isOpen={isOpenDelete}
                    onClose={() => setIsOpenDelete(false)}
                    onConfirm={() => deleteMutation.mutate(selectedAlat.id)}
                    title="Hapus Alat?"
                    description={`Apakah Anda yakin ingin menghapus "${selectedAlat?.nama_alat ?? selectedAlat?.nama}"?`}
                    loading={deleteMutation.isPending}
                />
            </div>
        </PermissionGuard>
    )
}
