---
title: MFA i klucze dostępu
description: Chroń swoje konto Click2Approve za pomocą aplikacji uwierzytelniającej lub klucza dostępu. Dowiedz się, jak skonfigurować usługę MFA, zapisać kody odzyskiwania i zarządzać zarejestrowanymi kluczami.
---
# MFA i klucze dostępu {#mfa-and-passkeys}

Chroń swoje konto Click2Approve za pomocą **uwierzytelniania wieloskładnikowego (MFA)** lub **klucza dostępu**. W przypadku uwierzytelniacza MFA po haśle wprowadzasz kod z aplikacji uwierzytelniającej. Klucz dostępu umożliwia zalogowanie się za pomocą obsługiwanego urządzenia lub klucza bezpieczeństwa przy użyciu monitu przeglądarki.

Te ustawienia dotyczą Twojego konta w Personal i obszarach roboczych organizacji.

## Włącz uwierzytelnianie MFA {#enable-authenticator-mfa}

1. Otwórz **User profile → Security**.
2. Włącz **Use multi-factor authentication**.
3. Zeskanuj kod QR konfiguracji w aplikacji uwierzytelniającej lub wprowadź klucz konfiguracyjny ręcznie.
4. Wprowadź kod weryfikacyjny z modułu uwierzytelniającego, aby potwierdzić konfigurację.
5. Zapisz kody odzyskiwania w bezpiecznym miejscu i potwierdź, że je zapisałeś.
6. Wybierz **Done — sign in again**, a następnie zaloguj się przy użyciu swojego hasła i kodu uwierzytelniającego.

Po konfiguracji logowanie hasłem wymaga dodatkowego wyzwania MFA. Rozpoczęcie konfiguracji powoduje zmianę sesji: jej ukończenie lub anulowanie wymaga ponownego zalogowania.

## Kody odzyskiwania {#recovery-codes}

Użyj zapisanego kodu odzyskiwania, jeśli nie możesz uzyskać dostępu do swojego uwierzytelniacza.

!!! warning "Przechowuj kody odzyskiwania w bezpiecznym miejscu"
    Każdy kod jest tajemnicą i można go użyć tylko raz. **Generate new recovery codes** zastępuje poprzedni zestaw; zapisz nowe kody, zanim zamkniesz okno.

Generowanie nowych kodów odzyskiwania lub wyłączanie MFA również wymaga ponownego zalogowania się po zakończeniu.

Aby wyłączyć MFA, użyj zakładki Security i dokończ żądaną weryfikację. Nie usuwaj jedynej działającej metody logowania przed przetestowaniem innej.

## Dodaj klucz dostępu {#add-a-passkey}

1. Otwórz **User profile → Passkeys** i wybierz nową akcję związaną z kluczem.
2. Wpisz nazwę, którą później rozpoznasz.
3. Wypełnij monit przeglądarki lub urządzenia, używając weryfikacji biometrycznej, kodu PIN lub klucza bezpieczeństwa.
4. Sprawdź, czy dane uwierzytelniające pojawiają się na liście.

Użyj opcji logowania za pomocą klucza dostępu w obsługiwanej przeglądarce na zgodnym urządzeniu. Klucze wymagają kompatybilnego urządzenia i przeglądarki. Zachowaj hasło do odzyskania konta.

## Usuń klucz dostępu {#remove-a-passkey}

Wybierz dane uwierzytelniające z listy Klucze dostępu i użyj akcji usuwania. Najpierw sprawdź jego nazwę i szczegóły dotyczące ostatniego użycia. Usunięcie go unieważnia dostęp tego poświadczenia; nie usuwa innych zarejestrowanych kluczy.

Po usunięciu aplikacja powiadamia zgodnych menedżerów haseł, aby mogli przestać oferować usunięty klucz. Twoja przeglądarka lub menedżer haseł może nie obsługiwać tej aktualizacji. Jeśli klucz dostępu nadal się pojawia, usuń go ręcznie z menedżera haseł; nie może już zalogować Cię na Twoje konto.

W przypadku zagubienia modułu uwierzytelniającego lub niedostępnego urządzenia wypróbuj skonfigurowaną alternatywną metodę lub kod odzyskiwania. Jeśli żadna nie jest dostępna, skontaktuj się z pomocą techniczną w celu uzyskania pomocy.
