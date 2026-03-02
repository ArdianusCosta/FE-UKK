"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const MOCK_ROLES = [
    { id: 1, name: "Super Admin", description: "Akses penuh ke semua fitur sistem.", users_count: 2 },
    { id: 2, name: "Petugas", description: "Mengelola alat dan transaksi peminjaman.", users_count: 5 },
    { id: 3, name: "Peminjam", description: "Hanya dapat melihat dan mengajukan peminjaman.", users_count: 120 },
]

export default function RolesPage() {
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [selectedRole, setSelectedRole] = React.useState<any>(null)

    const columns = [
        { header: "Nama Role", accessorKey: "name" as const },
        { header: "Deskripsi", accessorKey: "description" as const },
        {
            header: "Jumlah User",
            accessorKey: "users_count" as const,
            renderCell: (val: number) => (
                <Badge variant="secondary" className="glass">
                    {val} Users
                </Badge>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <DataTable
                title="Manajemen Role"
                data={MOCK_ROLES}
                columns={columns}
                onAdd={() => setIsOpenAdd(true)}
                onEdit={(role) => {
                    setSelectedRole(role)
                    setIsOpenEdit(true)
                }}
                onDelete={(role) => {
                    setSelectedRole(role)
                    setIsOpenDelete(true)
                }}
            />

            {/* Add Modal */}
            <FormModal
                isOpen={isOpenAdd}
                onClose={() => setIsOpenAdd(false)}
                title="Tambah Role Baru"
                onSave={() => {
                    setIsOpenAdd(false)
                    toast.success("Role berhasil ditambahkan")
                }}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Nama Role</Label>
                        <Input id="role-name" placeholder="Contoh: Editor" className="glass" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role-desc">Deskripsi</Label>
                        <Input id="role-desc" placeholder="Deskripsi singkat tentang role ini" className="glass" />
                    </div>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                isOpen={isOpenEdit}
                onClose={() => setIsOpenEdit(false)}
                title="Edit Role"
                onSave={() => {
                    setIsOpenEdit(false)
                    toast.success("Role berhasil diperbarui")
                }}
                saveLabel="Perbarui"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-role-name">Nama Role</Label>
                        <Input id="edit-role-name" defaultValue={selectedRole?.name} className="glass" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-role-desc">Deskripsi</Label>
                        <Input id="edit-role-desc" defaultValue={selectedRole?.description} className="glass" />
                    </div>
                </div>
            </FormModal>

            {/* Delete Dialog */}
            <ConfirmDialog
                isOpen={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onConfirm={() => {
                    setIsOpenDelete(false)
                    toast.success("Role berhasil dihapus")
                }}
                title="Hapus Role?"
                description={`Apakah Anda yakin ingin menghapus role "${selectedRole?.name}"?`}
            />
        </div>
    )
}
