"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface PermissionGuardProps {
    children: React.ReactNode
    permission?: string | string[]
    requireAll?: boolean
    fallback?: React.ReactNode
}

export function PermissionGuard({ children, permission, requireAll = false,fallback 
}: PermissionGuardProps) {
    const { user, isLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()
    const router = useRouter()
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        router.push("/login")
        return null
    }

    if (!permission) {
        return <>{children}</>
    }

    let hasAccess = false
    if (Array.isArray(permission)) {
        hasAccess = requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission)
    } else {
        hasAccess = hasPermission(permission)
    }

    if (!hasAccess) {
        if (fallback) {
            return <>{fallback}</>
        }
        
        React.useEffect(() => {
            toast.error("Anda tidak memiliki izin untuk mengakses halaman ini")
            router.push("/dashboard")
        }, [router])

        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-muted-foreground mb-2">Akses Ditolak</h2>
                    <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
export function withPermission<P extends object>(
    Component: React.ComponentType<P>,
    permission?: string | string[],
    requireAll = false
) {
    return function PermissionWrapper(props: P) {
        return (
            <PermissionGuard permission={permission} requireAll={requireAll}>
                <Component {...props} />
            </PermissionGuard>
        )
    }
}
