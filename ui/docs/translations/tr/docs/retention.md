---
title: Onay kayıtlarının saklanması ve silinmesi
description: Click2Approve'nin istekleri, sonuç kayıtları ve dosyaları ne kadar süreyle sakladığını öğrenin. Saklama ayarlarını ve bir kaydı veya kuruluşu sildiğinizde ne olacağını inceleyin.
---
# Saklama ve silme {#retention-and-deletion}

Her çalışma alanında isteklerin, alındı bilgilerinin ve bildirimlerin ne kadar süre saklanacağını seçin. Silme kontrolleri kaynağa ve izinlerinize bağlıdır.

## Saklamayı ayarlayın {#set-retention}

1. Çalışma alanını seçin ve **Retention**'yi açın.
2. Ücretsiz planlarda ve deneme planlarında **Requests**, **Receipts** ve **Notifications** dönemlerini veya ücretli planlarda **Requests and receipts** ve **Notifications** dönemlerini inceleyin. Ara kaydırıcı değerleri kaydırıcı tutamacının üzerinde küçük bir baloncuk içinde görünür; uç noktalar **1 month** ve **Never delete**'dir.
3. Planınız ve izinleriniz değişikliklere izin veriyorsa her biri için bir dönem seçin ve **Save** seçeneğini seçin.

Personal kullanıcıları kendi ayarlarını, kuruluş sahipleri ve yöneticileri ise kuruluş politikasını yönetir. Personal Free ve Business Trial planlarında istekler ve bildirimler bir ay saklanır. Sonuç kayıtları, oluşturuldukları tarihten itibaren Personal Free’de beş yıl, Business Trial’da bir ay saklanır. Ücretli planlarda **Never delete** dahil **Requests and receipts** ve **Notifications** süreleri yapılandırılabilir.

Personal Ücretsiz veya Ticari Deneme sürümü etkinleştirildiğinde, önceki **Never delete** ayarı da dahil olmak üzere her iki dönem de otomatik olarak bir aya değişir. Planlanmış bir sürüm düşürme, mevcut saklama ayarlarınızı ücretli dönem bitene kadar korur. Bir aydan eski istekler ve bildirimler daha sonra arka plan temizliği için uygun hale gelir. Sonuç kaydı temizleme, mevcut faturalar da dahil olmak üzere mevcut planın teslim alma dönemini takip eder; temizlemeden önce yükseltme yapmak, saklama sürelerini uzatabilir.

!!! warning "Saklama bir yedekleme değildir"
    Kayıtlar, saklama süreleri bittikten sonra arka plan temizliği ile kaldırılabilir. Önemli iş akışı geçmişini biriktirmeden önce kayıt tutma ihtiyaçlarınızı destekleyen bir politika seçin.

## Saklama hatırlatıcıları {#retention-reminders}

İstekler ve alındılar, saklama son tarihlerine ulaşmadan önce sahipleri
**Retention deletion reminders** alır. Standart bildirim süresi bir haftadır. Her
hatırlatıcı, etkilenen kaydı ve silinme tarihini tanımlar. E-postalar bu kayda, çalışma alanının saklama ayarlarına ve bu kılavuza bağlantı verir.
İstek hatırlatıcıları istekte bulunan kişiye gider; Sonuç kaydı hatırlatıcıları yalnızca sonuç kaydının sahibine gider.
Her istek veya alındı bir hatırlatma oluşturur; saklama süresinin değiştirilmesi
bu hatırlatıcıyı sıfırlamaz.

**In-app** ve **Email** dağıtımını **User profile → Notifications → Retention deletion reminders** altında yönetin.
Her ikisi de etkin başlatılır. Hatırlatıcıların devre dışı bırakılması, saklama temizliğini devre dışı bırakmaz.
Kayıtları daha uzun süre tutmak için, planınız ve izinleriniz izin veriyorsa saklama süresini değiştirin
veya kuruluşunuzun Sahibi veya Yöneticisiyle iletişime geçin.
E-posta hatırlatıcıları [bildirim e-posta belirteçleri](usage.md) kullanır ve yeterli miktarda
belirteç gerektirir. çalışma alanı.

Hatırlatıcılar, bildirim tercihlerinizi ve normal dağıtım yeniden denemelerinizi takip eder.
Saklama temizleme, bir hatırlatıcı devre dışı bırakılsa veya teslim edilemese bile yapılandırılmış programını takip eder
. Hatırlatıcılar otomatik istek ve sonuç kaydı saklama için geçerlidir;
bildirim temizleme, manuel silme, kuruluş silme ve ödemeyle ilgili
temizleme kendi kurallarına uyar.

## Bireysel kayıtları silme {#delete-individual-records}

Bir istek, görev, sonuç kaydı, çalışan için sunulan silme eylemini kullanın, ekibi, şablonu veya delegasyonu yalnızca bu kaydı kaldırmak istediğinizde kullanın. Onay ve doğrulama mesajlarını okuyun.

Yalnızca sonuç kaydının sahibi bunu manuel olarak silebilir. Manuel silme ve saklama temizleme işlemleri, hem sonuç kaydını hem de doğrulama bağlantılarını birlikte kaldırır. Sonuç kaydınızı silmek, orijinal isteğin veya diğer katılımcıların sonuç kayıtlarının kaldırılmasına neden olmaz. Orijinal isteğin kaldırılması, ona ait alındıların da kaldırılması anlamına gelmez.

Başka bir kayıttan gelen bir ilişki, silinmeyi engelleyebilir. Uygun olduğu yerde tanımlanan ilişkiyi çözümleyin. Tekrarlanan yeniden denemeler bağımlılığı ortadan kaldırmaz.

Daha yeni bir revizyona sahip bir istek, o revizyon ona referans verirken silinemez. Bir revizyon zincirini çıkarırken en son revizyonla başlayın. Silme programları temizleme; Önceki sürümü yeniden denemeden önce söz konusu düzeltmenin kaldırılmasını bekleyin.

Bir isteğin silinmesi, yaşı ne olursa olsun arka plan temizliği için hemen uygun hale getirir. Daha önce tüketilen jetonlar iade edilmez.

Sonuç kayıtları, ek saklama süresini uzatmadan dosya meta verilerini ve karmaları korur. Sonuç kaydının silinmesi, orijinal eklerinin silinmesine veya temizlik için programlanmasına neden olmaz.

Silinen iş akışı kayıtlarıyla ilişkili dosyalar daha sonra temizlenmek üzere programlanabilir, böylece depolanan içerikleri ve kullanımları hemen kaybolmayabilir. Profil avatarları ve kuruluş logoları, değiştirildiğinde veya silindiğinde hemen kaldırılabilir.

## Kuruluşu silme {#delete-an-organization}

!!! warning "Kuruluşun silinmesi erişimi anında kaldırır"
    Kuruluşun silinmesini yalnızca Sahip planlayabilir. Organizasyon, çalışma alanı seçiminden anında kaybolur ve erişilemez hale gelir; arka planda işleme, verilerini daha sonra kaldırır. Onaylamadan önce gerekli kayıtları saklayın. Temizlemeyi geciktirmek bir kurtarma seçeneği değildir.

## Ödemeyle ilgili kaldırma {#payment-related-removal}

Ödemenin askıya alınmasının kendi son tarihi vardır. Başarısız olan ödemeleri bu son tarihten önce [Planlar](plans-and-billing.md) aracılığıyla çözüme kavuşturun. Sona erme ticari organizasyonları ortadan kaldırır; Personal çalışma alanları iş akışı verilerini kaybeder ve kimlik ve profili korurken Personal Ücretsiz'e geri döner. Saklama ayarı, bu faturalandırma kurtarma işlemini geçersiz kılmaz.
