---
title: Siapkan MFA pengautentikasi dan kunci sandi
description: Lindungi akun Click2Approve Anda dengan aplikasi autentikator atau kunci sandi. Pelajari cara menyiapkan MFA, menyimpan kode pemulihan, dan mengelola kunci sandi terdaftar.
---
# MFA dan kunci sandi {#mfa-and-passkeys}

Lindungi akun Click2Approve Anda dengan **autentikasi multifaktor (MFA)** atau **kunci sandi**. Dengan pengautentikasi MFA, Anda memasukkan kode dari aplikasi pengautentikasi setelah kata sandi Anda. Kunci sandi memungkinkan Anda masuk melalui perangkat yang didukung atau kunci keamanan, menggunakan perintah browser.

Setelan ini berlaku untuk akun Anda di Personal dan ruang kerja organisasi.

## Aktifkan pengautentikasi MFA {#enable-authenticator-mfa}

1. Buka **User profile → Security**.
2. Aktifkan **Use multi-factor authentication**.
3. Pindai kode QR penyiapan di aplikasi pengautentikasi Anda, atau masukkan kunci penyiapan secara manual.
4. Masukkan kode verifikasi dari pengautentikasi untuk mengonfirmasi penyiapan.
5. Simpan kode pemulihan di tempat yang aman dan konfirmasikan bahwa Anda telah menyimpannya.
6. Pilih **Done — sign in again**, lalu masuk dengan sandi dan kode autentikator Anda.

Setelah penyiapan, masuk dengan sandi memerlukan tantangan MFA tambahan. Memulai penyiapan akan mengubah sesi Anda: menyelesaikan atau membatalkannya memerlukan login lagi.

## Kode pemulihan {#recovery-codes}

Gunakan kode pemulihan yang tersimpan saat Anda tidak dapat mengakses pengautentikasi Anda.

!!! warning "Simpan kode pemulihan dengan aman"
    Setiap kode bersifat rahasia dan hanya dapat digunakan sekali saja. **Generate new recovery codes** menggantikan set sebelumnya; simpan kode baru sebelum menutupnya.

Membuat kode pemulihan baru atau mematikan MFA juga memerlukan login lagi setelah Anda selesai.

Untuk menonaktifkan MFA, gunakan tab Security dan selesaikan verifikasi yang diminta. Jangan hapus satu-satunya metode masuk yang berfungsi sebelum menguji metode masuk lainnya.

## Tambahkan kunci sandi {#add-a-passkey}

1. Buka **User profile → Passkeys** dan pilih tindakan kunci sandi baru.
2. Masukkan nama yang akan Anda kenali nanti.
3. Selesaikan perintah browser atau perangkat menggunakan biometrik, PIN, atau kunci keamanan Anda.
4. Periksa apakah kredensial muncul dalam daftar.

Gunakan opsi masuk kunci sandi pada perangkat dan browser yang didukung. Kunci sandi memerlukan perangkat dan browser yang kompatibel. Simpan sandi Anda untuk pemulihan akun.

## Hapus kunci sandi {#remove-a-passkey}

Pilih kredensial di daftar Kunci Sandi dan gunakan tindakan hapus. Periksa nama dan detail yang terakhir digunakan terlebih dahulu. Menghapusnya akan mencabut akses kredensial tersebut; itu tidak menghapus kunci sandi terdaftar lainnya.

Setelah penghapusan, aplikasi memberi tahu pengelola kata sandi yang kompatibel sehingga mereka dapat berhenti menawarkan kunci sandi yang dihapus. Browser atau pengelola kata sandi Anda mungkin tidak mendukung pembaruan ini. Jika kunci sandi masih muncul, hapus secara manual dari pengelola kata sandi Anda; perangkat tidak dapat lagi memasukkan Anda ke akun Anda.

Untuk pengautentikasi yang hilang atau perangkat tidak tersedia, coba metode alternatif atau kode pemulihan yang dikonfigurasi. Jika tidak ada yang tersedia, hubungi dukungan untuk mendapatkan bantuan.
