"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const MOCK_USERS = [
    { id: 1, name: "Admin Utama", username: "admin", email: "admin@alatkita.com", role: "Super Admin", status: "Active" },
    { id: 2, name: "Budi Santoso", username: "budi", email: "budi@school.id", role: "Petugas", status: "Active" },
    { id: 3, name: "Iwan Fals", username: "iwan", email: "iwan@school.id", role: "Peminjam", status: "Inactive" },
    { id: 4, name: "Siti Aminah", username: "siti", email: "siti@school.id", role: "Petugas", status: "Active" },
]

export default function UsersPage() {
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<any>(null)

    const handleAdd = () => {
        setIsOpenAdd(false)
        toast.success("Data berhasil ditambahkan")
    }

    const handleEdit = () => {
        setIsOpenEdit(false)
        toast.success("Data berhasil diperbarui")
    }

    const handleDelete = () => {
        setIsOpenDelete(false)
        toast.success("Data berhasil dihapus")
    }

    const columns = [
        { header: "Nama", accessorKey: "name" as const },
        { header: "Username", accessorKey: "username" as const },
        { header: "Email", accessorKey: "email" as const },
        {
            header: "Role",
            accessorKey: "role" as const,
            renderCell: (val: string) => (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {val}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            renderCell: (val: string) => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${val === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{val}</span>
                </div>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <DataTable
                title="Manajemen User"
                data={MOCK_USERS}
                columns={columns}
                onAdd={() => setIsOpenAdd(true)}
                onEdit={(user) => {
                    setSelectedUser(user)
                    setIsOpenEdit(true)
                }}
                onDelete={(user) => {
                    setSelectedUser(user)
                    setIsOpenDelete(true)
                }}
            />

            {/* Add Modal */}
            <FormModal
                isOpen={isOpenAdd}
                onClose={() => setIsOpenAdd(false)}
                title="Tambah User Baru"
                description="Silahkan isi detail user di bawah ini."
                onSave={handleAdd}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" placeholder="Masukkan nama lengkap" className="glass" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="johndoe" className="glass" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select>
                                <SelectTrigger className="glass">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="admin">Super Admin</SelectItem>
                                    <SelectItem value="petugas">Petugas</SelectItem>
                                    <SelectItem value="peminjam">Peminjam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@contoh.com" className="glass" />
                    </div>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                isOpen={isOpenEdit}
                onClose={() => setIsOpenEdit(false)}
                title="Edit User"
                description="Perbarui informasi user yang dipilih."
                onSave={handleEdit}
                saveLabel="Perbarui"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nama Lengkap</Label>
                        <Input id="edit-name" defaultValue={selectedUser?.name} className="glass" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input id="edit-username" defaultValue={selectedUser?.username} className="glass" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select defaultValue={selectedUser?.role.toLowerCase().replace(' ', '-')}>
                                <SelectTrigger className="glass">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="super-admin">Super Admin</SelectItem>
                                    <SelectItem value="petugas">Petugas</SelectItem>
                                    <SelectItem value="peminjam">Peminjam</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input id="edit-email" type="email" defaultValue={selectedUser?.email} className="glass" />
                    </div>
                </div>
            </FormModal>

            {/* Delete Dialog */}
            <ConfirmDialog
                isOpen={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onConfirm={handleDelete}
                title="Hapus User?"
                description={`Apakah Anda yakin ingin menghapus user "${selectedUser?.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    )
}
