"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<T> {
    title: string
    data: T[]
    columns: {
        header: string
        accessorKey: keyof T
        renderCell?: (value: any, item: T) => React.ReactNode
    }[]
    onAdd?: () => void
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
    searchPlaceholder?: string
    showHeading?: boolean
    loading?: boolean
    renderActions?: (item: T) => React.ReactNode
}

export function DataTable<T>({title,data,columns,onAdd,onEdit,onDelete,searchPlaceholder = "Cari data...",showHeading = true,loading = false,renderActions,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 10
    const filteredData = React.useMemo(() => {
        if (!data) return []
        return data.filter((item: any) => {
            return Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
        })
    }, [data, searchQuery])
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])
    return (
        <div className="space-y-4">
            {showHeading && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight dark:text-white">{title}</h2>
                        <p className="text-sm text-muted-foreground">Kelola {title.toLowerCase()}.</p>
                    </div>
                    {onAdd && (
                        <Button onClick={onAdd} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Data
                        </Button>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-10 glass focus-visible:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border/50 glass overflow-hidden">
                <Table>
                    <TableHeader className="bg-sidebar-accent/50">
                        <TableRow>
                            {columns.map((column, idx) => (
                                <TableHead key={idx} className="font-semibold text-primary">
                                    {column.header}
                                </TableHead>
                            ))}
                            {(onEdit || onDelete) && <TableHead className="text-right">Aksi</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span>Memuat data...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item, rowIdx) => (
                                <TableRow key={rowIdx} className="hover:bg-primary/5 transition-colors">
                                    {columns.map((column, colIdx) => (
                                        <TableCell key={colIdx}>
                                            {column.renderCell
                                                ? column.renderCell(item[column.accessorKey] as any, item)
                                                : (item[column.accessorKey] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                    {(onEdit || onDelete || renderActions) && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {renderActions && renderActions(item)}
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                                        onClick={() => onEdit(item)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                        onClick={() => onDelete(item)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                                    Data tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2 py-4">
                <p className="text-sm text-muted-foreground">
                    Menampilkan {Math.min(startIndex + 1, filteredData.length)}-{Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 glass"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className={`h-8 w-8 ${currentPage !== page ? "glass" : "shadow-sm"}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 glass"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
