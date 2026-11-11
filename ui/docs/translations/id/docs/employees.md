---
title: Kelola karyawan dan peran di ruang kerja
description: Tambahkan karyawan ke organisasi Click2Approve dan kelola peran dan akses mereka. Bandingkan izin Pengguna, Admin, dan Pemilik untuk alur kerja persetujuan.
---
# Kelola karyawan dan peran di ruang kerja {#employees-and-roles}

Karyawan menghubungkan akun pengguna ke organisasi dan memberikan identitas yang digunakan untuk tugas dan catatan audit.

!!! info "Khusus Organisasi"
    Pilih organisasi untuk melihat karyawannya. Pemilik dan Admin dapat menambahkan karyawan dan mengelola akses mereka.

## Tambahkan karyawan {#add-an-employee}

Pemilik dan Admin dapat membuka **Employees**, memulai karyawan baru, dan memasukkan email, nama, posisi, peran, dan tim mereka. Simpan karyawan tersebut, lalu periksa statusnya.

Email tersebut mengidentifikasi akun yang seharusnya menerima akses karyawan. Periksa sebelum disimpan. Nama organisasi dan jabatan karyawan dapat berbeda dengan profil pribadinya.

Karyawan yang emailnya belum terdaftar dimulai **Pending**. Pendaftaran dengan email itu mengaktifkan keanggotaan. Menambahkan akun yang sudah terdaftar akan membuat karyawan **Active**.

## Peran {#roles}

| Peran | Izin organisasi |
| --- | --- |
| User (member) | Berpartisipasi dalam alur kerja resmi, melihat direktori karyawan, tim, dan delegasi, serta mengelola templat mereka sendiri |
| Admin | Kelola karyawan, tim, delegasi, penagihan, dan retensi |
| Owner | Manajemen administratif ditambah wewenang untuk menjadwalkan penghapusan organisasi |

Peran tidak memberikan akses ke organisasi lain. Visibilitas permintaan dan tugas juga mengikuti partisipasi, hubungan tim, dan delegasi. Templat bersifat pribadi secara default dan dapat dibagikan agar dapat dilihat dan digunakan oleh anggota organisasi lain. Hanya pembuat template yang dapat mengedit atau menghapusnya, termasuk jika anggota lain adalah Pemilik atau Admin.

Akses catatan hasil mengikuti kepemilikan catatan hasil, apa pun peran karyawannya. Pemilik dan Admin hanya dapat melihat, membagikan, dan menghapus catatan hasil yang dikeluarkan untuk mereka sendiri. Lihat [Kwitansi dan verifikasi](receipts.md).

## Status karyawan {#employee-status}

| Status | Arti |
| --- | --- |
| Pending | Keanggotaan belum aktif |
| Active | Akses karyawan aktif |
| Disabled | Akses karyawan telah dinonaktifkan |

Pemilik dan Admin dapat mengedit detail karyawan yang diizinkan, keanggotaan tim, dan pengaturan **Active**. Menonaktifkan akses berguna ketika seseorang tidak lagi bertindak untuk organisasi.

## Menghapus karyawan {#remove-an-employee}

Gunakan tindakan penghapusan yang tersedia hanya ketika karyawan tersebut harus dikeluarkan. Referensi yang ada dapat mencegah penghapusan; baca pesan validasi dan selesaikan hubungan yang relevan terlebih dahulu. Menonaktifkan akses dapat dilakukan jika hubungan historis harus tetap ada.

Sebelum mengubah keanggotaan, tinjau [tim](teams.md) dan [delegasi](delegations.md) yang bergantung pada karyawan tersebut.
