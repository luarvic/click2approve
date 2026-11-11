---
title: Konfigurasikan langkah-langkah alur kerja persetujuan dokumen
description: Siapkan langkah-langkah persetujuan secara berurutan atau biarkan beberapa peninjau bertindak pada satu langkah. Pilih semua atau penerima tugas mana pun, tanda tangan, komentar, dan lampiran yang diperlukan.
---
# Konfigurasikan langkah-langkah alur kerja persetujuan dokumen {#configure-workflow-steps}

Alur kerja persetujuan menentukan siapa yang bertindak pada dokumen dan dalam urutan apa. **penerima tugas** adalah orang atau tim yang ditugaskan pada suatu langkah. Langkah-langkah berjalan satu demi satu. Beberapa penerima tugas dapat bertindak pada langkah yang sama.

Gunakan **Add step** untuk membuat langkah lainnya, kontrol panah untuk mengubah urutannya, dan tombol hapus untuk menghapusnya.

## Persetujuan berurutan dan paralel {#sequential-and-parallel-approvals}

Gunakan langkah terpisah ketika satu keputusan harus diambil sebelum keputusan lainnya. Ini adalah **persetujuan berurutan**. Misalnya, peninjau menyetujui proposal pada langkah 1, lalu klien masuk pada langkah 2.

Tempatkan orang pada langkah yang sama ketika mereka dapat meninjau pada waktu yang sama. Ini adalah **persetujuan paralel** dalam langkah tersebut. Langkah-langkahnya sendiri tetap berjalan secara berurutan.

| Anda membutuhkan… | Konfigurasikan alur kerja dengan cara ini |
| --- | --- |
| Satu pengulas, diikuti oleh pengulas lainnya | Tambahkan langkah terpisah untuk setiap pengulas |
| Dua reviewer yang keduanya harus menyetujui | Tambahkan keduanya ke satu langkah dan aktifkan **All assignees must complete** |
| Persetujuan dari salah satu dari beberapa orang | Tambahkan mereka ke satu langkah dan biarkan **All assignees must complete** dinonaktifkan |
| Persetujuan diikuti dengan penarikan tanda tangan | Tambahkan langkah **Approve**, lalu langkah **Sign** dengan **Require an electronic signature** diaktifkan |

## Pilih tindakan dan peserta {#choose-an-action-and-participants}

Untuk setiap langkah, pilih **Action** dan tulis **Instructions** yang jelas. Tindakan yang tersedia adalah Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept, dan Complete. Pilih tindakan yang sesuai dengan keputusan yang ingin dicatat.

Tambahkan penerima tugas melalui email dan periksa nama dan alamat yang ditampilkan sebelum mengirimkan.

!!! info "Penerima tugas organisasi"
    Dalam sebuah organisasi, pilih **Employee** atau **Team** untuk ditugaskan bekerja dalam organisasi saat ini. Jenis penerima tugas ini tidak tersedia di Personal.

## Wajibkan semua orang atau penerima tugas mana pun {#require-everyone-or-any-assignee}

Aktifkan **All assignees must complete** untuk meminta respons berhasil dari setiap penerima tugas. Jika opsi ini dinonaktifkan, satu respons yang berhasil akan menyelesaikan langkah tersebut dan melewatkan tugas lainnya yang tertunda. Peralihan muncul ketika suatu langkah memiliki beberapa penerima tugas atau satu tugas tim.

Keputusan negatif menghentikan permintaan dengan hasil yang tidak berhasil, meskipun **All assignees must complete** dinonaktifkan. Opsi ini tidak mengizinkan penerima tugas lain untuk mengesampingkan penolakan.

Misalnya, gunakan satu langkah untuk dua peninjau yang keduanya harus bertindak, diikuti dengan langkah penandatanganan terpisah. Gunakan opsi penerima tugas mana saja ketika salah satu peserta yang tersedia dapat memberikan keputusan yang diperlukan.

## Persyaratan tambahan {#additional-requirements}

Bagian **Additional requirements** dan **Visibility** tetap terlihat di setiap langkah saat membuat atau merevisi permintaan atau mengedit template. Tinjau pengaturannya sebelum menyimpan atau mengirimkan.

Aktifkan persyaratan yang harus dipenuhi peserta:

- **Require a comment** untuk mengumpulkan penjelasan.
- **Require an electronic signature** untuk mengumpulkan detail penandatanganan dan gambar tanda tangan.
- **Require an attachment** untuk mengumpulkan file respons.

Persyaratan label tindakan dan tanda tangan elektronik merupakan pengaturan terpisah. Aktifkan persyaratan tanda tangan ketika tanda tangan yang ditarik diperlukan. Tinjau persyaratan bersama dengan tindakan yang dipilih sehingga peserta mengetahui apa yang harus diberikan. Lihat [Menyelesaikan tugas](complete-a-task.md).

## Visibilitas langkah {#step-visibility}

Peminta dan penerima tugas langsung suatu langkah selalu dapat melihat langkah tersebut, termasuk penerima tugas email. **Visibility** mengontrol siapa lagi yang dapat melihat detail dan lampiran responsnya:

| Pengaturan | Pemirsa tambahan |
| --- | --- |
| All participants | Peserta yang memiliki akses ke permintaan |
| Assignees and organization participants | Peserta organisasi; tersedia untuk alur kerja organisasi |
| Assignees only | Tidak ada peserta tambahan |

Tugas email tetap berada di ruang kerja Personal penerima, meskipun email mereka milik karyawan organisasi. Langkah-langkah yang ditetapkan tetap terlihat dalam alur kerja, tersedia untuk obrolan langkah, dan disertakan dalam catatan hasil penerima.

Setelan ini tidak memberikan keanggotaan ruang kerja atau akses ke permintaan yang tidak terkait. Pilih pengaturan terbatas ketika peserta lain tidak memerlukan detail langkah tersebut.

## Revisi {#revisions}

Saat [mengirim ulang permintaan](track-requests.md), tinjau dan edit langkah-langkah untuk revisi baru. Alur kerjanya dimulai lagi dari langkah pertama; keputusan sebelumnya tetap dicatat pada revisi sebelumnya dan penerimaannya. Untuk alur kerja organisasi yang sering digunakan, simpan langkah-langkah tersebut sebagai [templat](templates.md).
