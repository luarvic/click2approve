---
title: Eksik onay görevlerini ve başarısız gönderimleri çözün
description: Click2Approve içinde eksik talepleri ve görevleri bulun. Belge onayı, oturum açma, ödeme ve süresi dolmuş sonuç kaydı bağlantılarıyla ilgili sorunları giderin.
---
# Belge onayı sorunlarını giderme {#troubleshooting}

Bir onay görevini bulamıyor, talep gönderemiyor veya sonuç kaydı bağlantısını açamıyorsanız önce hesabınızı ve seçili çalışma alanını kontrol edin. Güncel durumu görmek için talebi veya görevi açın. Ardından başarısız eylemin hata mesajını okuyun.

## Bir talebi veya görevi bulamıyorum {#i-cannot-find-a-request-or-task}

E-posta adresine atanan görevler **Personal** alanında görünür. Çalışan ve ekip görevleri kendi kuruluşlarında görünür. Hesap e-postasını, çalışan durumunu, ekip üyeliğini ve varsa yetki devrini kontrol edin. Görev iptal edilmiş, atlanmış, tamamlanmış, yeni bir revizyonla değiştirilmiş veya silinmiş de olabilir.

E-postadaki bir bağlantı kuruluş erişimi vermez. [Çalışma alanları ve gezinme](workspaces.md) kılavuzuna bakın.

**Page not found** mesajı görüyorsanız sayfa taşınmış olabilir veya sayfaya erişiminiz olmayabilir. Geri dönmek için **Home** seçeneğini seçin; ardından hesabınızı ve çalışma alanını kontrol edin.

## Bir menü öğesi veya eylem eksik {#a-menu-item-or-action-is-missing}

[Özellikler ve kullanılabilirlik](features.md) kılavuzunu kontrol edin. Çalışanlar, ekipler, yetki devirleri ve şablonlar için kuruluş çalışma alanı gerekir. Rolünüz, planınız veya ödeme durumunuz kontrolleri gizleyebilir ya da devre dışı bırakabilir. Doğru kuruluşu seçin ve erişiminizi bir Owner veya Admin üyesine kontrol ettirin.

## Uygulama güncellemeden sonra yeniden yükleniyor {#the-app-reloads-after-an-update}

Uygulama yeni sürümü algıladığında otomatik olarak yeniden yüklenir ve açık sayfayı tekrar açar. Kaydetmediğiniz metinler kaybolabilir.

## Talep gönderme veya görev tamamlama başarısız oluyor {#submission-or-task-completion-fails}

İşaretlenmiş alanları düzeltin; gerekli yorum, imza ve eklerin tümünü sağlayın. Dosya yüklemelerinin bitmesini bekleyin. Mesaj bir kotadan söz ediyorsa [Kullanım](usage.md) bölümünü kontrol edin.

API hatasından sonra yeniden denemeden önce kaydı yenileyin; başka bir katılımcı veya yetkili temsilci işlemi tamamlamış olabilir. Eylemi tekrarlamadan önce Requests veya Tasks bölümünde ilk işlemin başarılı olup olmadığını kontrol edin.

## Bir talebi revize edemiyorum {#i-cannot-revise-a-request}

Resubmit yalnızca daha yeni revizyonu bulunmayan ve başarılı sonuçlanmamış uygun taleplerde kullanılabilir. Yeni revizyon iş akışını yeniden başlatır; önceki kararlar önceki revizyonda kalır. [Talepleri izleme ve revize etme](track-requests.md) kılavuzuna bakın.

## Doğrulama bağlantısı çalışmıyor {#a-verification-link-does-not-work}

Bağlantının süresi dolmuş, bağlantı iptal edilmiş veya ilgili kayıt silinmiş olabilir. Kaydın sahibinden güncel bir bağlantı isteyin. [Sonuç kayıtları ve doğrulama](receipts.md).

## Oturum açamıyorum veya e-posta alamıyorum {#i-cannot-sign-in-or-receive-email}

E-posta doğrulamasının gerekli olup olmadığını kontrol edin. Gerekirse yeni doğrulama veya parola sıfırlama mesajı isteyin. Spam klasörünü ve hesap adresini kontrol edin. MFA için kullanılmamış bir kurtarma kodunu; geçiş anahtarı için kayıtlı ve uyumlu bir cihazı ya da parolayla oturum açmayı deneyin.

[Kayıt ve oturum açma](sign-in.md), [MFA ve geçiş anahtarları](security.md) ve [Bildirimler](notifications.md) kılavuzlarını inceleyin.

## Çalışma alanı ödeme nedeniyle engellendi {#the-workspace-is-blocked-for-payment}

**Plans** bölümünü açın ve gösterilen son tarihten önce ödeme kurtarma eylemini izleyin. Kuruluş ödemelerini Owner veya Admin yönetmelidir. [Planlar ve faturalandırma](plans-and-billing.md) kılavuzuna bakın.

## Silme işlemi engellendi {#deletion-is-blocked}

Bağımlılık mesajını okuyun. Başka bir kayıt çalışana, ekibe veya iş akışı kaydına başvuruyor olabilir. İlişkili kayıtları kaldırmadan önce [Saklama ve silme](retention.md) kılavuzunu inceleyin.

## Yardım alma veya hata bildirme {#get-help-or-report-a-bug}

Uygulamadaki **Report a bug** veya **Ask question** bağlantılarını kullanın. Yeniden üretme adımlarını, beklenen ve gerçek sonucu, yaklaşık zamanı ve ilgili çalışma alanı türünü ekleyin. API hatası **Details** seçeneği sunuyorsa tanılama bilgilerini inceleyin ve destek kanalı için uygun olanları paylaşın.

Parolaları, API belirteçlerini, kurtarma kodlarını, doğrulama bağlantılarını ve özel belgeleri herkese açık raporlara eklemeyin. Hesap, e-posta, güvenlik veya faturalandırma sorunları için destekle iletişime geçin.
