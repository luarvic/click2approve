---
title: Fitur persetujuan dokumen dan akses ruang kerja
description: Lihat fitur Click2Approve mana yang berfungsi di ruang kerja Pribadi dan organisasi, termasuk langkah persetujuan, tanda tangan, tim, templat, dan catatan hasil.
---
# Fitur persetujuan dokumen dan akses ruang kerja {#features-and-availability}

Click2Approve menggabungkan peninjauan dokumen, langkah persetujuan, tanda tangan elektronik, dan pelacakan permintaan. Gunakan **Personal**, ruang kerja Anda untuk permintaan Anda sendiri dan tugas yang dialamatkan email, untuk pekerjaan individu. Gunakan ruang kerja organisasi untuk alur kerja bisnis bersama. Ruang kerja, peran, dan rencana Anda menentukan tindakan yang dapat Anda ambil.

Anda juga dapat menghubungkan alat Anda sendiri melalui Click2Approve API. Lihat [token API](api-tokens.md) untuk membuat kredensial dan mengautentikasi permintaan integrasi.

!!! info "Khusus organisasi"
    Karyawan, tim, delegasi, dan templat alur kerja adalah milik organisasi. Pilih organisasi di pemilih ruang kerja untuk menggunakannya. Fitur lain dalam panduan ini juga tersedia di Personal.

## Cara kerja persetujuan dokumen {#how-document-approval-works}

1. [Buat permintaan](create-a-request.md) dengan dokumen dan instruksi.
2. [Konfigurasi langkah alur kerja](workflow-steps.md) untuk memilih siapa yang bertindak dan dalam urutan apa. Beberapa orang dapat meninjau pada langkah yang sama.
3. Peserta membuka **Tasks** untuk [mencatat keputusan mereka](complete-a-task.md). Sebuah langkah dapat memerlukan komentar, tanda tangan elektronik, atau file respons.
4. Buka **Requests** untuk [memeriksa kemajuan](track-requests.md). Saat permintaan selesai, [catatan hasil](receipts.md) menyimpan hasil dan tindakan yang dicatat.

Misalnya, dua peninjau memeriksa proposal pada langkah pertama. Klien kemudian menambahkan tanda tangannya pada langkah berikutnya. Aktifkan **Require an electronic signature** pada langkah tersebut jika memerlukan tanda tangan yang digambar.

## Referensi ruang kerja {#workspace-reference}

| Fitur | Personal | Organisasi |
| --- | --- | --- |
| Requests, tugas, langkah-langkah yang diurutkan, dan penerima tugas email | Tersedia | Tersedia |
| Diperlukan komentar dan tanda tangan elektronik | Tersedia | Tersedia |
| Pembahasan dan Lampiran Pembahasan | Tersedia | Tersedia |
| Lampiran tanggapan tugas | Tersedia | Tersedia |
| Minta revisi | Tersedia untuk permintaan yang memenuhi syarat | Tersedia untuk permintaan yang memenuhi syarat |
| Karyawan dan penerima tugas karyawan | — | Tersedia |
| Tim dan penerima tugas tim | — | Tersedia |
| Delegations | — | Tersedia |
| Templat alur kerja | — | Buat sendiri dan gunakan kembali templat yang dibagikan dalam organisasi |
| Tautan catatan hasil dan verifikasi | Lihat, bagikan, dan hapus catatan hasil yang diberikan kepada Anda | Setiap anggota dapat melihat, membagikan, dan menghapus catatan hasil yang diberikan kepada mereka |
| Plans, penggunaan, dan retensi | Kelola paket dan pengaturan Anda sendiri | Pemilik dan Admin mengelola paket dan pengaturan |
| Profile, tanda tangan tersimpan, MFA, kunci sandi, dan token API | Pengaturan akun | Pengaturan akun yang sama di seluruh ruang kerja |

## Izin organisasi {#organization-permissions}

Anggota dapat melihat direktori karyawan, tim, dan delegasi. Pemilik dan Admin mengelola karyawan, tim, delegasi, penagihan, dan retensi. Templat bersifat pribadi secara default; pembuatnya dapat membagikannya agar dapat dilihat dan digunakan oleh anggota organisasi lainnya. Hanya pencipta yang dapat mengedit atau menghapus template. Akses catatan hasil terbatas pada pengguna yang menerima setiap catatan hasil. Hanya Pemilik yang dapat menjadwalkan penghapusan organisasi.

Akses ke permintaan atau tugas bergantung pada partisipasi, hubungan tim, dan delegasi. Keanggotaan organisasi saja tidak mengekspos setiap alur kerja atau memberikan akses ke data organisasi lain.

Lihat [Karyawan dan peran](employees.md) untuk referensi peran dan [Penggunaan dan batasan](usage.md) untuk pembatasan paket. Buka **Plans** untuk mengetahui kuota Anda saat ini dan pilihan paket yang tersedia.
