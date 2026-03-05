"use client"

import * as React from "react"
import { User as UserIcon, Mail, Shield, Calendar, MapPin, Phone, Camera, Settings2, LogOut, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { useAuth } from "@/contexts/auth-context"
import { apiService } from "../../../../services/api.service"
import { toast } from "sonner"

export default function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState({ name: "", email: "", no_hp: "", bio_singkat_ajasih: "", })
    const [foto, setFoto] = React.useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"

    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                no_hp: user.no_hp || "",
                bio_singkat_ajasih: user.bio_singkat_ajasih || "",
            })
            if (user.foto) {
                const photoUrl = user.foto.startsWith('http') ? user.foto : `${BACKEND_URL}/storage/${user.foto}`
                setPreviewUrl(photoUrl)
            }
        }
    }, [user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id === 'namaLengkap' ? 'name' : id === 'phone' ? 'no_hp' : id === 'bio' ? 'bio_singkat_ajasih' : id]: value
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFoto(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            await apiService.auth.updateProfile(user.id, {
                ...formData,
                foto: foto
            })
            toast.success("Profil berhasil diperbarui")
            await refreshUser()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.message || "Gagal memperbarui profil")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative rounded-3xl overflow-hidden glass border-white/10 h-64 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-blue-600/40 animate-pulse duration-[10s] blur-2xl opacity-50" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                    <div className="relative group/avatar">
                        <div className="h-32 w-32 rounded-3xl border-4 border-[#0b0f19] shadow-2xl overflow-hidden bg-primary/20 backdrop-blur-xl flex items-center justify-center transition-transform duration-300 group-hover/avatar:scale-105">
                            <Avatar className="h-full w-full rounded-2xl aspect-square shrink-0">
                                <AvatarImage src={previewUrl || ""} alt={`@${user?.name}`} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-4xl font-black">
                                    {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -right-2 -bottom-2 p-2 rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all scale-90 hover:scale-100"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="pb-2 space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">{user?.name || "User"}</h1>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md">
                                <Shield className="h-3 w-3 mr-1" />
                                {user?.role || "User"}
                            </Badge>
                        </div>
                        <p className="text-slate-300 font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 opacity-70" />
                            {user?.email || "email@example.com"}
                        </p>
                    </div>
                </div>

                <div className="absolute top-6 right-8 flex gap-3">
                    <Button variant="outline" className="glass border-white/10 hover:bg-white/5 h-10 gap-2">
                        <Settings2 className="h-4 w-4" />
                        Pengaturan
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-6">
                    <Card className="glass border-white/10 shadow-xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold">Ringkasan Akun</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Bergabung</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">12 Feb 2024</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Status</span>
                                    </div>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                        {user?.status || "Aktif"}
                                    </Badge>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive h-11 gap-2 mt-4 transition-all">
                                <LogOut className="h-4 w-4" />
                                Keluar dari Akun
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass border-white/10 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Verifikasi Identitas</CardTitle>
                            <CardDescription>Keamanan akun Anda sangat penting.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Email Terverifikasi</span>
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                                <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-primary animate-in slide-in-from-left duration-1000" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="lg:col-span-2 glass border-white/10 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Detail Personal</CardTitle>
                            <CardDescription>
                                Kelola informasi akun dan preferensi tampilan.
                            </CardDescription>
                        </div>
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <UserIcon className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <Separator className="bg-white/5" />
                    <CardContent className="pt-6 space-y-8">
                        <div className="space-y-2.5">
                            <Label htmlFor="namaLengkap" className="text-slate-300 font-medium ml-1">Nama Lengkap</Label>
                            <Input
                                id="namaLengkap"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="h-12 glass border-white/10 focus-visible:ring-primary/30 rounded-xl px-4"
                            />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2.5">
                                <Label htmlFor="email" className="text-slate-300 font-medium ml-1">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="h-12 glass border-white/10 focus-visible:ring-primary/30 rounded-xl px-4"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="phone" className="text-slate-300 font-medium ml-1">Nomor Telepon</Label>
                                <div className="relative">
                                    <Input
                                        id="phone"
                                        value={formData.no_hp}
                                        onChange={handleInputChange}
                                        className="h-12 glass border-white/10 focus-visible:ring-primary/30 rounded-xl pl-12 pr-4"
                                    />
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label htmlFor="bio" className="text-slate-300 font-medium ml-1">Bio atau Deskripsi Singkat</Label>
                            <Input
                                id="bio"
                                value={formData.bio_singkat_ajasih}
                                onChange={handleInputChange}
                                className="h-12 glass border-white/10 focus-visible:ring-primary/30 rounded-xl px-4"
                            />
                        </div>

                        <div className="flex items-center gap-4 justify-end pt-4">
                            <Button variant="ghost" className="hover:bg-white/5 h-11 px-8 rounded-xl font-medium">Batal</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-primary hover:bg-primary/95 text-primary-foreground shadow-xl shadow-primary/20 h-11 px-8 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
