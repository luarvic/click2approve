---
title: Belge onay isteği oluşturma
description: Belgeleri onay için Click2Approve formatında gönderin. Dosya ekleyin, inceleyenleri seçin, iş akışı adımlarını ayarlayın ve Kişisel'den veya bir kuruluştan istek gönderin.
---
# Belge onay isteği oluşturun {#create-a-request}

Bir belgeyi onaya göndermek için bir **istek** oluşturun. İncelenecek dosyaları, talimatları ve her katılımcıya ne yapması gerektiğini söyleyen adımları içerir. Onay, inceleme veya elektronik imza isteyebilirsiniz.

Önce doğru çalışma alanını seçin. Kendi adınıza çalışma göndermek için çalışma alanınız olan **Personal**'yi kendi istekleriniz için kullanın. Adına çalışma gönderilecek bir kuruluş seçin. Çalışma alanınız, isteğin kime ait olduğunu ve hangi atanan türlerini kullanabileceğinizi belirler. **Atanan**, bir adımda harekete geçmesini istediğiniz kişi veya ekiptir.

## İsteği oluşturun {#compose-the-request}

1. [Uygulamayı açın](/app/), çalışma alanınızı seçin ve ana menüdeki **Work** grubunun üst kısmındaki **New request** seçeneğini seçin.
2. Bir kuruluşta **Custom** veya **From template**'yi seçin. Bir şablon için onu seçin ve istek düzenleyiciye devam edin.
3. "Güncellenen tedarikçi sözleşmesini onayla" gibi belirli bir **Title** girin.
4. Amacı, bağlamı ve beklenen sonucu açıklayan bir **Description** ekleyin.
5. [Katılımcıların incelemesi gereken dosyaları](files.md) ekleyin.
6. [İş akışı adımlarını](workflow-steps.md) ekleyin ve yapılandırın.

**Request details** kartı başlığı,**Files to review** ve açıklamayı gruplandırır. Altındaki iş akışı adımlarını yapılandırın.

Personal istekleri, e-postayla atananları kullanır.

!!! info "Kuruluşta atananlar"
    Bir kuruluşta, adımları o kuruluştaki çalışanlara ve ekiplere de atayabilirsiniz.

## Örnek: send onay ve imza için bir teklif {#example-send-a-proposal-for-approval-and-signature}

1. Teklifi **Files to review** altına ekleyin.
2. **Action**'nin **Approve** olarak ayarlandığı bir adım ekleyin ve ardından inceleyenin e-posta adresini ekleyin.
3. **Add step**'yi seçin ve **Action**'yi **Sign** olarak ayarlayın. İstemcinin e-posta adresini ekleyin ve **Require an electronic signature**'yi etkinleştirin.
4. Her iki kişinin de neyi kontrol etmesi gerektiğini bilmesi için her adıma **Instructions** yazın.

İstemci, onay adımı başarılı olduktan sonra bir görev alır. İlk önce birkaç kişinin onaylaması gerekiyorsa bunları onay adımına ekleyin ve **All assignees must complete**'yi etkinleştirin. Tamamlama kuralları için [İş akışı adımlarını yapılandırma](workflow-steps.md) konusuna bakın.

## 'yi inceleyin ve gönderin {#review-and-submit}

Dosyaları, adım sırasını, eylemi, talimatları, katılımcıları, tamamlama kuralını, görünürlüğü ve ek gereksinimleri kontrol edin. Çizilmiş bir imzaya ihtiyacınız varsa **Require an electronic signature**'yi işaretleyin; **Sign** eyleminin seçilmesi tek başına bu işlemi etkinleştirmez. Ardından **Submit**'yi seçin ve sayfadan ayrılmadan önce onay bekleyin.

Alanlar vurgulanmışsa bunları düzeltin ve tekrar gönderin. Bir plan sınırı gönderimi engelliyorsa, [Kullanım](usage.md)'yi inceleyin veya bir kuruluş Sahibinden veya Yöneticisinden yardım isteyin.

Kuruluşunuzun çalışan adı eksikse kayıtta nasıl görüneceğini açıklayan bir uyarı görüntülenir. Düzeltmek için **Go back**'yi veya mevcut adla göndermek için **Proceed anyway**'yi seçin. Kuruluş çalışanlarının ayrıntıları kişisel profilinizden ayrı olarak yönetilir.

Özel bir yeni kuruluş isteği oluştururken **Save template** başlık, açıklama ve adımlardan özel bir şablon oluşturur. Şablon doğrulama kurallarını uygular ve isteğin gönderilmesinin yerine geçmez. Şablonlardan başlatılan istekler ve istek revizyonları bu eylemi sunmaz. Bkz. [İş akışı şablonları](templates.md).

## Gönderimden sonra {#after-submission}

**Requests**'yi açın ve ilerleme durumunu takip etmek için isteği seçin. Katılımcılar iş akışı adımlarına ulaştıkça hareket ederler. Bildirim teslimi her alıcının tercihlerine göre yapılır.

Sonuçları, iptalleri ve revizyonları anlamak için [İstekleri takip et ve düzelt](track-requests.md) seçeneğini kullanın. Oluşturma ekranından çıkmak veya iptal etmek, onay istemeden düzenlemeleri iptal eder. İstek taslakları kaydedilmez.
