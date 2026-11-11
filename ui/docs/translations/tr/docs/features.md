---
title: Belge onayı özellikleri ve çalışma alanı erişimi
description: Onay adımları, imzalar, ekipler, şablonlar ve sonuç kayıtları dahil olmak üzere Kişisel ve kurumsal çalışma alanlarında hangi Click2Approve özelliklerinin çalıştığını görün.
---
# Belge onaylama özellikleri ve çalışma alanı erişimi {#features-and-availability}

Click2Approve, belge incelemeyi, onay adımlarını, elektronik imzaları ve istek izlemeyi birleştirir. Bireysel çalışmalarınız için kendi istekleriniz ve e-posta adresli görevleriniz için çalışma alanınız olan **Personal**'yi kullanın. Paylaşılan iş iş akışları için bir kuruluş çalışma alanı kullanın. Hangi eylemleri gerçekleştirebileceğinizi çalışma alanınız, rolünüz ve planınız belirler.

Click2Approve API aracılığıyla kendi araçlarınızı da bağlayabilirsiniz. Kimlik bilgileri oluşturmak ve entegrasyon isteklerini doğrulamak için bkz. [API belirteçleri](api-tokens.md).

!!! info "Yalnızca kuruluş"
    Çalışanlar, ekipler, delegasyonlar ve iş akışı şablonları kuruluşlara aittir. Kullanmak için çalışma alanı seçicide bir kuruluş seçin. Bu kılavuzdaki diğer özellikler Personal'de de mevcuttur.

## Belge onayının işleyişi {#how-document-approval-works}

1. Belgeler ve talimatlarla [bir istek oluşturun](create-a-request.md).
2. Kimin hangi sırayla hareket edeceğini seçmek için [İş akışı adımlarını yapılandırın](workflow-steps.md). Aynı adımda birden fazla kişi inceleme yapabilir.
3. Katılımcılar [kararlarını kaydetmek](complete-a-task.md) için **Tasks**'yi açarlar. Bir adım, yorum, elektronik imza veya yanıt dosyası gerektirebilir.
4. [İlerlemeyi kontrol et](track-requests.md) için **Requests**'yi açın. İstek tamamlandığında, [sonuç kayıtları](receipts.md) sonucunu ve kaydedilen eylemleri korur.

Örneğin, iki kişi ilk adımda teklifi inceleyebilir. Müşteri daha sonraki bir adımda imzasını ekleyebilir. Elle çizilmiş imza gerekiyorsa o adımda **Require an electronic signature** seçeneğini etkinleştirin.

## Çalışma alanı referansı {#workspace-reference}

| Özellik | Personal | Organizasyon |
| --- | --- | --- |
| Requests, görevler, sıralı adımlar ve atanan kişilere e-posta gönderme | Mevcut | Mevcut |
| Gerekli açıklamalar ve elektronik imzalar | Mevcut | Mevcut |
| Tartışmalar ve tartışma ekleri | Mevcut | Mevcut |
| Görev yanıtı ekleri | Mevcut | Mevcut |
| Revizyon talep edin | Uygun istekler için kullanılabilir | Uygun istekler için kullanılabilir |
| Çalışanlar ve çalışanların vekilleri | — | Mevcut |
| Takımlar ve takıma atananlar | — | Mevcut |
| Delegations | — | Mevcut |
| İş akışı şablonları | — | Kendi şablonlarınızı oluşturun ve kuruluş içinde paylaşılan şablonları yeniden kullanın |
| Sonuç kayıtları ve doğrulama bağlantıları | Size verilen sonuç kayıtlarını görüntüleyin, paylaşın ve silin | Her üye kendisine verilen sonuç kayıtlarını görüntüleyebilir, paylaşabilir ve silebilir |
| Plans, kullanım ve saklama | Kendi planınızı ve ayarlarınızı yönetin | Sahipler ve Yöneticiler planı ve ayarları yönetir |
| Profile, kayıtlı imza, MFA, geçiş anahtarları ve API belirteçleri | Hesap ayarları | Çalışma alanlarında aynı hesap ayarları |

## Kuruluş izinleri {#organization-permissions}

Üyeler çalışan, ekip ve delegasyon dizinlerini görüntüleyebilir. Sahipler ve Yöneticiler çalışanları, ekipleri, yetkilendirmeleri, faturalandırmayı ve elde tutmayı yönetir. Şablonlar varsayılan olarak özeldir; yaratıcıları bunları diğer kuruluş üyelerinin görüntülemesi ve kullanması için paylaşabilir. Bir şablonu yalnızca oluşturan kişi düzenleyebilir veya silebilir. Sonuç kaydı erişimi, her faturanın verildiği kullanıcıyla sınırlıdır. Kuruluşun silinmesini yalnızca Sahip planlayabilir.

Bir isteğe veya göreve erişim, katılıma, ekip ilişkilerine ve yetkilendirmeye bağlıdır. Kuruluş üyeliği tek başına her iş akışını açığa çıkarmaz veya başka bir kuruluşun kayıtlarına erişim sağlamaz.

Rol referansı için [Çalışanlar ve roller](employees.md)'ye ve plan kısıtlamaları için [Kullanım ve sınırlar](usage.md)'ye bakın. Mevcut ödenekleriniz ve mevcut plan seçenekleriniz için **Plans**'yi açın.
