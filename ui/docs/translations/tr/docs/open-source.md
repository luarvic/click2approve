---
title: Açık kaynaklı belge onay sistemi
description: Kendi kendine barındırılan Click2Approve, çok adımlı iş akışlarına, birden fazla incelemeciye ve elektronik imzalara sahip ücretsiz bir MIT lisanslı belge onay sistemi. Sürümleri karşılaştırın.
---
# Açık kaynaklı belge onay sistemi {#open-source-document-approval-system}

Click2Approve, kendi altyapınızda barındırabileceğiniz ücretsiz, MIT lisanslı açık kaynaklı belge onay sistemidir. Belgeleri yükleyin, inceleyicileri e-posta adresine göre atayın ve çok adımlı bir onay iş akışı aracılığıyla kararlarını takip edin. Bir görevin açıklamaya ihtiyacı olduğunda elektronik imza talep edebilir ve yorum yapılmasını isteyebilirsiniz.

Açık kaynak sürümü, kişisel veya ticari kullanıma yönelik bireysel hesapları ve kişisel belge iş akışlarını destekler. Click2Approve lisans ücreti yoktur; Altyapınızı ve sağlayıcı maliyetlerinizi karşılarsınız. Başlamak için [kaynak kodu ve kendi kendine barındırma talimatlarına](https://github.com/luarvic/click2approve) bakın.

Ticari sürüm, organizasyon çalışma alanları, ortak çalışma araçları ve aboneliğe dayalı kullanım ve saklama kontrolleri ekler. Bu portaldaki diğer kılavuzlarda ticari hizmet anlatılmaktadır; açık kaynak sürümü için hangi özelliklerin geçerli olduğunu kontrol etmek için bu karşılaştırmayı kullanın.

## Örnek: bir teklifi inceleyin ve onaylayın {#example-review-and-approve-a-proposal}

1. Bir teklif yükleyin ve onu incelemesi gereken kişiler için bir onay adımı ekleyin.
2. Adıma atanan herkesin yanıt vermesi gerekip gerekmediğini veya herhangi bir gözden geçirenin adımı tamamlayıp tamamlayamayacağını seçin. İş akışı adımları sırayla yürütülür ve her adımda birden fazla atanan kişi işlem yapabilir.
3. Teklifin aynı zamanda elektronik imzaya ihtiyacı varsa bir imzalama adımı ekleyin.
4. İsteğin ilerleyişini ve kaydedilen kararları **Requests** adresinden takip edin. Her katılımcı kendisine atanan çalışmayı **Tasks**'de bulur.

İş akışı kontrolleri için [İstek oluştur](create-a-request.md) ve [İş akışı adımlarını yapılandırma](workflow-steps.md) bölümlerine bakın. Paylaşılabilir sonuç kayıtları ve dosya doğrulama ticari özelliklerdir; Sürüm seçerken aşağıdaki karşılaştırmaya bakın.

## Özellik karşılaştırması {#feature-comparison}

| Özellik | Açık kaynak | Ticari |
| --- | --- | --- |
| Personal yüklenen dosyalarla istekler ve görevler | Dahil | Dahil |
| Çoklu iş akışı adımları, seri veya paralel atananlar ve tüm/herhangi bir tamamlama kuralı | Dahil | Dahil |
| Onaylama, imza, onay, onay, inceleme, doğrulama, kabul ve tamamlama işlemleri | Dahil | Dahil |
| Gerekli açıklamalar ve elektronik imzalar | Dahil | Dahil |
| İzleme, iptal ve silme talebinde bulunun | Dahil | Dahil |
| Profiller, kayıtlı imzalar, şifreyle oturum açma, MFA ve şifre anahtarları | Dahil | Dahil |
| E-posta ve uygulama içi bildirimler | Dahil | Dahil |
| Organizasyon çalışma alanları, çalışanlar, roller ve çalışanların atandığı kişiler | Mevcut değil | Dahil |
| Takımlar ve takıma atananlar | Mevcut değil | Dahil |
| Delegations | Mevcut değil | Dahil |
| Organizasyon iş akışı şablonları | Mevcut değil | Dahil |
| Tartışmalar ve tartışma ekleri | Mevcut değil | Dahil |
| Görev yanıtı ekleri ve gerekli yanıt dosyaları | Mevcut değil | Dahil |
| Revizyon isteğinde bulunun ve revizyonlar arasında dosya karşılaştırması yapın | Mevcut değil | Dahil |
| Receipts, paylaşılabilir doğrulama bağlantıları ve dosya doğrulama | Mevcut değil | Dahil |
| Entegrasyonlar için API belirteçleri | Mevcut değil | Dahil |
| Abonelik planları, jeton kullanımı raporlaması ve faturalandırma | Mevcut değil | Dahil |
| Çalışma alanı saklama ayarları ve otomatik saklama temizleme | Mevcut değil | Dahil |

Ticari özellikler çalışma alanınıza, rolünüze, katılımınıza ve plan limitlerinize bağlıdır. Çalışma alanı izinleri için [Özellikler ve kullanılabilirlik](features.md) ve abonelikler için [Planlar ve faturalandırma](plans-and-billing.md) konusuna bakın. Şirket içinde barındırılan bir kurulumda e-posta teslimi, bir e-posta sağlayıcısı gerektirir.

## Açık kaynaklı uygulamasını kullanın {#use-the-open-source-app}

1. Kaydolun veya hesabınızla oturum açın.
2. **New request** seçeneğini seçin, dosyalarınızı yükleyin ve atanan kişilerin e-posta adresleriyle iş akışı adımlarını yapılandırın. Paylaşılan iş akışı kontrolleri için [Bir istek oluşturun](create-a-request.md) ve [İş akışı adımlarını yapılandırın](workflow-steps.md) bölümlerine bakın.
3. Gönderdiğiniz işi takip etmek için **Requests**'yi ve size atanan eylemleri tamamlamak için **Tasks**'yi kullanın. Yorumlar ve imzalar için [Görevi tamamlama](complete-a-task.md) konusuna bakın; yanıt ekleri ticari sürümde mevcuttur.

Kuruluşta gezinme ve ticari araçlar açık kaynak uygulamada gizlidir. Profilinizi, kayıtlı imzanızı, bildirim tercihlerinizi, MFA'yi ve şifre anahtarlarınızı profil menüsünden yönetebilirsiniz.

## Kaynak ve kendi kendine barındırma {#source-and-self-hosting}

Kaynak kodu, MIT lisansı, Docker kurulumu ve kendi kendine barındırma talimatları için [açık kaynak deposuna](https://github.com/luarvic/click2approve) bakın. Ticari sürüm için [Click2Approve hizmetini](../index.md) ziyaret edin.
