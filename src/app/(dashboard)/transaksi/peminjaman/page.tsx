"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"
import { QRCodeSVG } from "qrcode.react"
import { FileText, Check, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"

const STATUS_VARIANTS: Record<string, string> = {
    'Pending': 'bg-yellow-500',
    'Dipinjam': 'bg-blue-500',
    'Ditolak': 'bg-slate-500',
    'Terlambat': 'bg-red-500',
    'Dikembalikan': 'bg-green-500'
}

interface Peminjaman {
    id: number;
    kode: string;
    peminjam_id: number;
    alat_id: number;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    status: string;
    peminjam: { id: number; name: string };
    alat: { id: number; nama: string; foto: string | null };
}

export default function PeminjamanPage() {
    const { user, hasPermission, isAdmin, isStaff, isBorrower } = useAuth()
    const queryClient = useQueryClient()
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [isOpenReceipt, setIsOpenReceipt] = React.useState(false)
    const [selectedTrx, setSelectedTrx] = React.useState<Peminjaman | null>(null)
    const [formData, setFormData] = React.useState({
        peminjam_id: "",
        alat_id: "",
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        tanggal_kembali: "",
        status: "Pending"
    })

    // Fetch Data
    const { data: peminjamanResponse, isLoading } = useQuery({
        queryKey: ["peminjaman"],
        queryFn: apiService.peminjaman.getAll
    })

    const { data: users = [] } = useQuery({
        queryKey: ["users-chat"],
        queryFn: apiService.chat.getChat
    })

    const { data: alatResponse } = useQuery({
        queryKey: ["alat"],
        queryFn: apiService.alat.getAll
    })

    const alats = alatResponse?.data || []
    const peminjamans: Peminjaman[] = peminjamanResponse?.data || []

    // Mutations
    const createMutation = useMutation({
        mutationFn: apiService.peminjaman.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peminjaman"] })
            queryClient.invalidateQueries({ queryKey: ["alat"] })
            setIsOpenAdd(false)
            toast.success("Data peminjaman berhasil dicatat")
            setFormData({
                peminjam_id: "",
                alat_id: "",
                tanggal_pinjam: new Date().toISOString().split('T')[0],
                tanggal_kembali: "",
                status: "Pending"
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal mencatat peminjaman")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => apiService.peminjaman.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peminjaman"] })
            setIsOpenEdit(false)
            toast.success("Data peminjaman berhasil diperbarui")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui data")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: apiService.peminjaman.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peminjaman"] })
            queryClient.invalidateQueries({ queryKey: ["alat"] })
            setIsOpenDelete(false)
            toast.success("Data peminjaman berhasil dihapus")
        }
    })

    const approveMutation = useMutation({
        mutationFn: apiService.peminjaman.approve,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peminjaman"] })
            queryClient.invalidateQueries({ queryKey: ["alat"] })
            toast.success("Peminjaman disetujui")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menyetujui peminjaman")
        }
    })

    const rejectMutation = useMutation({
        mutationFn: apiService.peminjaman.reject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["peminjaman"] })
            toast.success("Peminjaman ditolak")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menolak peminjaman")
        }
    })

    const columns = [
        { header: "Kode PINJAM", accessorKey: "kode" as const },
        {
            header: "Foto",
            accessorKey: "alat" as const,
            renderCell: (_: any, row: Peminjaman) => (
                <div className="h-10 w-10 rounded-lg overflow-hidden glass border border-white/10">
                    {row.alat?.foto ? (
                        <img
                            src={`http://localhost:8000/uploads/alat/${row.alat.foto}`}
                            alt={row.alat.nama}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted text-[10px] text-muted-foreground">
                            No Item
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Peminjam",
            accessorKey: "peminjam" as const,
            renderCell: (_: any, row: Peminjaman) => row.peminjam?.name || "-"
        },
        {
            header: "Alat",
            accessorKey: "alat" as const,
            renderCell: (_: any, row: Peminjaman) => row.alat?.nama || "-"
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            renderCell: (val: string) => (
                <Badge className={cn("text-white", STATUS_VARIANTS[val] || 'bg-gray-500')}>
                    {val}
                </Badge>
            )
        },
        {
            header: "Tgl Pinjam",
            accessorKey: "tanggal_pinjam" as const,
            renderCell: (val: string) => val ? format(new Date(val), "dd MMMM yyyy", { locale: id }) : "-"
        },
        {
            header: "Tgl Kembali",
            accessorKey: "tanggal_kembali" as const,
            renderCell: (val: string) => val ? format(new Date(val), "dd MMMM yyyy", { locale: id }) : "-"
        },
    ]

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6">
            <DataTable<Peminjaman>
                title="Peminjaman Alat"
                data={peminjamans}
                columns={columns as any}
                loading={isLoading}
                onAdd={isAdmin || isBorrower ? (() => {
                    setFormData({
                        peminjam_id: isBorrower ? user?.id?.toString() || "" : "",
                        alat_id: "",
                        tanggal_pinjam: new Date().toISOString().split('T')[0],
                        tanggal_kembali: "",
                        status: "Pending"
                    })
                    setIsOpenAdd(true)
                }) : undefined}
                onEdit={isAdmin || isBorrower ? ((trx) => {
                    setSelectedTrx(trx)
                    setFormData({
                        peminjam_id: trx.peminjam_id.toString(),
                        alat_id: trx.alat_id.toString(),
                        tanggal_pinjam: trx.tanggal_pinjam,
                        tanggal_kembali: trx.tanggal_kembali || "",
                        status: trx.status
                    })
                    setIsOpenEdit(true)
                }) : undefined}
                onDelete={isAdmin || isBorrower ? ((trx) => {
                    setSelectedTrx(trx)
                    setIsOpenDelete(true)
                }) : undefined}
                renderActions={(item) => (
                    <div className="flex items-center gap-3">
                        {hasPermission('peminjaman.approve') && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-[10px] font-medium uppercase tracking-wider opacity-50">Approve</span>
                                <Switch
                                    checked={item.status !== 'Pending'}
                                    disabled={item.status !== 'Pending' || approveMutation.isPending}
                                    onCheckedChange={(checked) => {
                                        if (checked) approveMutation.mutate(item.id)
                                    }}
                                    size="sm"
                                />
                                {approveMutation.isPending && (
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                )}
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={() => {
                                setSelectedTrx(item)
                                setIsOpenReceipt(true)
                            }}
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            />

            {/* Form Add */}
            <FormModal
                isOpen={isOpenAdd}
                onClose={() => setIsOpenAdd(false)}
                title="Buat Peminjaman Baru"
                onSave={() => {
                    if (!formData.peminjam_id || !formData.alat_id) {
                        toast.error("Mohon lengkapi data")
                        return
                    }
                    createMutation.mutate({
                        peminjam_id: Number(formData.peminjam_id),
                        alat_id: Number(formData.alat_id),
                        tanggal_pinjam: formData.tanggal_pinjam,
                        tanggal_kembali: formData.tanggal_kembali || null,
                        status: formData.status
                    })
                }}
                loading={createMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Kode Pinjam</Label>
                        <Input value="AUTO" disabled className="glass opacity-50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Peminjam</Label>
                        {isBorrower ? (
                            <Input value={user?.name} disabled className="glass opacity-50" />
                        ) : (
                            <Select
                                value={formData.peminjam_id}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, peminjam_id: val }))}
                            >
                                <SelectTrigger className="glass w-full">
                                    <SelectValue placeholder="Pilih User" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    {users.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Alat</Label>
                        <Select
                            value={formData.alat_id}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, alat_id: val }))}
                        >
                            <SelectTrigger className="glass w-full">
                                <SelectValue placeholder="Pilih Alat" />
                            </SelectTrigger>
                            <SelectContent className="glass">
                                {alats.map((alat: any) => (
                                    <SelectItem
                                        key={alat.id}
                                        value={alat.id.toString()}
                                        disabled={alat.stok <= 0}
                                    >
                                        {alat.nama} {alat.stok <= 0 ? '(Stok Habis)' : `(Stok: ${alat.stok})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal Pinjam</Label>
                            <Input
                                id="date"
                                type="date"
                                className="glass"
                                value={formData.tanggal_pinjam}
                                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_pinjam: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="return_date">Tanggal Kembali</Label>
                            <Input
                                id="return_date"
                                type="date"
                                className="glass"
                                min={formData.tanggal_pinjam}
                                value={formData.tanggal_kembali}
                                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_kembali: e.target.value }))}
                            />
                        </div>
                    </div>
                    {!isBorrower && (
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                            >
                                <SelectTrigger className="glass w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                                    <SelectItem value="Terlambat">Terlambat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </FormModal>

            {/* Form Edit */}
            <FormModal
                isOpen={isOpenEdit}
                onClose={() => setIsOpenEdit(false)}
                title={`Edit Peminjaman - ${selectedTrx?.kode}`}
                onSave={() => {
                    if (selectedTrx) {
                        updateMutation.mutate({
                            id: selectedTrx.id,
                            data: {
                                tanggal_pinjam: formData.tanggal_pinjam,
                                tanggal_kembali: formData.tanggal_kembali || null,
                                status: formData.status
                            }
                        })
                    }
                }}
                loading={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Peminjam</Label>
                            <Input value={selectedTrx?.peminjam?.name} disabled className="glass opacity-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Alat</Label>
                            <Input value={selectedTrx?.alat?.nama} disabled className="glass opacity-50" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-date">Tanggal Pinjam</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                className="glass"
                                value={formData.tanggal_pinjam}
                                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_pinjam: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-return-date">Tanggal Kembali</Label>
                            <Input
                                id="edit-return-date"
                                type="date"
                                className="glass"
                                min={formData.tanggal_pinjam}
                                value={formData.tanggal_kembali}
                                onChange={(e) => setFormData(prev => ({ ...prev, tanggal_kembali: e.target.value }))}
                            />
                        </div>
                    </div>
                    {!isBorrower && (
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                            >
                                <SelectTrigger className="glass w-full">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Dipinjam">Dipinjam</SelectItem>
                                    <SelectItem value="Terlambat">Terlambat</SelectItem>
                                    <SelectItem value="Dikembalikan">Dikembalikan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </FormModal>

            {/* Receipt Modal */}
            <FormModal
                isOpen={isOpenReceipt}
                onClose={() => setIsOpenReceipt(false)}
                title="Bukti Peminjaman"
                saveLabel="Cetak Bukti"
                onSave={handlePrint}
            >
                <div id="receipt-content" className="space-y-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start border-b border-border pb-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold">Resi Peminjaman</h3>
                            <p className="text-sm font-mono text-primary">{selectedTrx?.kode}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-border">
                            <QRCodeSVG value={selectedTrx?.kode || "N/A"} size={80} />
                        </div>
                    </div>

                    <div className="flex gap-4 items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted">
                            {selectedTrx?.alat?.foto ? (
                                <img
                                    src={`http://localhost:8000/uploads/alat/${selectedTrx.alat.foto}`}
                                    alt={selectedTrx.alat.nama}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Alat yang Dipinjam</p>
                            <p className="font-bold text-lg">{selectedTrx?.alat?.nama}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Peminjam</p>
                            <p className="font-semibold">{selectedTrx?.peminjam?.name}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Tanggal</p>
                            <p className="font-semibold">{selectedTrx?.tanggal_pinjam}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge className={selectedTrx ? (STATUS_VARIANTS[selectedTrx.status] || 'bg-gray-500') : ''}>
                                {selectedTrx?.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Waktu Cetak</p>
                            <p className="font-mono text-[10px]">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </FormModal>

            <ConfirmDialog
                isOpen={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onConfirm={() => selectedTrx && deleteMutation.mutate(selectedTrx.id)}
                loading={deleteMutation.isPending}
                title="Hapus Transaksi?"
                description={`Menghapus pinjaman "${selectedTrx?.kode}"? Stok alat akan dikembalikan otomatis.`}
            />
        </div>
    )
}
