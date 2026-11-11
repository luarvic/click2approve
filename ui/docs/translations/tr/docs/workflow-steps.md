---
title: Belge onayı iş akışının adımlarını yapılandırın
description: Onay adımlarını sıralayın veya aynı adımda birden fazla kişinin incelemesini sağlayın. Tümünün ya da birinin yanıtını, imza, yorum ve ek gereksinimlerini ayarlayın.
---
# Belge onayı iş akışının adımlarını yapılandırın {#configure-workflow-steps}

Onay iş akışı, belge üzerinde kimin ve hangi sırayla işlem yapacağını belirler. **Görevlendirilen**, bir adıma atanan kişi veya ekiptir. Adımlar birbiri ardına ilerler. Aynı adımda birden fazla kişi işlem yapabilir.

Yeni adım oluşturmak için **Add step**, sırasını değiştirmek için ok kontrollerini, kaldırmak için silme düğmesini kullanın.

## Sıralı ve paralel onaylar {#sequential-and-parallel-approvals}

Bir karar diğerinden önce gelmeliyse ayrı adımlar kullanın. Buna **sıralı onay** denir. Örneğin, inceleyen kişi birinci adımda teklifi onaylar, müşteri ikinci adımda imzalar.

Aynı anda inceleyebilecek kişileri aynı adıma ekleyin. Bu, adım içindeki **paralel onaydır**. Adımların kendisi yine sırayla yürütülür.

| İhtiyacınız | İş akışını yapılandırma |
| --- | --- |
| Önce bir kişinin, sonra diğerinin incelemesi | Her inceleyen için ayrı adım ekleyin |
| İki kişinin de onayı | İkisini aynı adıma ekleyip **All assignees must complete** seçeneğini etkinleştirin |
| Birkaç kişiden herhangi birinin onayı | Aynı adıma ekleyip **All assignees must complete** seçeneğini kapalı bırakın |
| Onaydan sonra elle çizilmiş imza | Bir **Approve** adımı, ardından **Require an electronic signature** etkin bir **Sign** adımı ekleyin |

## Eylemi ve katılımcıları seçme {#choose-an-action-and-participants}

Her adım için **Action** alanını seçin ve açık **Instructions** yazın. Desteklenen eylemler Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept ve Complete seçenekleridir. Kayda geçirmek istediğiniz karara uygun eylemi seçin.

Kişileri e-postayla ekleyin; göndermeden önce görüntülenen adları ve adresleri kontrol edin.

!!! info "Kuruluş içindeki görevlendirmeler"
    Kuruluşta, mevcut kuruluş içinde görevlendirme yapmak için **Employee** veya **Team** seçin. Bu türler Personal alanında kullanılamaz.

## Herkesin veya herhangi bir kişinin yanıtını isteme {#require-everyone-or-any-assignee}

Her görevlendirilenin başarılı yanıtını zorunlu tutmak için **All assignees must complete** seçeneğini etkinleştirin. Kapalıysa tek bir başarılı yanıt adımı tamamlar ve diğer bekleyen görevleri atlar. Anahtar, adımda birden fazla kişi veya bir ekip görevlendirmesi varsa görünür.**All assignees must complete** kapalı olsa bile olumsuz karar talebi başarısız sonuçla durdurur. Bu seçenek diğer kişilerin bir reddi geçersiz kılmasına izin vermez.

Örneğin, ikisinin de işlem yapması gereken iki inceleyeni aynı adıma, ardından imza için ayrı bir adıma ekleyin. Uygun durumdaki tek bir katılımcı gerekli kararı verebiliyorsa herhangi bir kişinin yanıtı seçeneğini kullanın.

## Ek gereksinimler {#additional-requirements}

Talep oluştururken, revize ederken veya şablon düzenlerken **Additional requirements** ve **Visibility** bölümleri her adımda görünür kalır. Kaydetmeden veya göndermeden önce ayarları inceleyin.

Katılımcının karşılaması gereken koşulları etkinleştirin:

- Açıklama almak için **Require a comment**.
- İmza bilgileri ve elle çizilmiş imza almak için **Require an electronic signature**.
- Yanıt dosyası almak için **Require an attachment**.

Eylem etiketi ile elektronik imza gereksinimi ayrı ayarlardır. Elle çizilmiş imza gerekiyorsa imza gereksinimini etkinleştirin. Katılımcıların ne sağlayacağını bilmesi için koşulları seçilen eylemle birlikte değerlendirin. [Görev tamamlama](complete-a-task.md) kılavuzuna bakın.

## Adım görünürlüğü {#step-visibility}

Talebi oluşturan ve e-postayla atananlar dahil adımın doğrudan görevlendirilenleri adımı her zaman görebilir. **Visibility**, ayrıntıları ve yanıt eklerini başka kimlerin görebileceğini belirler:

| Ayar | Ek izleyiciler |
| --- | --- |
| All participants | Talebe erişimi olan katılımcılar |
| Assignees and organization participants | Kuruluş katılımcıları; kuruluş iş akışlarında kullanılabilir |
| Assignees only | Ek katılımcı yok |

E-posta bir kuruluş çalışanına ait olsa bile e-posta görevlendirmeleri alıcının Personal çalışma alanında kalır. Atanan adımlar iş akışında görünür, adım sohbetinde kullanılabilir ve alıcının sonuç kaydına dahil edilir.

Bu ayarlar çalışma alanı üyeliği veya ilgisiz taleplere erişim sağlamaz. Diğer katılımcıların adım ayrıntılarını görmesi gerekmiyorsa kısıtlı bir ayar seçin.

## Revizyonlar {#revisions}

[Bir talebi yeniden gönderirken](track-requests.md) yeni revizyonun adımlarını kontrol edip düzenleyin. İş akışı birinci adımdan yeniden başlar; önceki kararlar önceki revizyonda ve sonuç kayıtlarında kalır. Sık kullanılan kuruluş iş akışlarının adımlarını [şablon](templates.md) olarak kaydedin.
