---
title: Penyimpanan dan penghapusan catatan persetujuan
description: Pelajari berapa lama Click2Approve menyimpan permintaan, catatan hasil, dan file. Tinjau pengaturan retensi dan apa yang terjadi saat Anda menghapus data atau organisasi.
---
# Retensi dan penghapusan {#retention-and-deletion}

Pilih berapa lama untuk menyimpan permintaan, catatan hasil, dan notifikasi di setiap ruang kerja. Kontrol penghapusan bergantung pada sumber daya dan izin Anda.

## Tetapkan retensi {#set-retention}

1. Pilih ruang kerja dan buka **Retention**.
2. Tinjau periode **Requests**, **Receipts**, dan **Notifications** pada paket gratis dan uji coba, atau **Requests and receipts** dan **Notifications** pada paket berbayar. Nilai penggeser perantara muncul dalam gelembung kecil di atas pegangan penggeser; endpointnya adalah **1 month** dan **Never delete**.
3. Jika paket dan izin Anda mengizinkan perubahan, pilih periode untuk setiap perubahan dan pilih **Save**.

Pengguna Personal mengelola pengaturannya sendiri; pemilik dan admin mengelola kebijakan organisasi. Personal Free dan Business Trial menyimpan permintaan serta notifikasi selama satu bulan. Catatan hasil disimpan lima tahun pada Personal Free dan satu bulan pada Business Trial, dihitung sejak pembuatannya. Paket berbayar memungkinkan pengaturan **Requests and receipts** serta **Notifications**, termasuk **Never delete**.

Saat Uji Coba Gratis atau Bisnis Personal aktif, kedua periode tersebut otomatis berubah menjadi satu bulan, termasuk setelan **Never delete** sebelumnya. Penurunan versi terjadwal akan mempertahankan setelan retensi Anda saat ini hingga periode berbayar berakhir. Permintaan dan pemberitahuan yang lebih lama dari satu bulan kemudian memenuhi syarat untuk pembersihan latar belakang. Pembersihan penerimaan mengikuti periode penerimaan rencana saat ini, termasuk untuk penerimaan yang ada; meningkatkan versi sebelum pembersihan dapat memperpanjang retensinya.

!!! warning "Retensi bukan cadangan"
    Catatan dapat dihapus dengan pembersihan latar belakang setelah periode retensinya. Pilih kebijakan yang mendukung kebutuhan pencatatan Anda sebelum mengumpulkan riwayat alur kerja penting.

## Pengingat retensi {#retention-reminders}

Sebelum permintaan dan catatan hasil mencapai batas waktu retensi, pemiliknya menerima
**Retention deletion reminders**. Periode pemberitahuan standar adalah satu minggu. Setiap
pengingat mengidentifikasi catatan yang terpengaruh dan tanggal penghapusannya. Tautan email ke data tersebut, setelan retensi ruang kerja, dan panduan ini.
Permintaan pengingat dikirimkan ke pemohon; pengingat catatan hasil hanya ditujukan kepada pemilik catatan hasil.
Setiap permintaan atau catatan hasil menghasilkan satu pengingat; mengubah batas waktu retensinya
tidak menyetel ulang pengingat tersebut.

Kelola pengiriman **In-app** dan **Email** pada **User profile → Notifications → Retention deletion reminders**.
Keduanya mulai diaktifkan. Menonaktifkan pengingat tidak menonaktifkan pembersihan retensi. Untuk
menyimpan catatan lebih lama, ubah periode retensi jika rencana dan izin Anda
mengizinkannya, atau hubungi Pemilik atau Admin organisasi Anda.
Pengingat email menggunakan [token email notifikasi](usage.md) dan memerlukan token
yang memadai di ruang kerja.

Pengingat mengikuti preferensi notifikasi dan percobaan ulang pengiriman normal.
Pembersihan retensi mengikuti jadwal yang dikonfigurasi meskipun pengingat dinonaktifkan
atau tidak dapat dikirimkan. Pengingat berlaku untuk penyimpanan permintaan dan catatan hasil otomatis;
pembersihan notifikasi, penghapusan manual, penghapusan organisasi, dan
pembersihan terkait pembayaran mengikuti aturan mereka sendiri.

## Hapus catatan individual {#delete-individual-records}

Gunakan tindakan penghapusan yang ditawarkan untuk permintaan, tugas, catatan hasil, karyawan, tim, templat, atau delegasi hanya jika Anda ingin menghapus catatan tersebut. Baca konfirmasi dan pesan validasi apa pun.

Hanya pemilik catatan hasil yang dapat menghapusnya secara manual. Penghapusan manual dan pembersihan penyimpanan menghapus catatan hasil dan tautan verifikasinya secara bersamaan. Menghapus catatan hasil Anda tidak menghapus permintaan asli atau catatan hasil peserta lainnya. Menghapus permintaan awal tidak menghapus catatan hasilnya.

Hubungan dari rekaman lain dapat mencegah penghapusan. Selesaikan hubungan yang teridentifikasi jika diperlukan. Percobaan ulang yang berulang tidak menghilangkan ketergantungan.

Permintaan dengan revisi yang lebih baru tidak dapat dihapus selama revisi tersebut merujuknya. Mulailah dengan revisi terbaru saat menghapus rantai revisi. Pembersihan jadwal penghapusan; tunggu hingga revisi tersebut dihapus sebelum mencoba kembali pendahulunya.

Menghapus permintaan akan langsung memenuhi syarat untuk pembersihan latar belakang, berapa pun usianya. Token yang digunakan sebelumnya tidak dapat dikembalikan dananya.

Catatan hasil mempertahankan metadata dan hash file tanpa memperpanjang retensi lampiran. Menghapus catatan hasil tidak menghapus atau menjadwalkan lampiran aslinya untuk dibersihkan.

File yang terkait dengan rekaman alur kerja yang dihapus dapat dijadwalkan untuk dibersihkan nanti, sehingga konten dan penggunaannya yang disimpan mungkin tidak langsung hilang. Avatar profil dan logo organisasi dapat langsung dihapus saat diganti atau dihapus.

## Hapus organisasi {#delete-an-organization}

!!! warning "Penghapusan organisasi segera menghapus akses"
    Hanya Pemilik yang dapat menjadwalkan penghapusan organisasi. Organisasi segera menghilang dari pemilihan ruang kerja dan tidak dapat diakses; pemrosesan latar belakang menghapus datanya nanti. Simpan catatan yang diperlukan sebelum mengonfirmasi. Penundaan pembersihan bukanlah opsi pemulihan.

## Penghapusan terkait pembayaran {#payment-related-removal}

Penangguhan pembayaran memiliki batas waktu tersendiri. Selesaikan pembayaran yang gagal melalui [Paket](plans-and-billing.md) sebelum batas waktu tersebut. Kedaluwarsa menghapus organisasi bisnis; Ruang kerja Personal kehilangan data alur kerja dan kembali ke Personal Gratis dengan tetap mempertahankan identitas dan profil. Setelan retensi tidak mengesampingkan proses pemulihan penagihan ini.
