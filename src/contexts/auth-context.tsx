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

                // Jika API tidak mengembalikan permissions, pastikan minimal array kosong
                if (!userData.permissions) {
                    userData.permissions = []
                    console.log("No permissions from API, initialized empty array")
                }

                console.log("Final user data with permissions:", userData)
                setUser(userData)
                setIsLoading(false)

            } catch (apiError: any) {
                console.error("API call failed")
                console.error("API Error:", apiError)
                setUser(null)
                setIsLoading(false)
            }

        } catch (error: any) {
            console.error("Failed to fetch user:", error)
            setUser(null)
            setIsLoading(false)
            if (error.response?.status === 401) {
                localStorage.removeItem("token")
            }
        }
    }

    React.useEffect(() => {
        refreshUser()

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                refreshUser()
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const hasPermission = (permission: string): boolean => {
        if (!user?.permissions || !Array.isArray(user.permissions)) return false
        return user.permissions.includes(permission)
    }

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user?.permissions || !Array.isArray(user.permissions)) return false
        return permissions.some(permission => user.permissions?.includes(permission))
    }

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user?.permissions || !Array.isArray(user.permissions)) return false
        return permissions.every(permission => user.permissions?.includes(permission))
    }

    // Helper flags based on key permissions instead of hardcoded role names
    const isAdmin = hasPermission('role.view') || hasPermission('users.view')
    const isStaff = hasPermission('peminjaman.approve') || hasPermission('pengembalian.monitor') || isAdmin
    const isBorrower = hasPermission('peminjaman.create') && !hasPermission('peminjaman.approve')

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
