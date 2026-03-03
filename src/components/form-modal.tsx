"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FormModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    onSave: () => void
    saveLabel?: string
    loading?: boolean
}

export function FormModal({isOpen,onClose,title,description,children,onSave,saveLabel = "Simpan",loading = false,
}: FormModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] glass border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold dark:text-white">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {children}
                </div>
                <DialogFooter className="flex flex-row justify-between w-full">
                    <Button variant="outline" onClick={onClose} className="glass">
                        Batal
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {loading ? "Menyimpan..." : saveLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
