"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import { InteractiveParticles } from "@/components/interactive-particles"
import Link from "next/link"
import { toast } from "sonner"
import { apiService } from "../../../services/api.service"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await apiService.auth.forgotPassword(email)
            toast.success("Kode reset password telah dikirim ke email Anda")
            setTimeout(() => {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`)
            }, 2000)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal mengirim permintaan reset password")
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
                    <CardTitle className="text-2xl font-bold tracking-tight dark:text-white">Lupa Password</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Masukkan email atau username Anda untuk mengatur ulang kata sandi
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleResetPassword}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email / Username</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="admin@sekolah.sch.id"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            Kirim Instruksi Reset
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
