"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PermissionsPage() {
    const queryClient = useQueryClient()
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [currentPermission, setCurrentPermission] = React.useState<any>(null)
    const [formData, setFormData] = React.useState({ name: "", description: "" })

    const { data: permissionsData, isLoading } = useQuery({
        queryKey: ["permissions"],
        queryFn: () => apiService.permission.getAll()
    })

    const permissions = permissionsData?.data || []

    const addMutation = useMutation({
        mutationFn: (data: any) => apiService.permission.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] })
            setIsAddModalOpen(false)
            setFormData({ name: "", description: "" })
            toast.success("Permission berhasil ditambahkan")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal menambahkan permission")
        }
    })

    const editMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => apiService.permission.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] })
            setIsEditModalOpen(false)
            setCurrentPermission(null)
            toast.success("Permission berhasil diperbarui")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal memperbarui permission")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiService.permission.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] })
            setIsDeleteModalOpen(false)
            setCurrentPermission(null)
            toast.success("Permission berhasil dihapus")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal menghapus permission")
        }
    })

    const columns = [
        {
            header: "Nama Permission",
            accessorKey: "name" as const,
            renderCell: (val: string) => (
                <code className="bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10">
                    {val}
                </code>
            )
        },
        {
            header: "Modul",
            accessorKey: "module" as const,
            renderCell: (val: string) => (
                <Badge variant="outline" className="glass">
                    {val}
                </Badge>
            )
        },
        { header: "Deskripsi", accessorKey: "description" as const },
    ]

    return (
        <div className="space-y-6">
            <DataTable
                title="Daftar Permission"
                data={permissions}
                loading={isLoading}
                columns={columns}
                onAdd={() => setIsAddModalOpen(true)}
                onEdit={(perm: any) => {
                    setCurrentPermission(perm)
                    setFormData({ name: perm.name, description: perm.description || "" })
                    setIsEditModalOpen(true)
                }}
                onDelete={(perm: any) => {
                    setCurrentPermission(perm)
                    setIsDeleteModalOpen(true)
                }}
                searchPlaceholder="Cari permission..."
            />

            {/* Add Modal */}
            <FormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Permission"
                onSave={() => addMutation.mutate(formData)}
                loading={addMutation.isPending}
                maxWidth="sm:max-w-[700px]"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nama Permission</Label>
                        <Input
                            placeholder="e.g. equipment.view"
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground">Gunakan format dot (misal: user.view) untuk auto-modul</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Input
                            placeholder="Deskripsi singkat..."
                            value={formData.description}
                            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Permission"
                onSave={() => editMutation.mutate({ id: currentPermission.id, data: formData })}
                loading={editMutation.isPending}
                maxWidth="sm:max-w-[700px]"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nama Permission</Label>
                        <Input
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Input
                            value={formData.description}
                            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </FormModal>

            {/* Delete Modal */}
            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteMutation.mutate(currentPermission.id)}
                loading={deleteMutation.isPending}
                title="Hapus Permission"
                description={`Apakah Anda yakin ingin menghapus permission "${currentPermission?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    )
}
