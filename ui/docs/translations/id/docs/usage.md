---
title: Penggunaan, token, dan batas penyimpanan
description: Lihat tindakan Click2Approve mana yang menggunakan token, bagaimana penyimpanan file diukur, dan apa yang terjadi pada batas tertentu. Gunakan contoh untuk memperkirakan penggunaan alur kerja dokumen.
---
# Penggunaan, token, dan batas penyimpanan {#usage-and-tokens}

Pilih ruang kerja dan buka **Usage** untuk melihat saldo token, periode penagihan, dan total penyimpanan yang terisi. Tabel di bawah ubin mencantumkan setiap tindakan dan **Tokens used**, termasuk entri tanpa token. Tindakan diurutkan berdasarkan token yang digunakan, yang tertinggi terlebih dahulu, dengan urutan abjad untuk jumlah yang sama. Penyortiran menggunakan jumlah yang tepat sebelum pembulatan tampilan. Ubin Token dan Penyimpanan menunjukkan jumlah yang digunakan dan tersedia dengan bilah kuota. Jumlah token yang ditampilkan dibulatkan ke bawah menjadi seluruh token; akuntansi dan batang kuota mempertahankan presisi pecahan.

## Kuota token bulanan {#monthly-allowance}

Setiap paket mencakup token. Pada Personal Free, token diperbarui setiap bulan sejak tanggal awal periode pertama. Paket berbayar mendapat token untuk setiap periode penagihan yang pembayarannya telah dikonfirmasi. Business Trial menerima satu kuota untuk satu bulan uji coba. Token yang tidak terpakai akan kedaluwarsa: tidak dibawa ke periode berikutnya dan tidak dapat dipindahkan antar ruang kerja.

| Rencana | Harga bulanan (USD, tidak termasuk pajak) | Termasuk token | Penyimpanan |
| --- | --- | --- | --- |
| Personal Free | $0 | 1.000 per bulan | 1 GB |
| Personal Pro | $20 | 50.000 per bulan | 10 GB |
| Business Trial | $0 hanya untuk satu bulan | 10.000 sekali | 1 GB |
| Business Pro | $100 | 300.000 per bulan | 100 GB |

## Yang menggunakan token {#what-uses-tokens}

Tarif token adalah:

| Action | Token |
| --- | --- |
| Unggah | 1 per MB |
| Melihat atau mengunduh file | 2 per MB |
| Email alur kerja | 5 per penerima |
| Kirim atau kirim ulang permintaan | 10 |
| Buat tugas | 2 per tugas |

Membaca permintaan dan detail atau daftar tugas, menyelesaikan tugas, dan membatalkan permintaan tidak diukur dan tidak menggunakan token. Pengiriman dan pengiriman ulang menggunakan tarif yang sama.

Transfer menggunakan desimal MB (1.000.000 byte). File kecil menggunakan token pecahan, daripada membulatkan setiap file menjadi satu MB. Pratinjau file juga mentransfer data. Melihat salinan yang sudah di-cache oleh browser Anda tidak menyebabkan transfer server lain. Transfer file yang berhasil dikenakan biaya untuk byte dokumen, tanpa biaya tambahan pengkodean URL data.

Permintaan dan tugas dibebankan ke ruang kerja alur kerja asal, bahkan ketika pemberi persetujuan menggunakan kotak masuk pribadi. Unggahan dari halaman tugas dan diskusi termasuk dalam ruang kerja permintaan, yang membayar unggahan, penyimpanan, dan unduhannya. Unggahan yang dilakukan saat menyiapkan permintaan baru termasuk dalam ruang kerja yang dipilih. Verifikasi akun, pengaturan ulang kata sandi, pemberitahuan keamanan, email penagihan, dan aset merek publik tidak menggunakan token ruang kerja.

## Contoh alur kerja {#example-workflow}

Alur kerja dengan 10 MB yang diunggah, 10 MB dilihat atau diunduh, lima pengiriman penerima email alur kerja, satu permintaan dikirimkan, dan lima tugas yang dibuat menggunakan **75 token**:

| Aktivitas | Perhitungan | Tokens used |
| --- | --- | --- |
| Unggah 10 MB | 10×1 | 10 |
| Lihat atau unduh 10 MB | 10×2 | 20 |
| Kirimkan lima email alur kerja ke masing-masing satu penerima | 5 × 5 | 25 |
| Kirim satu permintaan | 1 × 10 | 10 |
| Buat lima tugas | 5×2 | 10 |
| **Total**| |**75** |

Menyelesaikan tugas tersebut tidak menghabiskan token dengan sendirinya. Transfer file lebih lanjut, email, pengiriman ulang, atau tugas yang dibuat oleh langkah alur kerja berikutnya dikenakan biaya terpisah sesuai tarif di atas.

## Penagihan dan token yang tidak mencukupi {#charging-and-insufficient-tokens}

Unggahan, unduhan, dan email alur kerja memeriksa token yang tersedia sebelum memulai dan menagih pekerjaan yang telah selesai secara langsung. Unggahan yang gagal dan email yang tidak terkirim tidak dikenakan biaya. Pengunduhan yang terputus dikenakan biaya untuk byte dokumen yang ditransfer. Melampirkan atau menghapus file yang diupload tidak mengembalikan biaya upload.

Tindakan secara bersamaan dapat menyebabkan saldo di bawah nol; tindakan yang dikenakan biaya lebih lanjut akan diblokir hingga token tersedia.

Batas burst dan konkurensi juga melindungi layanan. Tindakan dengan tarif terbatas sementara dapat dicoba lagi nanti.

Jika token tidak mencukupi, tindakan baru yang dikenakan biaya akan diblokir. Catatan permintaan dan tugas yang ada tetap dapat diakses; melihat file masih memerlukan token. Menyelesaikan tugas dapat membuat tugas untuk langkah berikutnya, yang memerlukan token pada tingkat pembuatan tugas. Buka **Plans** untuk meninjau tunjangan Anda. Menghapus catatan tidak mengembalikan dana token yang sudah digunakan.

## Penyimpanan adalah batas terpisah {#storage-is-a-separate-limit}

Penyimpanan mengukur file yang saat ini menempati ruang, termasuk file terjadwal yang menunggu pembersihan. Ini bukan kuota unggahan yang diperbarui setiap bulan. Menyimpan file tidak akan menggunakan token tambahan, namun akan mengurangi kapasitas penyimpanan paket Anda hingga file tersebut dihapus.

Pilih [retensi](retention.md) sesuai dengan berapa lama Anda memerlukan catatan. Perubahan rencana terjadwal mempertahankan hak yang dibayarkan saat ini hingga menjadi efektif. Peningkatan berbayar diaktifkan setelah pembayaran terverifikasi; itu tidak memberikan token hanya karena Checkout dibuka.
