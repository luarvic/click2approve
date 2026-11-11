---
title: Sistem persetujuan dokumen sumber terbuka
description: Self-host Click2Approve, sistem persetujuan dokumen berlisensi MIT gratis dengan alur kerja multi-langkah, banyak peninjau, dan tanda tangan elektronik. Bandingkan edisi.
---
# Sistem persetujuan dokumen sumber terbuka {#open-source-document-approval-system}

Click2Approve adalah sistem persetujuan dokumen sumber terbuka berlisensi MIT yang dapat Anda host di infrastruktur Anda sendiri. Unggah dokumen, tetapkan peninjau berdasarkan alamat email, dan lacak keputusan mereka melalui alur kerja persetujuan multi-langkah. Anda dapat meminta tanda tangan elektronik dan meminta komentar ketika suatu tugas memerlukan penjelasan.

Edisi sumber terbuka mendukung akun individual dan alur kerja dokumen pribadi untuk penggunaan pribadi atau komersial. Tidak ada biaya lisensi Click2Approve; Anda menanggung biaya infrastruktur dan penyedia Anda. Lihat [kode sumber dan petunjuk hosting mandiri](https://github.com/luarvic/click2approve) untuk memulai.

Versi komersial menambahkan ruang kerja organisasi, alat kolaborasi, serta kontrol penggunaan dan retensi berbasis langganan. Panduan lain di portal ini menjelaskan layanan komersial; gunakan perbandingan ini untuk memeriksa fitur mana yang berlaku pada edisi sumber terbuka.

## Contoh: meninjau dan menyetujui proposal {#example-review-and-approve-a-proposal}

1. Unggah proposal dan tambahkan langkah persetujuan bagi orang yang perlu meninjaunya.
2. Pilih apakah setiap orang yang ditugaskan pada langkah tersebut harus merespons atau hanya satu peninjau yang dapat menyelesaikannya. Langkah-langkah alur kerja berjalan secara berurutan, dengan beberapa penerima tugas dapat bertindak dalam setiap langkah.
3. Tambahkan langkah penandatanganan jika proposal juga memerlukan tanda tangan elektronik.
4. Lacak kemajuan permintaan dan catat keputusan dari **Requests**. Setiap peserta menemukan pekerjaan yang ditugaskan kepada mereka di **Tasks**.

Lihat [Membuat permintaan](create-a-request.md) dan [Konfigurasi langkah alur kerja](workflow-steps.md) untuk kontrol alur kerja. Catatan hasil yang dapat dibagikan dan verifikasi file adalah fitur komersial; lihat perbandingan di bawah saat memilih edisi.

## Perbandingan fitur {#feature-comparison}

| Fitur | Sumber terbuka | Komersial |
| --- | --- | --- |
| Permintaan dan tugas Personal dengan file yang diunggah | Termasuk | Termasuk |
| Beberapa langkah alur kerja, penerima tugas serial atau paralel, dan semua/setiap aturan penyelesaian | Termasuk | Termasuk |
| Tindakan persetujuan, tanda tangan, konfirmasi, pengakuan, peninjauan, verifikasi, penerimaan, dan penyelesaian | Termasuk | Termasuk |
| Diperlukan komentar dan tanda tangan elektronik | Termasuk | Termasuk |
| Minta pelacakan, pembatalan, dan penghapusan | Termasuk | Termasuk |
| Profil, tanda tangan yang disimpan, kata sandi masuk, MFA, dan kunci sandi | Termasuk | Termasuk |
| Notifikasi email dan dalam aplikasi | Termasuk | Termasuk |
| Ruang kerja organisasi, karyawan, peran, dan penerima tugas karyawan | Tidak tersedia | Termasuk |
| Tim dan penerima tugas tim | Tidak tersedia | Termasuk |
| Delegations | Tidak tersedia | Termasuk |
| Templat alur kerja organisasi | Tidak tersedia | Termasuk |
| Pembahasan dan Lampiran Pembahasan | Tidak tersedia | Termasuk |
| Lampiran respons tugas dan file respons yang diperlukan | Tidak tersedia | Termasuk |
| Minta revisi dan perbandingan file antar revisi | Tidak tersedia | Termasuk |
| Receipts, tautan verifikasi yang dapat dibagikan, dan verifikasi file | Tidak tersedia | Termasuk |
| Token API untuk integrasi | Tidak tersedia | Termasuk |
| Paket berlangganan, pelaporan penggunaan token, dan penagihan | Tidak tersedia | Termasuk |
| Pengaturan retensi ruang kerja dan pembersihan retensi otomatis | Tidak tersedia | Termasuk |

Fitur komersial bergantung pada ruang kerja, peran, partisipasi, dan batasan paket Anda. Lihat [Fitur dan ketersediaan](features.md) untuk izin ruang kerja dan [Paket dan penagihan](plans-and-billing.md) untuk langganan. Pengiriman email dalam instalasi yang dihosting sendiri memerlukan penyedia email.

## Gunakan aplikasi sumber terbuka {#use-the-open-source-app}

1. Daftar atau masuk dengan akun Anda.
2. Pilih **New request**, unggah file Anda, dan konfigurasikan langkah alur kerja dengan alamat email penerima tugas. Lihat [Membuat permintaan](create-a-request.md) dan [Konfigurasi langkah alur kerja](workflow-steps.md) untuk kontrol alur kerja bersama.
3. Gunakan **Requests** untuk melacak pekerjaan yang Anda kirim dan **Tasks** untuk menyelesaikan tindakan yang ditugaskan kepada Anda. Lihat [Menyelesaikan tugas](complete-a-task.md) untuk komentar dan tanda tangan; lampiran respons tersedia dalam versi komersial.

Navigasi organisasi dan alat komersial disembunyikan di aplikasi sumber terbuka. Anda dapat mengelola profil Anda, tanda tangan yang disimpan, preferensi notifikasi, MFA, dan kunci sandi melalui menu profil.

## Sumber dan hosting mandiri {#source-and-self-hosting}

Lihat [repositori sumber terbuka](https://github.com/luarvic/click2approve) untuk kode sumber, lisensi MIT, pengaturan Docker, dan petunjuk hosting mandiri. Kunjungi [layanan Click2Approve](../index.md) untuk versi komersial.
