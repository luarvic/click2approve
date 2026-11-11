---
title: Onay iş akışlarında kullanım, jetonlar ve depolama sınırları
description: Click2Approve işlemlerinin kaç jeton kullandığını, dosya depolamanın nasıl ölçüldüğünü ve sınırlara ulaşıldığında ne olduğunu öğrenin. Örnekle iş akışınızın kullanımını hesaplayın.
---
# Kullanım ve jetonlar {#usage-and-tokens}

Çalışma alanını seçip **Usage** bölümünü açarak jeton bakiyesini, faturalandırma dönemini ve kullanılan toplam depolamayı görün. Kartların altındaki tablo her eylemi ve **Tokens used** değerini, sıfır jeton kullananlar dahil, listeler. Eylemler en yüksek jeton kullanımından başlayarak sıralanır; eşit değerlerde alfabetik sıra kullanılır. Sıralama, ekrandaki yuvarlamadan önce kesin değerlerle yapılır. Tokens ve Storage kartları kullanılan ve kullanılabilir miktarları kota çubuğuyla gösterir. Görüntülenen jeton miktarları aşağı doğru tam sayıya yuvarlanır; hesaplama ve kota çubukları kesirli hassasiyeti korur.

## Aylık kota {#monthly-allowance}

Her plan jeton içerir. Personal Free, ilk dönem tarihinden itibaren aylık yenilenir. Ücretli planlar doğrulanmış ücretli fatura dönemleriyle yenilenir. Business Trial, tek aylık süresi için bir kez kota alır. Kullanılmayan jetonların süresi dolar; sonraki döneme devretmez ve çalışma alanları arasında aktarılamaz.

| Plan | Aylık fiyat (USD, vergiler hariç) | Dahil jetonlar | Depolama |
| --- | --- | --- | --- |
| Personal Free | $0 | Ayda 1.000 | 1 GB |
| Personal Pro | $20 | Ayda 50.000 | 10 GB |
| Business Trial | Yalnızca bir ay için $0 | Bir kez 10.000 | 1 GB |
| Business Pro | $100 | Ayda 300.000 | 100 GB |

## Hangi işlemler jeton kullanır? {#what-uses-tokens}

Jeton ücretleri şöyledir:

| Eylem | Jeton |
| --- | --- |
| Dosya yükleme | MB başına 1 |
| Dosya görüntüleme veya indirme | MB başına 2 |
| İş akışı e-postası | Alıcı başına 5 |
| Talep gönderme veya yeniden gönderme | 10 |
| Görev oluşturma | Görev başına 2 |

Talep ve görev ayrıntılarını veya listelerini okumak, görev tamamlamak ve talep iptal etmek ölçümlenmez; jeton tüketmez. İlk gönderim ve yeniden gönderim aynı ücrete tabidir.

Aktarımlarda ondalık MB (1.000.000 bayt) kullanılır. Küçük dosyalar dosya başına bir MB'a yuvarlanmaz; kesirli jeton tüketir. Dosya önizlemeleri de veri aktarır. Tarayıcının önbelleğindeki bir kopyayı görüntülemek yeni sunucu aktarımı oluşturmaz. Başarılı aktarımlar, veri URL'si kodlama ek yükü hariç belge baytları üzerinden ücretlendirilir.

Onaylayan kişi kişisel gelen kutusunu kullansa bile talepler ve görevler, iş akışının kaynak çalışma alanına ücretlendirilir. Görev ve tartışma sayfalarından yüklemeler talebin çalışma alanına aittir; yükleme, depolama ve indirme ücretlerini bu alan karşılar. Yeni talep hazırlanırken yüklenen dosyalar seçili çalışma alanına aittir. Hesap doğrulama, parola sıfırlama, güvenlik bildirimleri, fatura e-postaları ve herkese açık marka dosyaları çalışma alanı jetonu tüketmez.

## Örnek iş akışı {#example-workflow}

10 MB yükleme, 10 MB görüntüleme veya indirme, beş iş akışı e-postasının birer alıcıya teslimi, bir talep gönderimi ve beş görev oluşturma içeren iş akışı **75 tokens**, yani 75 jeton kullanır:

| İşlem | Hesap | Tokens used |
| --- | --- | --- |
| 10 MB yükleme | 10 × 1 | 10 |
| 10 MB görüntüleme veya indirme | 10 × 2 | 20 |
| Her biri tek alıcıya beş iş akışı e-postası | 5 × 5 | 25 |
| Bir talep gönderme | 1 × 10 | 10 |
| Beş görev oluşturma | 5 × 2 | 10 |
| **Total**| |**75** |

Bu görevleri tamamlamak tek başına jeton tüketmez. Sonraki adımların oluşturduğu ek dosya aktarımları, e-postalar, yeniden gönderimler veya görevler yukarıdaki oranlarla ayrıca ücretlendirilir.

## Ücretlendirme ve yetersiz jeton {#charging-and-insufficient-tokens}

Yüklemeler, indirmeler ve iş akışı e-postaları başlamadan önce kullanılabilir jetonları kontrol eder ve tamamlanan işi doğrudan ücretlendirir. Başarısız yüklemeler ve gönderilmeyen e-postalar ücretlendirilmez. Yarıda kesilen indirmelerde aktarılan belge baytları ücretlendirilir. Yüklenmiş dosyayı eklemek veya silmek yükleme ücretini iade etmez.

Eşzamanlı işlemler bakiyeyi sıfırın altına düşürebilir. Bu durumda yeni ücretli işlemler, jetonlar kullanılabilir olana kadar engellenir.

Kısa süreli istek ve eşzamanlı işlem sınırları da hizmeti korur. Geçici hız sınırına takılan işlemi daha sonra yeniden deneyebilirsiniz.

Jetonlar yetersizse yeni ücretli işlemler engellenir. Mevcut talep ve görev kayıtlarına erişim sürer; dosya görüntülemek için hâlâ jeton gerekir. Bir görevin tamamlanması sonraki adım için yeni görevler oluşturabilir; bunlar görev oluşturma oranıyla jeton gerektirir. Kotanızı incelemek için **Plans** bölümünü açın. Kayıt silmek daha önce harcanmış jetonları iade etmez.

## Depolama ayrı bir sınırdır {#storage-is-a-separate-limit}

Depolama, temizlenmeyi bekleyen ve silinmesi planlanmış dosyalar dahil, o anda yer kaplayan dosyaları ölçer. Her ay yenilenen bir yükleme kotası değildir. Dosyayı tutmak ek jeton tüketmez; ancak kaldırılana kadar planın depolama kapasitesinden yer kullanır.

Kayıtlara ne kadar süre ihtiyacınız olduğuna göre [saklama](retention.md) ayarlarını seçin. Planlanmış bir plan değişikliği, yürürlüğe girene kadar mevcut ücretli hakları korur. Ücretli yükseltme, ödeme doğrulandıktan sonra etkinleşir; yalnızca Checkout sayfasını açmak jeton kazandırmaz.
