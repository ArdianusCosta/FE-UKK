"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../../../../services/api.service"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function RolesPage() {
    const queryClient = useQueryClient()
    const [isOpenAdd, setIsOpenAdd] = React.useState(false)
    const [isOpenEdit, setIsOpenEdit] = React.useState(false)
    const [isOpenDelete, setIsOpenDelete] = React.useState(false)
    const [selectedRole, setSelectedRole] = React.useState<any>(null)

    const [formData, setFormData] = React.useState<any>({
        name: "",
        description: "",
        permissions: []
    })

    const resetForm = () => {
        setFormData({ name: "", description: "", permissions: [] })
    }

    const { data: rolesData, isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: () => apiService.role.getAll()
    })

    const { data: permissionsData } = useQuery({
        queryKey: ["permissions"],
        queryFn: () => apiService.permission.getAll()
    })

    const roles = rolesData?.data || []
    const allPermissions = permissionsData?.data || []

    const addMutation = useMutation({
        mutationFn: (data: any) => apiService.role.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            setIsOpenAdd(false)
            resetForm()
            toast.success("Role berhasil ditambahkan")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal menambahkan role")
        }
    })

    const editMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => apiService.role.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            setIsOpenEdit(false)
            setSelectedRole(null)
            resetForm()
            toast.success("Role berhasil diperbarui")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal memperbarui role")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiService.role.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            setIsOpenDelete(false)
            setSelectedRole(null)
            toast.success("Role berhasil dihapus")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Gagal menghapus role")
        }
    })

    const handlePermissionChange = (permName: string) => {
        const current = [...formData.permissions]
        const index = current.indexOf(permName)
        if (index > -1) {
            current.splice(index, 1)
        } else {
            current.push(permName)
        }
        setFormData({ ...formData, permissions: current })
    }

    const columns = [
        { header: "Nama Role", accessorKey: "name" as const },
        { header: "Deskripsi", accessorKey: "description" as const },
        {
            header: "Jumlah User",
            accessorKey: "users_count" as const,
            renderCell: (val: number) => (
                <Badge variant="secondary" className="glass">
                    {val || 0} Users
                </Badge>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <DataTable
                title="Manajemen Role"
                data={roles}
                loading={isLoading}
                columns={columns}
                onAdd={() => {
                    resetForm()
                    setIsOpenAdd(true)
                }}
                onEdit={(role: any) => {
                    setSelectedRole(role)
                    setFormData({
                        name: role.name,
                        description: role.description || "",
                        permissions: role.permissions || []
                    })
                    setIsOpenEdit(true)
                }}
                onDelete={(role: any) => {
                    setSelectedRole(role)
                    setIsOpenDelete(true)
                }}
            />

            {/* Add Modal */}
            <FormModal
                isOpen={isOpenAdd}
                onClose={() => setIsOpenAdd(false)}
                title="Tambah Role Baru"
                onSave={() => addMutation.mutate(formData)}
                loading={addMutation.isPending}
                maxWidth="sm:max-w-[700px]"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Nama Role</Label>
                        <Input
                            id="role-name"
                            placeholder="Contoh: Editor"
                            className="glass"
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role-desc">Deskripsi</Label>
                        <Input
                            id="role-desc"
                            placeholder="Deskripsi singkat tentang role ini"
                            className="glass"
                            value={formData.description}
                            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto glass">
                            {allPermissions.map((perm: any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`perm-${perm.id}`}
                                        checked={formData.permissions.includes(perm.name)}
                                        onCheckedChange={() => handlePermissionChange(perm.name)}
                                    />
                                    <label htmlFor={`perm-${perm.id}`} className="text-sm font-medium leading-none">
                                        {perm.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FormModal>

            {/* Edit Modal */}
            <FormModal
                isOpen={isOpenEdit}
                onClose={() => setIsOpenEdit(false)}
                title="Edit Role"
                onSave={() => editMutation.mutate({ id: selectedRole.id, data: formData })}
                saveLabel="Perbarui"
                loading={editMutation.isPending}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-role-name">Nama Role</Label>
                        <Input
                            id="edit-role-name"
                            className="glass"
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-role-desc">Deskripsi</Label>
                        <Input
                            id="edit-role-desc"
                            className="glass"
                            value={formData.description}
                            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto glass">
                            {allPermissions.map((perm: any) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`edit-perm-${perm.id}`}
                                        checked={formData.permissions.includes(perm.name)}
                                        onCheckedChange={() => handlePermissionChange(perm.name)}
                                    />
                                    <label htmlFor={`edit-perm-${perm.id}`} className="text-sm font-medium leading-none">
                                        {perm.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FormModal>

            {/* Delete Dialog */}
            <ConfirmDialog
                isOpen={isOpenDelete}
                onClose={() => setIsOpenDelete(false)}
                onConfirm={() => deleteMutation.mutate(selectedRole.id)}
                loading={deleteMutation.isPending}
                title="Hapus Role?"
                description={`Apakah Anda yakin ingin menghapus role "${selectedRole?.name}"?`}
            />
        </div>
    )
}
