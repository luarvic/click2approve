---
title: Çalışanları ve çalışma alanı rollerini yönetin
description: Çalışanları bir Click2Approve kuruluşuna ekleyin ve rollerini ve erişimlerini yönetin. Onay iş akışları için Kullanıcı, Yönetici ve Sahip izinlerini karşılaştırın.
---
# Çalışanları ve çalışma alanı rollerini yönetin {#employees-and-roles}

Çalışanlar, kullanıcı hesaplarını bir kuruluşa bağlar ve atamalar ile denetim kayıtları için kullanılan kimlikleri sağlar.

!!! info "Yalnızca kuruluş"
    Çalışanlarını görüntülemek için bir kuruluş seçin. Sahipler ve Yöneticiler çalışanları ekleyebilir ve erişimlerini yönetebilir.

## Çalışan ekleme {#add-an-employee}

Sahipler ve Yöneticiler **Employees**'yi açabilir, yeni bir çalışan başlatabilir ve e-postasını, adını, pozisyonunu, rolünü ve ekiplerini girebilir. Çalışanı kaydedin ve durumunu kontrol edin.

E-posta, çalışan erişimi alması gereken hesabı tanımlar. Kaydetmeden önce kontrol edin. Bir çalışanın kuruluş adı ve pozisyonu kişisel profilinden farklı olabilir.

E-posta adresi henüz kaydedilmemiş bir çalışan **Pending** ile başlar. Bu e-postayla kaydolmak üyeliği etkinleştirir. Zaten kayıtlı bir hesabın eklenmesi bir **Active** çalışan oluşturur.

## Roller {#roles}

| Rol | Kuruluş izinleri |
| --- | --- |
| User (member) | Yetkili iş akışlarına katılın, çalışan, ekip ve delegasyon dizinlerini görüntüleyin ve kendi şablonlarınızı yönetin |
| Admin | Çalışanları, ekipleri, yetkilendirmeleri, faturalandırmayı ve elde tutmayı yönetin |
| Owner | İdari yönetim artı kuruluşun silinmesini planlama yetkisi |

Roller diğer kuruluşlara erişim hakkı vermez. Talep ve görev görünürlüğü aynı zamanda katılımı, ekip ilişkilerini ve delegasyonu da takip eder. Şablonlar varsayılan olarak özeldir ve diğer kuruluş üyelerinin görüntülemesi ve kullanması için paylaşılabilir. Başka bir üyenin Sahip veya Yönetici olması da dahil olmak üzere, yalnızca şablonu oluşturan kişi şablonu düzenleyebilir veya silebilir.

Sonuç kaydı erişimi, çalışan rolünden bağımsız olarak sonuç kaydı sahipliğinden sonra gelir. Sahipler ve Yöneticiler yalnızca kendilerine verilen sonuç kayıtlarını görüntüleyebilir, paylaşabilir ve silebilir. Bkz. [Sonuç kayıtları ve doğrulama](receipts.md).

## Çalışan durumu {#employee-status}

| Status | Anlamı |
| --- | --- |
| Pending | Üyelik henüz aktif hale gelmedi |
| Active | Çalışan erişimi etkin |
| Disabled | Çalışan erişimi devre dışı bırakıldı |

Sahipler ve Yöneticiler izin verilen çalışan ayrıntılarını, ekip üyeliklerini ve **Active** ayarını düzenleyebilir. Erişimin devre dışı bırakılması, bir kişinin artık kuruluş adına işlem yapmaması gerektiğinde faydalıdır.

## Bir çalışanı kaldırın {#remove-an-employee}

Mevcut silme işlemini yalnızca çalışanın kaldırılması gerektiğinde kullanın. Mevcut referanslar silinmeyi engelleyebilir; doğrulama mesajını okuyun ve önce ilgili ilişkiyi çözün. Geçmiş ilişkilerin korunması gerektiğinde erişimin devre dışı bırakılması uygun olabilir.

Üyeliği değiştirmeden önce, söz konusu çalışana bağlı olan [ekipleri](teams.md) ve [delegasyonları](delegations.md) inceleyin.
