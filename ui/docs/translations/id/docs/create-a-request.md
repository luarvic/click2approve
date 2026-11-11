---
title: Buat permintaan persetujuan dokumen
description: Kirim dokumen untuk persetujuan di Click2Approve. Tambahkan file, pilih peninjau, atur langkah alur kerja, dan kirimkan permintaan dari Pribadi atau organisasi.
---
# Buat permintaan persetujuan dokumen {#create-a-request}

Untuk mengirim dokumen untuk disetujui, buat **permintaan**. Ini berisi file untuk ditinjau, instruksi, dan langkah-langkah yang memberi tahu setiap peserta apa yang harus dilakukan. Anda dapat meminta persetujuan, review, atau tanda tangan elektronik.

Pilih ruang kerja yang benar terlebih dahulu. Gunakan **Personal**, ruang kerja Anda untuk permintaan Anda sendiri, untuk mengirim pekerjaan atas nama Anda sendiri. Pilih organisasi untuk mengirimkan pekerjaan atas namanya. Ruang kerja Anda menentukan siapa pemilik permintaan dan tipe penerima tugas mana yang dapat Anda gunakan. **penerima tugas** adalah orang atau tim yang Anda minta untuk bertindak pada suatu langkah.

## Buat permintaan {#compose-the-request}

1. [Buka aplikasi](/app/), pilih ruang kerja Anda, dan pilih **New request** di bagian atas grup **Work** di menu utama.
2. Di organisasi, pilih **Custom** atau **From template**. Untuk template, pilih dan lanjutkan ke editor permintaan.
3. Masukkan **Title** tertentu, seperti “Setujui perjanjian pemasok yang diperbarui.”
4. Tambahkan **Description** yang menjelaskan tujuan, konteks, dan hasil yang diharapkan.
5. Lampirkan [file yang harus ditinjau peserta](files.md).
6. Tambahkan dan konfigurasikan [langkah alur kerja](workflow-steps.md).

Kartu **Request details** mengelompokkan judul,**Files to review**, dan deskripsi. Konfigurasikan langkah-langkah alur kerja di bawahnya.

Permintaan Personal menggunakan penerima tugas email.

!!! info "Penerima tugas organisasi"
    Dalam sebuah organisasi, Anda juga dapat menetapkan langkah-langkah kepada karyawan dan tim dari organisasi tersebut.

## Contoh: kirim a usulan persetujuan dan tanda tangan {#example-send-a-proposal-for-approval-and-signature}

1. Tambahkan proposal di bawah **Files to review**.
2. Tambahkan langkah dengan **Action** yang disetel ke **Approve**, lalu tambahkan alamat email pengulas.
3. Pilih **Add step** dan atur **Action** menjadi **Sign**. Tambahkan alamat email klien dan aktifkan **Require an electronic signature**.
4. Tulis **Instructions** untuk setiap langkah sehingga kedua orang tahu apa yang harus diperiksa.

Klien menerima tugas setelah langkah persetujuan berhasil. Jika beberapa orang perlu menyetujui terlebih dahulu, tambahkan mereka ke langkah persetujuan dan aktifkan **All assignees must complete**. Lihat [Konfigurasi langkah alur kerja](workflow-steps.md) untuk aturan penyelesaian.

## Tinjau dan kirimkan {#review-and-submit}

Periksa file, urutan langkah, tindakan, instruksi, peserta, aturan penyelesaian, visibilitas, dan persyaratan tambahan. Jika Anda memerlukan tanda tangan yang ditarik, centang **Require an electronic signature**; memilih tindakan **Sign** saja tidak mengaktifkannya. Lalu pilih **Submit** dan tunggu konfirmasi sebelum meninggalkan halaman.

Jika kolom disorot, perbaiki dan kirimkan lagi. Jika batas paket memblokir pengiriman, periksa [Penggunaan](usage.md) atau minta bantuan Pemilik atau Admin organisasi.

Jika nama karyawan organisasi Anda tidak lengkap, peringatan akan menjelaskan bagaimana nama tersebut akan muncul di catatan. Pilih **Go back** untuk memperbaikinya, atau **Proceed anyway** untuk mengirimkan dengan nama saat ini. Detail karyawan organisasi dikelola secara terpisah dari profil pribadi Anda.

Saat membuat permintaan organisasi baru khusus, **Save template** membuat template pribadi dari judul, deskripsi, dan langkah. Ini menerapkan aturan validasi templat dan tidak menggantikan pengiriman permintaan. Permintaan yang dimulai dari templat dan permintaan revisi tidak menawarkan tindakan ini. Lihat [Templat alur kerja](templates.md).

## Setelah pengiriman {#after-submission}

Buka **Requests** dan pilih permintaan untuk mengikuti perkembangannya. Peserta bertindak saat alur kerja mencapai langkah mereka. Pengiriman notifikasi mengikuti preferensi masing-masing penerima.

Gunakan [Lacak dan revisi permintaan](track-requests.md) untuk memahami hasil, pembatalan, dan revisi. Membiarkan atau membatalkan layar penulisan akan membuang hasil edit tanpa meminta konfirmasi. Draf permintaan tidak disimpan.
