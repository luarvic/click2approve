---
title: Onay sonuç kayıtları ve belge dosyası doğrulaması
description: Belge onay kararlarının ve imzaların kaydını açın. Doğrulama bağlantısı aracılığıyla bir sonuç kaydı paylaşın ve dosyanın kaydedilen kopyayla eşleşip eşleşmediğini kontrol edin.
---
# Onay sonuç kayıtları ve belge dosyası doğrulaması {#receipts-and-verification}

**sonuç kaydı**, Click2Approve'nin bir istek tamamlandığında oluşturduğu bir kayıttır. İstek ayrıntılarını, sonucunu ve katılımcıların kayıtlı eylemlerini, sağlandığı yerde imzalar da dahil olmak üzere korur. Kimin harekete geçtiğini ve hangi sonucun kaydedildiğini görmek için bunu kullanın.

Bir doğrulama bağlantısını kullanarak bir sonuç kaydı paylaşabilirsiniz. Bağlantıya sahip olan kişi kaydı inceleyebilir ve kendi belge kopyasının sonuç kaydında kayıtlı bir dosyayla eşleşip eşleşmediğini kontrol edebilir.

!!! info "Sonuç kayıtlarını kim yönetebilir?"
    Yalnızca sonuç kaydı verilen kullanıcı bunu çalışma alanında açabilir veya silebilir ve doğrulama bağlantılarını yönetebilir. Bu hem Personal hem de kuruluşlar için geçerlidir; Sahipler ve Yöneticiler, rolleri aracılığıyla diğer kişilerin sonuç kayıtlarını açamazlar.

İstek tamamlandığında, iptal edildiğinde veya yeni bir revizyonla değiştirildiğinde, isteği oluşturan kişi ve gerçekten görev almış her katılımcı bir sonuç kaydı alır. Birden fazla görevi olsa veya isteği oluşturan kişi de olsa, her kişi için çalışma alanı ve istek revizyonu başına yalnızca bir kayıt oluşturulur. Kayıt almak için görevi tamamlamak gerekmez; kaydedilen durum, görevlendirmeyi tamamlanmış eylemden ayırır. Görev oluşturmayan adımlar, o adımın katılımcıları için kayıt üretmez.

## Bir sonuç kaydı açın {#open-a-receipt}

İsteği gönderdiğiniz veya görevinizi tamamladığınız çalışma alanında **Receipts**'yi açın ve ardından bu isteğe ilişkin sonuç kaydını seçin. **Receipt** kart başlığı kısa numarasını, eşleşen isteği ve görev kartı başlıklarını içerir. Kartta tam kimlik ve tarih gösterilir, ardından kaydedilen ayrıntılar, sonuçlar, katılımcılar, eylemler ve imzaların bulunduğu **Request** ve **Task** bölümleri gelir. **Request** ve **Task** bölüm başlıkları, hem çalışma alanı sonuç kayıtlarında hem de paylaşılan doğrulama sayfalarında kısa numaralarını içerir. Tam istek ve görev kimlikleri, mevcut olduğunda kaydedilen ayrıntılarda kalır.

Sonuç kaydı tarihlerinde saniyeler olmadan yerel tarih ve saatiniz kullanılır. Boş alanlar ve ilk revizyon numarası gizlenir.

Yazdırma sırasında İstek ve Görev bölümleri sayfalar arasında devam edebilir. Bölüm başlıkları ilk satırlarında kalır ve tek tek ayrıntı satırları ile imzalar, sayfaya sığdıklarında bir arada kalır.

Sonuç kaydı, tamamlanan işin kayıtlı içeriğini korur. Katılımcıya özel görünürlük, bir sonuç kaydında yer alan adımları sınırlayabilir. Sonuç kaydı, canlı istekten ayrıdır.

## Doğrulama bağlantısı oluşturun {#create-a-verification-link}

1. Yönetebileceğiniz bir sonuç kaydı açın.
2. **Share**'yi seçin.
3. **New link**'yi seçin, **Expires**'yi ayarlayın ve bağlantıyı oluşturun.
4. Doğrulama URL'sini açmak için listede oluşturulan bağlantıyı seçin, ardından kopyalayıp hedeflenen alıcıyla paylaşın.

Sonuç kaydı kartının içindeki QR kodu aynı doğrulama bağlantısını açar. Ana sayfayı açmak için kartın üzerindeki Click2Approve logosunu veya marka adını seçin.

!!! warning "Bağlantıya sahip olan herkes sonuç kaydını görüntüleyebilir"
    Etkin bir doğrulama bağlantısı, çalışma alanı üyeliği gerektirmeden sonuç kaydını açar. Paylaşmadan önce inceleyin: İçeriğinde adlar, kararlar ve imzalar bulunabilir.

## Bir dosyayı doğrulayın {#verify-a-file}

Çalışma alanınızda veya etkin bir doğrulama bağlantısında bir sonuç kaydı açın ve **Verify file** seçeneğini seçin. Belgenizin kopyasını seçin. Tarayıcınız, dosyanın içeriğine dayalı bir değer olan **SHA-256 hash** değerini hesaplar. Click2Approve, bu değeri sonuç kaydında kayıtlı karmalarla karşılaştırır ve dosyanın bir istek dosyasıyla mı yoksa katılımcının yanıt ekiyle mi eşleştiğini gösterir. Bu kontrol, seçtiğiniz dosyayı tarayıcıda okur; bu kopyayı yüklemez.

Örneğin, birisi size onaylanmış bir teklif ve bunun sonuç kaydı bağlantısını gönderirse, bağlantıyı açın ve teklifi kontrol etmek için **Verify file** kullanın. İçeriği değiştirilmiş bir dosya, dosya adı aynı olsa bile kaydedilen karma değeriyle eşleşmeyecektir.

Sonuç **Verify file** üzerinde görünür. **File verified** eşleşen eki ve onun isteğini veya görevini tanımlar. **File does not match**, kayıtlı hiçbir dosyanın aynı karma değerine sahip olmadığı anlamına gelir. Doğru sürümü seçip seçmediğinizi kontrol edin ve tekrar deneyin.

Doğrulama, dosya meta verilerini ve sonuç kaydında saklanan karmaları kullanır. Orijinal eklentiler çıkarıldıktan sonra da çalışmaya devam eder; bir sonuç kaydını saklamak, saklanan ekleri saklamaz.

Eşleşme, dosya içeriğinin kayıtlı bir dosyayla eşleştiğini doğrular. Belgenin taleplerini değerlendirmez veya imzalayanın kimliğini bağımsız olarak doğrulamaz.

## Paylaşımı durdurun {#stop-sharing}

**Share**'de bağlantıyı seçin, **Remove**'yi seçin ve erişime artık gerek kalmadığında onaylayın. Süresi dolmuş veya iptal edilmiş bir bağlantı artık sonuç kaydı sağlamaz. Başka bir bağlantı oluşturmak, mevcut bağlantının geçerlilik süresini uzatmaz.

Doğrulama başarısız olursa, sonuç kaydı sahibinden geçerli bir bağlantı isteyin. Genel doğrulama bağlantıları, kuruluşun isteklerine, görevlerine veya dizinlerine değil, söz konusu sonuç kayıtlarına erişim sağlar.

## Sonuç kaydı saklama {#receipt-retention}

Arka plan temizliği, kayıtların oluşturulma tarihini esas alarak sonuç kayıtlarını ve doğrulama bağlantılarını kaydın ait olduğu çalışma alanının [saklama politikasına](retention.md) göre kaldırır:

| Planı | Sonuç kaydı saklama |
| --- | --- |
| Personal Free | Beş yıl |
| Business Trial | Bir ay |
| Ücretli planlar | **Never delete** dahil olmak üzere yapılandırılmış **Requests and receipts** dönemi |

Personal alıcısının sonuç kaydı, talep eden kuruluşun planından bağımsız olarak Personal çalışma alanının politikasına uygundur. Planların değiştirilmesi, henüz kaldırılmamış mevcut sonuç kayıtlarına ilişkin politikayı değiştirir. Orijinal isteğin silinmesi, ona ait sonuç kayıtlarının silinmesine neden olmaz. Çalışma alanının kaldırılması ve ödemeyle ilgili temizleme işlemleri, sonuç kayıtlarını daha erken kaldırmaya devam edebilir.

Doğrulama bağlantısı, sonuç kaydının bağımsız bir yedeği değildir. Bağlantıyı iptal etmek, sonuç kaydını silmeden paylaşımı durdurur.

## Sonuç kaydınızı silin {#delete-your-receipt}

Sonuç kaydınızda **Delete** seçeneğini seçin ve **Delete receipt** ile onaylayın. Bu, sonuç kaydınızı ve tüm doğrulama bağlantılarını kalıcı olarak kaldırır. Diğer katılımcılara verilen orijinal talebi veya sonuç kayıtlarını silmez. Sahipler ve Yöneticiler yalnızca kendilerine verilen sonuç kayıtlarını silebilir.

Sonuç kaydınızı saklarken paylaşımı durdurmak için bunun yerine doğrulama bağlantılarını iptal edin.
