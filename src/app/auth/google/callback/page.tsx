"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

function CallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get("token")
        const userId = searchParams.get("user_id")

        if (token && userId) {
            localStorage.setItem("token", token)
            localStorage.setItem("user_id", userId)
            toast.success("Login Google berhasil!")
            router.push("/dashboard")
        } else {
            toast.error("Login Google gagal. Token tidak ditemukan.")
            router.push("/login")
        }
    }, [router, searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white font-medium">Memproses login Google...</p>
            </div>
        </div>
    )
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white font-medium">Memuat...</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    )
}
