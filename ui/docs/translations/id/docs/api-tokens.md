---
title: Token API untuk integrasi alur persetujuan
description: Buat token API Click2Approve untuk integrasi Anda, kirimkan sebagai token Pembawa, dan jelajahi referensi API. Pelajari cara kerja izin dan pencabutan token.
---
# Token API untuk integrasi alur persetujuan {#api-tokens}

Gunakan Click2Approve API untuk menghubungkan alat Anda sendiri dan mengotomatiskan alur kerja persetujuan. Token API memungkinkan integrasi mengakses API melalui akun pengguna Anda. Kelola token tersebut di profil Anda, baik Anda bekerja di Personal atau di organisasi.

## Buat token {#create-a-token}

1. Buka **User profile → API tokens**.
2. Pilih **New API token**.
3. Masukkan nama yang dapat dikenali dan masa berlakunya jika diperlukan.
4. Buat token dan salin nilainya sebelum menutup dialog.
5. Simpan dengan aman untuk integrasi yang diinginkan.

!!! warning "Salin token sebelum menutup"
    Nilai penuh hanya ditampilkan satu kali. Simpan dengan aman dan jauhkan dari pesan, tangkapan layar, dan kontrol sumber. Jika Anda kehilangannya, buat penggantinya dan cabut token lama.

## Jelajahi API {#explore-the-api}

Buka [referensi API (Swagger UI)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} untuk menjelajahi endpoint, kolom permintaan, dan respons.

Untuk mencoba permintaan yang diautentikasi, pilih **Authorize**, tempelkan token API Anda tanpa awalan `Bearer`, dan konfirmasi. Swagger menambahkan header otorisasi untuk Anda. Pilih titik akhir, pilih **Try it out**, isi kolom yang wajib diisi, dan pilih **Execute**. Permintaan ini menggunakan akun Anda dan dapat membuat, mengubah, atau menghapus data sebenarnya.

Titik akhir keamanan akun memerlukan sesi masuk interaktif dan tidak dapat digunakan dengan token API.

## Gunakan token dalam integrasi Anda {#use-a-token-in-your-integration}

Kirim token Anda di Header `Authorization` dengan setiap permintaan API:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Ganti `YOUR_API_TOKEN` dengan nilai yang Anda salin saat membuat token. Token bertindak dengan izin akun Anda. Pembuatan token tidak memberikan akses ke karya pengguna lain atau sumber daya organisasi lain; otorisasi masih berlaku.

## Cabut token {#revoke-a-token}

Pilih token dalam daftar, pilih **Revoke**, dan konfirmasi. Perbarui integrasi apa pun yang menggunakannya dengan kredensial pengganti. Cabut token dan kredensial yang tidak digunakan yang Anda curigai telah terekspos.

Token API adalah pengaturan akun. Peralihan ruang kerja tidak membuat kumpulan token terpisah.
