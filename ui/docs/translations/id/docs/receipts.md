---
title: Catatan hasil persetujuan dan verifikasi berkas dokumen
description: Membuka catatan keputusan persetujuan dokumen dan tanda tangan. Bagikan catatan hasil melalui tautan verifikasi dan periksa apakah file cocok dengan salinan yang direkam.
---
# Catatan hasil persetujuan dan verifikasi file dokumen {#receipts-and-verification}

**catatan hasil** adalah catatan yang dibuat Click2Approve saat permintaan selesai. Ini menyimpan rincian permintaan, hasil, dan rekaman tindakan peserta, termasuk tanda tangan jika disediakan. Gunakan untuk melihat siapa yang bertindak dan hasil apa yang dicatat.

Anda dapat membagikan catatan hasil melalui link verifikasi. Orang yang memiliki tautan dapat meninjau catatan dan memeriksa apakah salinan dokumennya cocok dengan file yang tercatat di catatan hasil.

!!! info "Siapa yang dapat mengelola catatan hasil?"
    Hanya pengguna yang menerima catatan hasil yang dapat membuka atau menghapusnya di ruang kerja dan mengelola tautan verifikasinya. Hal ini berlaku di Personal dan organisasi; Pemilik dan Admin tidak dapat membuka catatan hasil orang lain melalui peran mereka.

Pemohon dan setiap orang yang menerima tugas mendapat catatan hasil saat permintaan selesai, dibatalkan, atau digantikan revisi baru. Setiap orang menerima satu catatan untuk setiap ruang kerja dan revisi permintaan, meskipun memiliki beberapa tugas atau juga menjadi pemohon. Tugas tidak harus diselesaikan untuk mendapat catatan; statusnya membedakan penugasan dari tindakan yang sudah dilakukan. Langkah yang tidak pernah menghasilkan tugas tidak menerbitkan catatan bagi penerima yang direncanakan.

## Buka catatan hasil {#open-a-receipt}

Buka **Receipts** di ruang kerja tempat Anda mengirim permintaan atau menyelesaikan tugas Anda, lalu pilih catatan hasil untuk permintaan tersebut. Header kartu **Receipt** menyertakan nomor pendek, permintaan yang cocok, dan header kartu tugas. Kartu menunjukkan ID dan tanggal lengkapnya, diikuti oleh bagian **Request** dan **Task** dengan rekaman detail, hasil, peserta, tindakan, dan tanda tangan jika ada.

Judul bagian **Request** dan **Task** menyertakan nomor pendeknya di catatan hasil ruang kerja dan halaman verifikasi bersama. ID permintaan dan tugas lengkap tetap ada dalam detail rekaman jika tersedia.

Tanggal penerimaan menggunakan tanggal dan waktu lokal Anda tanpa hitungan detik. Bidang kosong dan nomor revisi pertama disembunyikan.

Saat mencetak, bagian Permintaan dan Tugas dapat berlanjut melintasi halaman. Judul bagian tetap berada di baris pertamanya, dan setiap baris detail serta tanda tangan tetap menyatu saat ditempatkan di halaman.

Catatan hasil menyimpan rekaman konteks pekerjaan yang telah selesai. Visibilitas khusus peserta dapat membatasi langkah-langkah yang disertakan dalam catatan hasil. Catatan hasil terpisah dari permintaan langsung.

## Buat tautan verifikasi {#create-a-verification-link}

1. Buka resi yang bisa Anda kelola.
2. Pilih **Share**.
3. Pilih **New link**, atur **Expires**, dan buat tautan.
4. Pilih tautan yang dibuat dalam daftar untuk membuka URL verifikasinya, lalu salin dan bagikan dengan penerima yang dituju.

Kode QR di dalam kartu catatan hasil akan membuka tautan verifikasi yang sama. Pilih logo Click2Approve atau nama merek di atas kartu untuk membuka halaman beranda.

!!! warning "Siapa pun yang memiliki tautan dapat melihat catatan hasil"
    Tautan verifikasi aktif akan membuka catatan hasil tanpa memerlukan keanggotaan ruang kerja. Tinjau sebelum membagikan: isinya mungkin mencakup nama, keputusan, dan tanda tangan.

## Verifikasi file {#verify-a-file}

Buka catatan hasil di ruang kerja Anda atau tautan verifikasi aktif dan pilih **Verify file**. Pilih salinan dokumen Anda. Browser Anda menghitung **SHA-256 hash**, nilai berdasarkan konten file. Click2Approve membandingkan nilai tersebut dengan hash yang dicatat pada catatan hasil dan menunjukkan apakah file tersebut cocok dengan file permintaan atau lampiran respons peserta. Pemeriksaan ini membaca file yang Anda pilih di browser; salinan tersebut tidak diunggah.

Misalnya, jika seseorang mengirimi Anda proposal yang disetujui beserta link catatan hasilnya, buka link tersebut dan gunakan **Verify file** untuk memeriksa proposal tersebut. File dengan konten yang diubah tidak akan cocok dengan hash yang direkam, meskipun nama filenya sama.

Hasilnya muncul di atas **Verify file**. **File verified** mengidentifikasi lampiran yang cocok dan permintaan atau tugasnya.**File does not match** berarti tidak ada file rekaman yang memiliki hash yang sama. Periksa apakah Anda memilih versi yang benar dan coba lagi.

Verifikasi menggunakan metadata file dan hash yang disimpan dalam catatan hasil. Ini masih berfungsi setelah lampiran asli dihapus; menyimpan catatan hasil tidak berarti menyimpan lampiran yang disimpan tersebut.

Kecocokan mengonfirmasi bahwa konten file cocok dengan file yang direkam. Ini tidak menilai klaim dokumen atau memverifikasi identitas penandatangan secara independen.

## Berhenti berbagi {#stop-sharing}

Pada **Share**, pilih tautan, pilih **Remove**, dan konfirmasikan bila akses tidak lagi diperlukan. Tautan yang kedaluwarsa atau dicabut tidak lagi memberikan catatan hasil. Membuat tautan lain tidak memperpanjang masa berlaku tautan yang sudah ada.

Jika verifikasi gagal, mintalah tautan saat ini kepada pemilik catatan hasil. Tautan verifikasi publik memberikan akses ke catatan hasil tersebut, bukan ke permintaan, tugas, atau direktori organisasi.

## Retensi catatan hasil {#receipt-retention}

Pembersihan latar belakang menghapus catatan hasil dan tautan verifikasinya sesuai dengan [kebijakan penyimpanan ruang kerja catatan hasil](retention.md), diukur dari pembuatan catatan hasil:

| Rencana | Retensi catatan hasil |
| --- | --- |
| Personal Free | Lima tahun |
| Business Trial | Satu bulan |
| Paket berbayar | Periode **Requests and receipts** yang dikonfigurasi, termasuk **Never delete** |

Catatan hasil penerima tugas pribadi mengikuti kebijakan ruang kerja Personal mereka, terlepas dari rencana organisasi yang meminta. Mengubah rencana akan mengubah kebijakan untuk catatan hasil yang sudah ada namun belum dihapus. Menghapus permintaan awal tidak menghapus catatan hasilnya. Penghapusan ruang kerja dan pembersihan terkait pembayaran masih dapat menghapus catatan hasil sebelumnya.

Link verifikasi bukan merupakan cadangan independen dari catatan hasilnya. Mencabut tautan akan menghentikan pembagian tanpa menghapus catatan hasil.

## Hapus catatan hasil Anda {#delete-your-receipt}

Pilih **Delete** pada catatan hasil Anda, lalu konfirmasi di **Delete receipt**. Tindakan ini akan menghapus catatan hasil Anda dan semua tautan verifikasinya secara permanen. Itu tidak menghapus permintaan asli atau catatan hasil yang diberikan kepada peserta lain. Pemilik dan Admin hanya dapat menghapus catatan hasil yang diterbitkan untuk mereka sendiri.

Untuk berhenti berbagi sambil tetap menyimpan catatan hasil Anda, cabut tautan verifikasinya.
