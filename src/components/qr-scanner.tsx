"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Loader2, ScanLine, Upload, Keyboard, Barcode } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

interface QRScannerProps {
    isOpen: boolean
    onScan: (data: string) => void
    onClose: () => void
}

export function QRScanner({ isOpen, onScan, onClose }: QRScannerProps) {
    const [mode, setMode] = React.useState<"device" | "camera">("device")
    const [inputValue, setInputValue] = React.useState("")
    const [isInitializing, setIsInitializing] = React.useState(true)
    const [isScanning, setIsScanning] = React.useState(false)
    const scannerRef = React.useRef<Html5Qrcode | null>(null)
    const transitionRef = React.useRef<boolean>(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const scannerId = "qr-reader-container"

    // Focus input on device mode open
    React.useEffect(() => {
        if (isOpen && mode === "device") {
            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen, mode])

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim()) {
            onScan(inputValue.trim())
            setInputValue("")
        }
    }

    const stopCamera = async () => {
        if (transitionRef.current) return

        if (scannerRef.current && scannerRef.current.isScanning) {
            transitionRef.current = true
            try {
                await scannerRef.current.stop()
                const container = document.getElementById(scannerId)
                if (container) container.innerHTML = ""
            } catch (err) {
                console.warn("Gagal menghentikan kamera:", err)
            } finally {
                transitionRef.current = false
            }
        }
        setIsScanning(false)
        setIsInitializing(false)
    }

    const startCamera = async () => {
        if (transitionRef.current) return

        try {
            setIsInitializing(true)
            transitionRef.current = true
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop()
                }
                const container = document.getElementById(scannerId)
                if (container) container.innerHTML = ""
            }

            const html5QrCode = new Html5Qrcode(scannerId)
            scannerRef.current = html5QrCode

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            }

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    onScan(decodedText)
                    stopCamera()
                },
                (errorMessage) => {
                }
            )

            setIsInitializing(false)
            setIsScanning(true)
        } catch (err) {
            console.error("Scanner Start Error:", err)
            if (isOpen) {
                toast.error("Gagal mengakses kamera. Mohon pastikan izin kamera aktif.")
            }
            setIsInitializing(false)
        } finally {
            transitionRef.current = false
        }
    }

    React.useEffect(() => {
        if (isOpen && mode === "camera") {
            const timer = setTimeout(() => {
                startCamera()
            }, 300)
            return () => {
                clearTimeout(timer)
                stopCamera()
            }
        } else {
            stopCamera()
        }
    }, [isOpen, mode])

    const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setIsInitializing(true)
            const performFileScan = async () => {
                await stopCamera()
                const html5QrCode = new Html5Qrcode(scannerId)
                html5QrCode.scanFile(file, true)
                    .then(decodedText => {
                        toast.success("QR Code berhasil dibaca!")
                        onScan(decodedText)
                    })
                    .catch(err => {
                        toast.error("Tidak ditemukan QR Code yang valid di gambar ini.")
                        if (mode === "camera") setTimeout(startCamera, 1000)
                    })
                    .finally(() => setIsInitializing(false))
            }
            performFileScan()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-white/10 glass max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <ScanLine className="h-5 w-5 text-primary" />
                        Scan Barcode / QR
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {mode === "device" 
                            ? "Gunakan alat scanner barcode (2D/1D) Anda untuk scan." 
                            : "Arahkan kamera ke kode QR peminjaman alat."}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => {
                                setMode("device")
                                setTimeout(() => inputRef.current?.focus(), 100)
                            }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                                mode === "device" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Barcode className="h-4 w-4" />
                            Alat Scanner (2D)
                        </button>
                        <button
                            onClick={() => setMode("camera")}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                                mode === "camera" ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <Camera className="h-4 w-4" />
                            Kamera
                        </button>
                    </div>

                    {mode === "device" ? (
                        <div className="space-y-4">
                            <form onSubmit={handleInputSubmit} className="flex flex-col gap-4">
                                <div className="relative">
                                    <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Fokuskan kursor di sini & scan..."
                                        className="pl-10 h-14 bg-black/40 border-white/10 text-lg text-center tracking-widest transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="text-xs text-center text-slate-400 font-medium">
                                    Pastikan alat scanner Anda terhubung dan kursor berada di dalam kotak input di atas.
                                </div>
                                <Button type="submit" className="w-full h-12 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                                    Proses Scan Manual
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner group flex items-center justify-center">
                            {isInitializing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-50 bg-slate-900/80 backdrop-blur-sm">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Memuat Kamera...</span>
                                </div>
                            )}
                            <div id={scannerId} className="absolute inset-0 z-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full border-none outline-none"></div>
                            {!isScanning && !isInitializing && (
                                <div className="absolute inset-0 flex items-center justify-center -z-10 bg-slate-900/50">
                                    <Camera className="w-12 h-12 text-white/10" />
                                </div>
                            )}
                            <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none z-10" />
                            <div className="absolute inset-x-12 inset-y-12 border-2 border-primary/50 pointer-events-none z-10 rounded-xl" />
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {mode === "camera" && (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    disabled={isInitializing}
                                    onClick={() => { stopCamera().then(() => startCamera()) }}
                                    className="h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />
                                    <span className="text-xs font-bold uppercase">Ulangi Kamera</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    disabled={isInitializing}
                                    onClick={() => document.getElementById('qr-file-upload')?.click()}
                                    className="h-12 glass border-white/10 hover:bg-white/5 text-white rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase">Upload</span>
                                </Button>
                                <input id="qr-file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileScan} />
                            </div>
                        )}
                        <Button variant="ghost" onClick={onClose} className="w-full h-11 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent">
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

