---
title: Onay iş akışı entegrasyonları için API belirteçleri
description: Entegrasyonunuz için bir Click2Approve API belirteci oluşturun, bunu Taşıyıcı belirteci olarak gönderin ve API referansını inceleyin. Belirteç izinlerinin ve iptalinin nasıl çalıştığını öğrenin.
---
# Onay iş akışı entegrasyonları için API belirteçleri {#api-tokens}

Kendi araçlarınızı bağlamak ve onay iş akışlarını otomatikleştirmek için Click2Approve API'yi kullanın. API belirteçleri, entegrasyonların kullanıcı hesabınız aracılığıyla API'ye erişmesine olanak tanır. İster Personal'de ister bir kuruluşta çalışıyor olun, bunları profilinizde yönetin.

## Bir belirteci oluşturun {#create-a-token}

1. **User profile → API tokens**'yi açın.
2. **New API token**'yi seçin.
3. Gerekiyorsa tanınabilir bir ad ve geçerlilik tarihi girin.
4. Belirteci oluşturun ve iletişim kutusunu kapatmadan önce değerini kopyalayın.
5. Amaçlanan entegrasyon için bunu güvenli bir şekilde saklayın.

!!! warning "Kapatmadan önce jetonu kopyalayın"
    Tam değer yalnızca bir kez gösterilir. Güvenli bir şekilde saklayın ve mesajlardan, ekran görüntülerinden ve kaynak kontrolünden uzak tutun. Kaybederseniz yeni bir jeton oluşturun ve eski jetonu iptal edin.

## API 'yi keşfedin {#explore-the-api}

[API referansını (Swagger UI)]({{ api_reference_url }}){target="_blank" Uç noktalara, istek alanlarına ve yanıtlara göz atmak için rel='noopener noreferrer'}.

Kimliği doğrulanmış bir isteği denemek için **Authorize**'yi seçin, API jetonunuzu `Bearer` öneki olmadan yapıştırın ve onaylayın. Swagger sizin için yetkilendirme başlığını ekler. Bir uç nokta seçin, **Try it out**'yi seçin, gerekli alanları doldurun ve **Execute**'yi seçin. Bu istekler hesabınızı kullanır ve gerçek verileri oluşturabilir, değiştirebilir veya silebilir.

Hesap güvenliği uç noktaları etkileşimli bir oturum açma oturumu gerektirir ve API jetonlarıyla kullanılamaz.

## Entegrasyonunuzda bir jeton kullanın {#use-a-token-in-your-integration}

Jetonunuzu Her API isteğiyle birlikte `Authorization` başlığı:

```http
Authorization: Bearer YOUR_API_TOKEN
```

`YOUR_API_TOKEN`'yi belirteci oluştururken kopyaladığınız değerle değiştirin. Tokenlar hesabınızın izinleriyle hareket eder. Belirteç oluşturma, başka bir kullanıcının çalışmasına veya başka bir kuruluşun kaynaklarına erişim izni vermez; yetkilendirme hala geçerlidir.

## jetonunu iptal edin {#revoke-a-token}

Listeden jetonu seçin, **Revoke** seçeneğini seçin ve onaylayın. Bunu kullanan tüm entegrasyonları yeni bir kimlik bilgisiyle güncelleyin. İfşa edildiğinden şüphelendiğiniz kullanılmayan jetonları ve kimlik bilgilerini iptal edin.

API jetonları hesap ayarlarıdır. Çalışma alanlarının değiştirilmesi ayrı bir jeton kümesi oluşturmaz.
