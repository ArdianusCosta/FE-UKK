"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Mail, ArrowLeft, Loader2, Lock } from "lucide-react"
import { InteractiveParticles } from "@/components/interactive-particles"
import Link from "next/link"
import { toast } from "sonner"
import { apiService } from "../../../services/api.service"

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const emailParam = searchParams.get('email') || ""

    const [formData, setFormData] = React.useState({
        email: emailParam,
        token: "",
        password: "",
        password_confirmation: ""
    })
    const [isLoading, setIsLoading] = React.useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.password_confirmation) {
            toast.error("Konfirmasi password tidak cocok")
            return
        }

        setIsLoading(true)
        try {
            await apiService.auth.resetPassword(formData)
            toast.success("Password berhasil direset. Silakan login.")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mereset password")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="dark min-h-screen w-full flex items-center justify-center gradient-bg p-4 overflow-hidden relative">
            <InteractiveParticles />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <Card className="w-full max-w-md glass border-white/10 relative z-10 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20">
                            SPA
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight dark:text-white">Reset Password</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Masukkan kode yang dikirim ke email Anda dan buat password baru
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleResetPassword}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@sekolah.sch.id"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 glass border-white/10 focus-visible:ring-primary/30 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token">Kode Reset (6 Digit)</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="token"
                                    type="text"
                                    placeholder="123456"
                                    required
                                    value={formData.token}
                                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                    className="pl-10 glass border-white/10 focus-visible:ring-primary/30 h-11"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password Baru</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 glass border-white/10 focus-visible:ring-primary/30 h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    className="pl-10 glass border-white/10 focus-visible:ring-primary/30 h-11"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 h-11 transition-all"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reset Password
                        </Button>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
