---
title: Kimlik doğrulayıcı MFA'yı ve geçiş anahtarlarını ayarlama
description: Click2Approve hesabınızı bir kimlik doğrulama uygulaması veya şifre anahtarıyla koruyun. MFA'yı nasıl ayarlayacağınızı, kurtarma kodlarını nasıl kaydedeceğinizi ve kayıtlı geçiş anahtarlarını nasıl yöneteceğinizi öğrenin.
---
# MFA ve şifre anahtarları {#mfa-and-passkeys}

Click2Approve hesabınızı **çok faktörlü kimlik doğrulama (MFA)** veya **şifre anahtarı** ile koruyun. Kimlik doğrulayıcı MFA ile, şifrenizin ardından bir kimlik doğrulayıcı uygulamasından gelen kodu girersiniz. Parola, tarayıcının istemini kullanarak desteklenen bir cihaz veya güvenlik anahtarı aracılığıyla oturum açmanıza olanak tanır.

Bu ayarlar, Personal ve kuruluş çalışma alanlarındaki hesabınız için geçerlidir.

## Kimlik doğrulayıcıyı etkinleştirin MFA {#enable-authenticator-mfa}

1. **User profile → Security**'yi açın.
2. **Use multi-factor authentication**'yi etkinleştirin.
3. Kimlik doğrulayıcı uygulamanızdaki kurulum QR kodunu tarayın veya kurulum anahtarını manuel olarak girin.
4. Kurulumu onaylamak için kimlik doğrulayıcıdan gelen doğrulama kodunu girin.
5. Kurtarma kodlarını güvenli bir yere kaydedin ve kaydettiğinizi onaylayın.
6. **Done — sign in again** seçeneğini seçin, ardından şifreniz ve kimlik doğrulama kodunuzla oturum açın.

Kurulumdan sonra şifreyle oturum açmak için ek MFA sorgulaması yapılması gerekir. Kurulumu başlatmak oturumunuzu değiştirir: tamamlamak veya iptal etmek tekrar oturum açmayı gerektirir.

## Kurtarma kodları {#recovery-codes}

Kimlik doğrulayıcınıza erişemediğinizde kayıtlı bir kurtarma kodu kullanın.

!!! warning "Kurtarma kodlarını güvende tutun"
    Her kod bir sırdır ve yalnızca bir kez kullanılabilir. **Generate new recovery codes** önceki setin yerine geçer; kapatmadan önce yeni kodları kaydedin.

Yeni kurtarma kodları oluşturmak veya MFA'yi kapatmak, işlemi tamamladıktan sonra tekrar oturum açmayı da gerektirir.

MFA'yi devre dışı bırakmak için Security sekmesini kullanın ve istenen doğrulamayı tamamlayın. Başka bir oturum açma yöntemini denemeden önce, çalışan tek oturum açma yönteminizi kaldırmayın.

## Bir şifre anahtarı ekleyin {#add-a-passkey}

1. **User profile → Passkeys**'yi açın ve yeni şifre eylemini seçin.
2. Daha sonra tanıyacağınız bir ad girin.
3. Biyometrik bilgilerinizi, PIN'inizi veya güvenlik anahtarınızı kullanarak tarayıcı veya cihaz istemini tamamlayın.
4. Kimlik bilgilerinin listede görünüp görünmediğini kontrol edin.

Desteklenen bir cihazda ve tarayıcıda geçiş anahtarıyla oturum açma seçeneğini kullanın. Geçiş anahtarları uyumlu bir cihaz ve tarayıcı gerektirir. Hesap kurtarma için şifrenizi hazır bulundurun.

## Parolayı kaldırma {#remove-a-passkey}

Parola Anahtarları listesinden kimlik bilgisini seçin ve kaldırma işlemini kullanın. Önce adını ve son kullanılan ayrıntılarını kontrol edin. Bunu kaldırmak, bu kimlik bilgilerinin erişimini iptal eder; diğer kayıtlı şifre anahtarlarını kaldırmaz.

Kaldırma işleminden sonra uygulama, kaldırılan şifre anahtarını sunmayı durdurabilmeleri için uyumlu şifre yöneticilerine bildirimde bulunur. Tarayıcınız veya şifre yöneticiniz bu güncellemeyi desteklemiyor olabilir. Şifre hâlâ görünüyorsa şifre yöneticinizden manuel olarak kaldırın; artık hesabınızda oturum açamaz.

Kayıp bir kimlik doğrulayıcı veya kullanılamayan bir cihaz için yapılandırılmış alternatif yönteminizi veya kurtarma kodunuzu deneyin. Hiçbiri mevcut değilse yardım için destek ekibiyle iletişime geçin.
