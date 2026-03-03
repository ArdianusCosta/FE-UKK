"use client"

import * as React from "react"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"

export default function UsersPage() {
    const queryClient = useQueryClient()
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<any>(null)

    // Form states
    const [formData, setFormData] = React.useState<any>({
        name: "",
        email: "",
        password: "",
        role: "Peminjam",
        status: "Aktif",
        foto: null
    })

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "Peminjam",
            status: "Aktif",
            foto: null
        })
    }

    const { data: userData, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => apiService.user.getAll()
    })

    const { data: rolesData } = useQuery({
        queryKey: ["roles"],
        queryFn: () => apiService.role.getAll()
    })

    const users = userData?.data || []
    const roles = rolesData?.data || []

    const addMutation = useMutation({
        mutationFn: (data: any) => apiService.user.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            setIsOpenAdd(false)
            resetForm()
            toast.success("User berhasil ditambahkan")
        },
        onError: (err: any) => {
            console.error(err)
            toast.error(err.response?.data?.message || "Gagal menambahkan user")
        }
    })

    const editMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => apiService.user.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            setIsOpenEdit(false)
            setSelectedUser(null)
            resetForm()
            toast.success("User berhasil diperbarui")
        },
        onError: (err: any) => {
            console.error(err)
            toast.error(err.response?.data?.message || "Gagal memperbarui user")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiService.user.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            setIsOpenDelete(false)
            setSelectedUser(null)
            toast.success("User berhasil dihapus")
        },
        onError: (err: any) => {
            console.error(err)
            toast.error(err.response?.data?.message || "Gagal menghapus user")
        }
    })

    const handleAdd = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
            toast.error("Mohon isi semua field yang diperlukan")
            return
        }
        addMutation.mutate(formData)
    }

    const handleEdit = () => {
        if (selectedUser) {
            editMutation.mutate({ id: selectedUser.id, data: formData })
        }
    }

    const handleDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id)
        }
    }

    const columns = [
        {
            header: "Foto",
            accessorKey: "foto" as const,
            renderCell: (val: string) => (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
                    {val ? (
                        <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${val}`}
                            alt="User"
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                                e.target.src = "https://ui-avatars.com/api/?name=User&background=random"
                            }}
                        />
                    ) : (
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                            U
                        </div>
                    )}
                </div>
            )
        },
        { header: "Nama", accessorKey: "name" as const },
        { header: "Email", accessorKey: "email" as const },
        {
            header: "Role",
            accessorKey: "role" as const,
            renderCell: (val: any) => {
                const roleName = val?.nama_role || val || "User"
                return (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {roleName}
                    </Badge>
                )
            }
        },
        {
            header: "Status",
            accessorKey: "status" as const,
            renderCell: (val: string) => {
                const isActive = val?.toLowerCase() === 'aktif' || val === 'Active' || val === '1';
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                    </div>
                )
            }
        },
    ]

    return (
        <div className="space-y-6">
            <DataTable
                title="Manajemen User"
                data={users}
                loading={isLoading}
                columns={columns}
                onAdd={() => {
                    resetForm()
                    setIsOpenAdd(true)
                }}
                onEdit={(user) => {
                    setSelectedUser(user)
                    setFormData({
                        name: user.name,
                        email: user.email,
                        password: "",
                        role: user.role || "Peminjam",
                        status: user.status || "Aktif",
                        foto: null
                    })
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
                loading={addMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                placeholder="Nama lengkap"
                                className="glass h-10 w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@contoh.com"
                                className="glass h-10 w-full"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                className="glass h-10 w-full"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger className="glass h-10 w-full">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    {roles.map((role: any) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger className="glass h-10 w-full">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="foto">Foto Profil</Label>
                            <Input
                                id="foto"
                                type="file"
                                className="glass cursor-pointer h-10 w-full file:bg-transparent file:border-0 file:text-sm file:font-medium file:text-foreground"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, foto: e.target.files?.[0] || null })}
                            />
                        </div>
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
                loading={editMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                                id="edit-name"
                                className="glass h-10 w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                className="glass h-10 w-full"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Password (Opsional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                placeholder="********"
                                className="glass h-10 w-full"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger className="glass h-10 w-full">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    {roles.map((role: any) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger className="glass h-10 w-full">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    <SelectItem value="Aktif">Aktif</SelectItem>
                                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-foto">Ganti Foto</Label>
                            <Input
                                id="edit-foto"
                                type="file"
                                className="glass cursor-pointer h-10 w-full file:bg-transparent file:border-0 file:text-sm file:font-medium file:text-foreground"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, foto: e.target.files?.[0] || null })}
                            />
                        </div>
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
