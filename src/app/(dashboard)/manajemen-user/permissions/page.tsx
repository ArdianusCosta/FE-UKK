"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const INITIAL_PERMISSIONS = [
    { id: 1, name: "view_dashboard", module: "Dashboard", description: "Melihat grafik dan statistik dashboard." },
    { id: 2, name: "manage_users", module: "User Management", description: "Tambah, edit, dan hapus user." },
    { id: 3, name: "manage_roles", module: "User Management", description: "Mengatur role dan permission." },
    { id: 4, name: "manage_equipment", module: "Master Data", description: "Mengelola data alat sekolah." },
    { id: 5, name: "create_transaction", module: "Transaksi", description: "Membuat data peminjaman baru." },
]

export default function PermissionsPage() {
    const [permissions, setPermissions] = React.useState(INITIAL_PERMISSIONS)
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
    const [currentPermission, setCurrentPermission] = React.useState<any>(null)
    const [formData, setFormData] = React.useState({ name: "", module: "", description: "" })

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

    const handleAdd = () => {
        const newPermission = {
            id: permissions.length + 1,
            ...formData
        }
        setPermissions([...permissions, newPermission])
        setIsAddModalOpen(false)
        setFormData({ name: "", module: "", description: "" })
        toast.success("Permission berhasil ditambahkan")
    }

    const handleEdit = () => {
        setPermissions(permissions.map(p => p.id === currentPermission.id ? { ...currentPermission, ...formData } : p))
        setIsEditModalOpen(false)
        setCurrentPermission(null)
        setFormData({ name: "", module: "", description: "" })
        toast.success("Permission berhasil diperbarui")
    }

    const handleDelete = () => {
        setPermissions(permissions.filter(p => p.id !== currentPermission.id))
        setIsDeleteModalOpen(false)
        setCurrentPermission(null)
        toast.success("Permission berhasil dihapus")
    }

    const openEditModal = (permission: any) => {
        setCurrentPermission(permission)
        setFormData({ name: permission.name, module: permission.module, description: permission.description })
        setIsEditModalOpen(true)
    }

    const openDeleteModal = (permission: any) => {
        setCurrentPermission(permission)
        setIsDeleteModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <DataTable
                title="Daftar Permission"
                data={permissions}
                columns={columns}
                onAdd={() => setIsAddModalOpen(true)}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                searchPlaceholder="Cari permission..."
            />

            {/* Add Modal */}
            <FormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Permission"
                onSave={handleAdd}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nama Permission</Label>
                        <Input
                            placeholder="e.g. manage_equipment"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Modul</Label>
                        <Input
                            placeholder="e.g. Master Data"
                            value={formData.module}
                            onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Input
                            placeholder="Deskripsi singkat..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Permission"
                onSave={handleEdit}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nama Permission</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Modul</Label>
                        <Input
                            value={formData.module}
                            onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </FormModal>

            {/* Delete Modal */}
            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Hapus Permission"
                description={`Apakah Anda yakin ingin menghapus permission "${currentPermission?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    )
}
