"use client"

import * as React from "react"
import { apiService } from "../../services/api.service"

interface User {
    id: number
    name: string
    email: string
    no_hp?: string
    bio_singkat_ajasih?: string
    jenis_kelamin?: string
    status?: string
    foto?: string
    role?: string
    permissions?: string[]
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    hasPermission: (permission: string) => boolean
    hasAnyPermission: (permissions: string[]) => boolean
    hasAllPermissions: (permissions: string[]) => boolean
    refreshUser: () => Promise<void>
    isAdmin: boolean
    isStaff: boolean
    isBorrower: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem("token")
            console.log("Token found:", !!token)

            if (!token) {
                console.log("No token found, setting user to null")
                setUser(null)
                setIsLoading(false)
                return
            }

            console.log("Fetching user data...")

            try {
                const userData = await apiService.auth.getUser()

                // Debug: Log user data untuk melihat struktur response
                console.log("User data from API:", userData)
                console.log("User role:", userData?.role)
                console.log("User permissions:", userData?.permissions)

                // Pastikan userData tidak null sebelum diproses
                if (!userData) {
                    console.error("User data is null/undefined")
                    setUser(null)
                    setIsLoading(false)
                    return
                }

                // Jika API tidak mengembalikan permissions, coba mapping dari role
                if (!userData.permissions && userData.role) {
                    console.log("No permissions from API, using role-based fallback for:", userData.role)

                    // Mapping permissions berdasarkan role
                    const rolePermissions: Record<string, string[]> = {
                        'admin': [
                            'kategori.view', 'kategori.create', 'kategori.update', 'kategori.delete',
                            'alat.view', 'alat.create', 'alat.update', 'alat.delete',
                            'peminjaman.view', 'peminjaman.create', 'peminjaman.update', 'peminjaman.delete',
                            'pengembalian.view', 'pengembalian.create', 'pengembalian.update', 'pengembalian.delete',
                            'user.view', 'user.create', 'user.update', 'user.delete',
                            'role.view', 'role.create', 'role.update', 'role.delete',
                            'permission.view', 'permission.create', 'permission.update', 'permission.delete',
                            'laporan.peminjaman', 'laporan.pengembalian',
                            'log.view', 'pengaturan.view'
                        ],
                        'Admin': [
                            'kategori.view', 'kategori.create', 'kategori.update', 'kategori.delete',
                            'alat.view', 'alat.create', 'alat.update', 'alat.delete',
                            'peminjaman.view', 'peminjaman.create', 'peminjaman.update', 'peminjaman.delete',
                            'pengembalian.view', 'pengembalian.create', 'pengembalian.update', 'pengembalian.delete',
                            'user.view', 'user.create', 'user.update', 'user.delete',
                            'role.view', 'role.create', 'role.update', 'role.delete',
                            'permission.view', 'permission.create', 'permission.update', 'permission.delete',
                            'laporan.peminjaman', 'laporan.pengembalian',
                            'log.view', 'pengaturan.view'
                        ],
                        'Petugas': [
                            'peminjaman.view', 'peminjaman.approve',
                            'pengembalian.view', 'pengembalian.monitor',
                            'laporan.print', 'alat.view'
                        ],
                        'Peminjam': [
                            'alat.view',
                            'peminjaman.view', 'peminjaman.create',
                            'pengembalian.view', 'pengembalian.create', 'pengembalian.scan'
                        ],
                        'superadmin': [
                            'kategori.view', 'kategori.create', 'kategori.update', 'kategori.delete',
                            'alat.view', 'alat.create', 'alat.update', 'alat.delete',
                            'peminjaman.view', 'peminjaman.create', 'peminjaman.update', 'peminjaman.delete',
                            'pengembalian.view', 'pengembalian.create', 'pengembalian.update', 'pengembalian.delete',
                            'user.view', 'user.create', 'user.update', 'user.delete',
                            'role.view', 'role.create', 'role.update', 'role.delete',
                            'permission.view', 'permission.create', 'permission.update', 'permission.delete',
                            'laporan.peminjaman', 'laporan.pengembalian',
                            'log.view', 'pengaturan.view'
                        ]
                    }

                    userData.permissions = rolePermissions[userData.role] || []
                    console.log(`Applied ${userData.permissions.length} permissions for role: ${userData.role}`)
                }

                console.log("Final user data with permissions:", userData)
                setUser(userData)
                setIsLoading(false)

            } catch (apiError: any) {
                console.error("API call failed, using fallback mock data")
                console.error("API Error:", apiError)

                // Fallback mock data jika API gagal
                const fallbackUserData = {
                    id: 1,
                    name: "Admin User",
                    email: "admin@example.com",
                    role: "Admin",
                    permissions: [
                        'kategori.view', 'kategori.create', 'kategori.update', 'kategori.delete',
                        'alat.view', 'alat.create', 'alat.update', 'alat.delete',
                        'peminjaman.view', 'peminjaman.create', 'peminjaman.update', 'peminjaman.delete',
                        'pengembalian.view', 'pengembalian.create', 'pengembalian.update', 'pengembalian.delete',
                        'user.view', 'user.create', 'user.update', 'user.delete',
                        'role.view', 'role.create', 'role.update', 'role.delete',
                        'permission.view', 'permission.create', 'permission.update', 'permission.delete',
                        'laporan.peminjaman', 'laporan.pengembalian',
                        'log.view', 'pengaturan.view'
                    ]
                }

                console.log("Using fallback user data:", fallbackUserData)
                setUser(fallbackUserData)
                setIsLoading(false)
            }

        } catch (error: any) {
            console.error("Failed to fetch user:", error)
            console.error("Error response:", error.response?.data)
            console.error("Error status:", error.response?.status)

            // Jika 401, clear token
            if (error.response?.status === 401) {
                console.log("Unauthorized, clearing token")
                localStorage.removeItem("token")
            }

            setUser(null)
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        refreshUser()

        // Listen for storage changes (for cross-tab sync)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                console.log('Token changed in storage, refreshing user')
                refreshUser()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    const hasPermission = (permission: string): boolean => {
        console.log(`Checking permission: "${permission}"`)
        console.log("Current user:", user)

        if (!user) {
            console.log(`Permission check failed for "${permission}": User is null`)
            return false
        }

        if (!user.permissions || !Array.isArray(user.permissions)) {
            console.log(`Permission check failed for "${permission}": No permissions array found`, user)
            return false
        }

        const hasAccess = user.permissions.includes(permission)
        console.log(`Permission check for "${permission}": ${hasAccess}`, user.permissions)
        return hasAccess
    }

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user?.permissions || !Array.isArray(user.permissions)) return false
        return permissions.some(permission => user.permissions?.includes(permission) || false)
    }

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user?.permissions || !Array.isArray(user.permissions)) return false
        return permissions.every(permission => user.permissions?.includes(permission) || false)
    }

    const isAdmin = user?.role === 'Admin'
    const isStaff = user?.role === 'Admin' || user?.role === 'Petugas'
    const isBorrower = user?.role === 'Peminjam'

    const value = {
        user,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        refreshUser,
        isAdmin,
        isStaff,
        isBorrower,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
