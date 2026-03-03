import { LayoutDashboard, Box, ClipboardList, Users, FileText, History, Settings, Wrench, Tags, ArrowUpCircle, ArrowDownCircle, UserCircle, ShieldCheck, Key } from "lucide-react"

export interface NavItem {
    title: string
    href?: string
    icon?: any
    permission?: string | string[]
    children?: NavItem[]
}

export const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Master Data",
        icon: Box,
        permission: ["kategori.view", "alat.view"],
        children: [
            {
                title: "Alat",
                href: "/master-data/alat",
                icon: Wrench,
                permission: "alat.view",
            },
            {
                title: "Kategori",
                href: "/master-data/kategori",
                icon: Tags,
                permission: "kategori.view",
            },
        ],
    },
    {
        title: "Transaksi",
        icon: ClipboardList,
        permission: ["peminjaman.view", "pengembalian.view"],
        children: [
            {
                title: "Peminjaman",
                href: "/transaksi/peminjaman",
                icon: ArrowUpCircle,
                permission: "peminjaman.view",
            },
            {
                title: "Pengembalian",
                href: "/transaksi/pengembalian",
                icon: ArrowDownCircle,
                permission: "pengembalian.view",
            },
        ],
    },
    {
        title: "Manajemen User",
        icon: Users,
        permission: ["user.view", "role.view", "permission.view"],
        children: [
            {
                title: "Users",
                href: "/manajemen-user/users",
                icon: UserCircle,
                permission: "user.view",
            },
            {
                title: "Roles",
                href: "/manajemen-user/roles",
                icon: ShieldCheck,
                permission: "role.view",
            },
            {
                title: "Permissions",
                href: "/manajemen-user/permissions",
                icon: Key,
                permission: "permission.view",
            },
        ],
    },
    {
        title: "Laporan",
        href: "/laporan",
        icon: FileText,
    },
    {
        title: "Log Aktivitas",
        href: "/log-aktivitas",
        icon: History,
        permission: "log.view",
    },
    {
        title: "Pengaturan",
        href: "/pengaturan",
        icon: Settings,
        permission: "pengaturan.view",
    },
]
