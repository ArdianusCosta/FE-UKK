"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems, NavItem } from "@/config/nav-items"
import { ChevronDown, Menu, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiService } from "../../services/api.service"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Sidebar() {
    return (
        <aside className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0 z-50 border-r bg-sidebar text-sidebar-foreground">
            <SidebarContent />
        </aside>
    )
}

export function MobileSidebar({ children }: { children: React.ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar">
                <div className="sr-only">
                    <SheetHeader>
                        <SheetTitle>Navigasi Menu</SheetTitle>
                    </SheetHeader>
                </div>
                <SidebarContent />
            </SheetContent>
        </Sheet>
    )
}

function SidebarContent() {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = React.useState(false)
    const { user, hasPermission, hasAnyPermission } = useAuth()

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await apiService.auth.logout()
            toast.success("Berhasil keluar")
            router.push("/login")
        } catch (error: any) {
            toast.error("Gagal keluar sistem")
            // Still redirect anyway if it's an auth error
            if (error.response?.status === 401) {
                router.push("/login")
            }
        } finally {
            setIsLoggingOut(false)
        }
    }

    const filterNavItems = (items: NavItem[]): NavItem[] => {
        return items.filter(item => {
            // Specific rule: Hide Master Data for Petugas
            if (item.title === "Master Data" && user?.role?.toLowerCase() === 'petugas') {
                return false
            }

            // Check if item has permission requirement
            if (item.permission) {
                if (Array.isArray(item.permission)) {
                    return hasAnyPermission(item.permission)
                } else {
                    return hasPermission(item.permission)
                }
            }
            return true
        }).map(item => {
            // Filter children if they exist
            if (item.children) {
                const filteredChildren = filterNavItems(item.children)
                return {
                    ...item,
                    children: filteredChildren
                }
            }
            return item
        }).filter(item => {
            // Remove parent items if all children are filtered out
            if (item.children && item.children.length === 0) {
                return false
            }
            return true
        })
    }

    const filteredNavItems = filterNavItems(navItems)

    return (
        <div className="flex flex-col h-full glass lg:bg-transparent lg:backdrop-blur-none">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">
                        SPA
                    </div>
                    <span className="dark:text-white">Sipinjam</span>
                </h1>
            </div>

            <ScrollArea className="flex-1 px-4">
                <nav className="space-y-2 pb-6">
                    {filteredNavItems.map((item) => (
                        <div key={item.title}>
                            {item.children ? (
                                <Collapsible defaultOpen={item.children.some(child => pathname === child.href)}>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                item.children.some(child => pathname === child.href) && "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                <span>{item.title}</span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-9 space-y-1 mt-1">
                                        {item.children.map((child: any) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                    pathname === child.href
                                                        ? "bg-primary text-primary-foreground font-medium"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {child.icon && <child.icon className="h-4 w-4" />}
                                                {child.title}
                                            </Link>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            ) : (
                                <Link
                                    href={item.href!}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-4 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        pathname === item.href
                                            ? "bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    {item.title}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium dark:text-white line-clamp-1">{user?.name || 'User'}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{user?.role || 'User'}</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        title="Keluar"
                    >
                        <LogOut className={cn("h-4 w-4", isLoggingOut && "animate-pulse")} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
