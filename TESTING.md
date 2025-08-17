# Testing Guide - Seratus Studio Portfolio

## Scripts untuk Testing

### 1. Development Server dengan Port Konsisten

```bash
# Menjalankan server dengan restart otomatis di port 3000
npm run dev:clean
```

Script ini akan:
- Membunuh semua proses di port 3000-3010
- Menjalankan server development di port 3000
- Memastikan port selalu konsisten untuk testing

### 2. Scripts Lainnya

```bash
# Menjalankan server di port 3000 langsung
npm run dev:3000

# Membunuh semua port yang digunakan
npm run kill-ports

# Development server biasa (port otomatis)
npm run dev
```

## Workflow Testing

1. **Sebelum Testing**: Jalankan `npm run dev:clean`
2. **Akses Aplikasi**: Buka http://localhost:3000
3. **Setelah Testing**: Server akan tetap berjalan atau bisa dihentikan dengan Ctrl+C

## Keuntungan

- ✅ Port selalu konsisten (3000)
- ✅ Tidak perlu mencari port yang berubah-ubah
- ✅ Otomatis membersihkan port yang sedang digunakan
- ✅ Mudah untuk testing dan development

## Catatan

- Script `dev:clean` akan membunuh semua proses di port 3000-3010
- Pastikan tidak ada aplikasi penting yang berjalan di port tersebut
- Jika ada error, cek terminal untuk log detail