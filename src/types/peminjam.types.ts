export interface Peminjaman {
    id: number;
    kode: string;
    peminjam_id: number;
    alat_id: number;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    status: string;
    peminjam: { id: number; name: string };
    alat: { id: number; nama: string; foto: string | null };
}