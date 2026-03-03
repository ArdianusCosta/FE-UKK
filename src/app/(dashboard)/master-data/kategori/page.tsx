"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PermissionGuard } from "@/components/permission-guard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"

export default function KategoriPage() {
    const queryClient = useQueryClient()
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [selectedKategori, setSelectedKategori] = React.useState<any>(null)
    const [namaKategori, setNamaKategori] = React.useState("")
    const [status, setStatus] = React.useState("active")
    const { data: response, isLoading } = useQuery({
        queryKey: ["kategori"],
        queryFn: apiService.kategori.getAll,
    })

    const data = response?.data || []

    const addMutation = useMutation({
        mutationFn: apiService.kategori.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kategori"] })
            toast.success("Kategori berhasil ditambahkan")
            setIsOpenAdd(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menambahkan kategori")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: any }) =>
            apiService.kategori.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kategori"] })
            toast.success("Kategori berhasil diperbarui")
            setIsOpenEdit(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal memperbarui kategori")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: apiService.kategori.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kategori"] })
            toast.success("Kategori berhasil dihapus")
            setIsOpenDelete(false)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Gagal menghapus kategori")
        }
    })

    const resetForm = () => {
        setNamaKategori("")
        setStatus("active")
        setSelectedKategori(null)
    }

    const columns = [
        { header: "Nama Kategori", accessorKey: "nama_kategori_alat" as const },
        {
            header: "Status",
            accessorKey: "status" as const,
            renderCell: (val: string) => (
                <Badge variant={val === "active" ? "default" : "secondary"} className="capitalize">
                    {val}
                </Badge>
            )
        },
    ]

    return (
        <PermissionGuard permission="kategori.view">
            <div className="space-y-6">
                <DataTable
                    title="Kategori Alat"
                    data={data}
                    columns={columns}
                    loading={isLoading}
                    onAdd={() => {
                        resetForm()
                        setIsOpenAdd(true)
                    }}
                    onEdit={(cat) => {
                        setSelectedKategori(cat)
                        setNamaKategori(cat.nama_kategori_alat)
                        setStatus(cat.status)
                        setIsOpenEdit(true)
                    }}
                    onDelete={(cat) => {
                        setSelectedKategori(cat)
                        setIsOpenDelete(true)
                    }}
                />

            <FormModal
                isOpen={isOpenAdd}
                onClose={() => setIsOpenAdd(false)}
                title="Tambah Kategori"
                onSave={() => addMutation.mutate({ nama_kategori_alat: namaKategori, status })}
                loading={addMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">Nama Kategori</Label>
                        <Input
                            id="cat-name"
                            placeholder="Contoh: Elektronik"
                            className="glass"
                            value={namaKategori}
                            onChange={(e) => setNamaKategori(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cat-status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="glass w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent className="glass">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </FormModal>

            <FormModal
                isOpen={isOpenEdit}
                onClose={() => setIsOpenEdit(false)}
                title="Edit Kategori"
                onSave={() => updateMutation.mutate({
                    id: selectedKategori.id,
                    payload: { nama_kategori_alat: namaKategori, status }
                })}
                saveLabel="Perbarui"
                loading={updateMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-cat-name">Nama Kategori</Label>
                        <Input
                            id="edit-cat-name"
                            value={namaKategori}
                            onChange={(e) => setNamaKategori(e.target.value)}
                            className="glass"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-cat-status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="glass w-full">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent className="glass">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </FormModal>

            <ConfirmDialog
                isOpen={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onConfirm={() => deleteMutation.mutate(selectedKategori.id)}
                title="Hapus Kategori?"
                description={`Apakah Anda yakin ingin menghapus kategori "${selectedKategori?.nama_kategori_alat}"?`}
                loading={deleteMutation.isPending}
            />
            </div>
        </PermissionGuard>
    )
}
