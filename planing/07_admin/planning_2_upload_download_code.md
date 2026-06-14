# Planning 2: Admin Upload & Download Kode Customization

## Tujuan
Admin bisa upload kode customization (folder/file) dan download kembali sebagai ZIP.

---

## Fitur Upload

### Flow Upload
1. Admin buka halaman "Kelola Customization"
2. Pilih tipe: Web Theme / Profile Border / Name Effect / dll
3. Upload file ZIP yang berisi folder customization
4. Backend extract ZIP ke folder yang benar
5. Admin isi metadata: nama, tier, deskripsi, thumbnail, metode perolehan
6. Simpan ke database dan file system

### Struktur Folder Upload
```
customization_upload.zip
├── index.css          (wajib - style utama)
├── index.js           (opsional - script)
├── assets/            (opsional - gambar, font, dll)
├── events/            (opsional - folder per event)
│   ├── natal/
│   └── halloween/
└── manifest.json      (wajib - metadata)
```

### manifest.json
```json
{
  "name": "Golden Empire Theme",
  "tier": 3,
  "type": "web_theme",
  "description": "Tema emas kerajaan dengan partikel cahaya",
  "variables": {
    "primary_color": "#FFD700",
    "background_mode": "particle"
  }
}
```

---

## Fitur Download

### Flow Download
1. Admin buka detail customization
2. Klik tombol "Download sebagai ZIP"
3. Backend compress folder customization ke ZIP
4. Browser download file ZIP

### Implementasi
- Gunakan library `archiver` di backend untuk compress folder ke ZIP
- Endpoint: `GET /api/admin/customization/:id/download`
- Response: Stream file ZIP

---

## Fitur Edit & Nonaktifkan

### Edit
- Admin bisa edit metadata (nama, deskripsi, tier, metode perolehan)
- Admin bisa re-upload folder baru (replace)

### Nonaktifkan
- Admin bisa nonaktifkan secara global (semua user yang pakai otomatis balik ke default)
- Saat nonaktifkan, kirim notifikasi ke user yang sedang pakai
- Opsi: kasih pesan custom ke user

### Hapus
- Soft delete — data tetap di database tapi statusnya inactive
- Folder di file system tetap ada (untuk backup)

---

## Checklist
- [ ] Buat endpoint upload ZIP customization
- [ ] Buat endpoint download ZIP customization
- [ ] Buat form upload di admin panel
- [ ] Implementasi extract ZIP ke folder yang benar
- [ ] Buat tombol edit/nonaktifkan/hapus di admin
- [ ] Kirim notifikasi ke user saat customization dinonaktifkan
- [ ] Test upload → edit → download → nonaktifkan
