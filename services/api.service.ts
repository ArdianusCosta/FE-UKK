import api from "@/lib/axios"

export const apiService = {
    // Auth
    auth: {
        login: async (credentials: any) => {
            const response = await api.post("/login", credentials);
            return response.data;
        },
        logout: async () => {
            const response = await api.post("/logout");
            return response.data;
        },
        getUser: async () => {
            const response = await api.get("/user");
            return response.data;
        },
        updateProfile: async (id: number, data: any) => {
            const fd = new FormData();
            fd.append("_method", "PATCH");
            if (data.name) fd.append("name", data.name);
            if (data.email) fd.append("email", data.email);
            if (data.password) fd.append("password", data.password);
            if (data.no_hp) fd.append("no_hp", data.no_hp);
            if (data.bio_singkat_ajasih) fd.append("bio_singkat_ajasih", data.bio_singkat_ajasih);
            if (data.jenis_kelamin) fd.append("jenis_kelamin", data.jenis_kelamin);
            if (data.status) fd.append("status", data.status);
            if (data.current_password) fd.append("current_password", data.current_password);
            if (data.password) fd.append("password", data.password);
            if (data.password_confirmation) fd.append("password_confirmation", data.password_confirmation);
            if (data.foto instanceof File) {
                fd.append("foto", data.foto);
            }
            const response = await api.post("/user/update", fd);
            return response.data;
        },
        forgotPassword: async (email: string) => {
            const response = await api.post("/forgot-password", { email });
            return response.data;
        },
        resetPassword: async (data: any) => {
            const response = await api.post("/reset-password", data);
            return response.data;
        }
    },

    // kategori
    kategori: {
        getAll: async () => {
            const response = await api.get("/master-data/kategori-alat");
            return response.data;
        },
        getActive: async () => {
            const response = await api.get("/master-data/kategori-alat/active");
            return response.data;
        },
        create: async (data: { nama_kategori_alat: string; status?: string }) => {
            const response = await api.post("/master-data/kategori-alat", data);
            return response.data;
        },
        update: async (id: number, data: { nama_kategori_alat: string; status?: string }) => {
            const response = await api.patch(`/master-data/kategori-alat/${id}`, data);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await api.delete(`/master-data/kategori-alat/${id}`);
            return response.data;
        }
    },

    // alat
    alat: {
        getAll: async () => {
            const response = await api.get("/alats");
            if (response.data?.data) {
                response.data.data = response.data.data.map((item: any) => ({
                    ...item,
                    nama_alat: item.nama_alat ?? item.nama,
                    kode_alat: item.kode_alat ?? item.kode,
                    nama_kategori_alat:
                        item.nama_kategori_alat ??
                        item.kategori_alat?.nama_kategori_alat ??
                        null,
                }));
            }
            return response.data;
        },
        getById: async (id: number) => {
            const response = await api.get(`/alats/${id}`);
            return response.data;
        },
        create: async (data: any) => {
            const fd = new FormData()
            fd.append("nama", data.nama_alat ?? data.nama ?? "")
            fd.append("kategori_alat_id", String(data.kategori_alat_id ?? ""))
            fd.append("stok", String(data.stok ?? 1))
            fd.append("status", data.status ?? "tersedia")
            if (data.foto instanceof File) {
                fd.append("foto", data.foto)
            }
            const response = await api.post("/alats", fd)
            return response.data
        },
        update: async (id: number, data: any) => {
            const fd = new FormData()
            fd.append("_method", "PATCH")
            fd.append("nama", data.nama_alat ?? data.nama ?? "")
            fd.append("kategori_alat_id", String(data.kategori_alat_id ?? ""))
            fd.append("stok", String(data.stok ?? 1))
            fd.append("status", data.status ?? "tersedia")
            if (data.foto instanceof File) {
                fd.append("foto", data.foto)
            }
            const response = await api.post(`/alats/${id}`, fd)
            return response.data
        },
        delete: async (id: number) => {
            const response = await api.delete(`/alats/${id}`);
            return response.data;
        }
    },

    //message
    chat: {
        getChat: async () => {
            const response = await api.get("/users-chat")
            return response.data;
        },
        getChatById: async (id: number) => {
            const response = await api.get(`/messages/${id}`)
            return response.data;
        },
        kirimChat: async (data: { receiver_id: number; message?: string; image?: File; file?: File }) => {
            const fd = new FormData();
            fd.append('receiver_id', String(data.receiver_id));
            if (data.message) fd.append('message', data.message);
            if (data.image) fd.append('image', data.image);
            if (data.file) fd.append('file', data.file);
            const response = await api.post('/messages', fd);
            return response.data;
        },
        updateMessage: async (id: number, data: { message: string }) => {
            const response = await api.patch(`/messages/${id}`, data);
            return response.data;
        },
        deleteMessage: async (id: number) => {
            const response = await api.delete(`/messages/${id}`);
            return response.data;
        },
        markAsRead: async (senderId: number) => {
            const response = await api.post(`/messages/${senderId}/read`);
            return response.data;
        }
    },

    // Peminjaman
    peminjaman: {
        getAll: async () => {
            const response = await api.get("/peminjamans");
            return response.data;
        },
        create: async (data: { alat_id: number; peminjam_id: number; tanggal_pinjam?: string; tanggal_kembali?: string | null; status?: string }) => {
            const response = await api.post("/peminjamans", data);
            return response.data;
        },
        update: async (id: number, data: { tanggal_pinjam?: string; tanggal_kembali?: string | null; status?: string }) => {
            const response = await api.patch(`/peminjamans/${id}`, data);
            return response.data;
        },
        kembalikan: async (data: { kode: string }) => {
            const response = await api.post("/peminjamans/kembalikan", data);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await api.delete(`/peminjamans/${id}`);
            return response.data;
        },
        approve: async (id: number) => {
            const response = await api.post(`/peminjamans/${id}/approve`);
            return response.data;
        },
        reject: async (id: number) => {
            const response = await api.post(`/peminjamans/${id}/reject`);
            return response.data;
        },
        downloadReceipt: async (id: number) => {
            const response = await api.get(`/peminjamans/${id}/download`, {
                responseType: 'blob'
            });
            return response.data;
        }
    },

    // Pengembalian
    // User Management
    user: {
        getAll: async () => {
            const response = await api.get("/users-profile");
            return response.data;
        },
        create: async (data: any) => {
            const fd = new FormData();
            fd.append("name", data.name);
            fd.append("email", data.email);
            fd.append("password", data.password);
            fd.append("role", data.role);
            if (data.status) fd.append("status", data.status);
            if (data.foto instanceof File) {
                fd.append("foto", data.foto);
            }
            const response = await api.post("/users-profile", fd);
            return response.data;
        },
        update: async (id: number, data: any) => {
            const fd = new FormData();
            fd.append("_method", "PATCH");
            if (data.name) fd.append("name", data.name);
            if (data.email) fd.append("email", data.email);
            if (data.password) fd.append("password", data.password);
            if (data.role) fd.append("role", data.role);
            if (data.status) fd.append("status", data.status);
            if (data.foto instanceof File) {
                fd.append("foto", data.foto);
            }
            const response = await api.post(`/users-profile/${id}`, fd);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await api.delete(`/users-profile/${id}`);
            return response.data;
        }
    },
    pengembalian: {
        getAll: async () => {
            const response = await api.get("/pengembalians");
            return response.data;
        },
        getById: async (id: number) => {
            const response = await api.get(`/pengembalians/${id}`);
            return response.data;
        },
        create: async (data: any) => {
            const fd = new FormData();
            if (data.peminjaman_id) fd.append("peminjaman_id", String(data.peminjaman_id));
            if (data.kode_peminjaman) fd.append("kode_peminjaman", data.kode_peminjaman);
            fd.append("kondisi_kembali", data.kondisi_kembali);
            if (data.catatan) fd.append("catatan", data.catatan);
            if (data.metode) fd.append("metode", data.metode);
            if (data.foto instanceof File) {
                fd.append("foto", data.foto);
            }
            const response = await api.post("/pengembalians", fd);
            return response.data;
        },
        update: async (id: number, data: any) => {
            const fd = new FormData();
            fd.append("_method", "PATCH");
            if (data.kondisi_kembali) fd.append("kondisi_kembali", data.kondisi_kembali);
            if (data.catatan) fd.append("catatan", data.catatan);
            if (data.tanggal_kembali) fd.append("tanggal_dikembalikan", data.tanggal_kembali);
            if (data.foto instanceof File) {
                fd.append("foto", data.foto);
            }
            const response = await api.post(`/pengembalians/${id}`, fd);
            return response.data;
        },
        getTrashed: async () => {
            const response = await api.get("/pengembalians/trashed");
            return response.data;
        },
        restore: async (id: number) => {
            const response = await api.post(`/pengembalians/${id}/restore`);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await api.delete(`/pengembalians/${id}`);
            return response.data;
        }
    },
    dashboard: {
        getStats: async () => {
            const response = await api.get("/dashboard/stats");
            return response.data;
        }
    },
    role: {
        getAll: async () => {
            const response = await api.get("/roles");
            return response.data;
        },
        create: async (data: any) => {
            const response = await api.post("/roles", data);
            return response.data;
        },
        update: async (id: number, data: any) => {
            const response = await api.patch(`/roles/${id}`, data);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await api.delete(`/roles/${id}`);
            return response.data;
        }
    },
    permission: {
        getAll: async () => {
            const response = await api.get("/permissions");
            return response.data;
        },
        create: async (data: any) => {
            const response = await api.post("/permissions", data);
            return response.data;
        },
        update: async (id: number, data: any) => {
            const response = await api.patch(`/permissions/${id}`, data);
            return response.data;
        },
        delete: async (id: number) => {
            const response = await api.delete(`/permissions/${id}`);
            return response.data;
        }
    }
}