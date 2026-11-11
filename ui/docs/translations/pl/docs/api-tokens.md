---
title: Połącz przepływy pracy zatwierdzania z tokenami API
description: Utwórz token API Click2Approve na potrzeby swojej integracji, wyślij go jako token okaziciela i zapoznaj się z dokumentacją API. Dowiedz się, jak działają uprawnienia tokenu i unieważnianie.
---
# Tokeny API do integracji procesów zatwierdzania {#api-tokens}

Użyj Click2Approve API, aby połączyć własne narzędzia i zautomatyzować przepływy pracy zatwierdzania. Tokeny API umożliwiają integracjom dostęp do API poprzez Twoje konto użytkownika. Zarządzaj nimi w swoim profilu, niezależnie od tego, czy pracujesz w Personal, czy w organizacji.

## Utwórz token {#create-a-token}

1. Otwórz **User profile → API tokens**.
2. Wybierz **New API token**.
3. Wprowadź rozpoznawalną nazwę i, jeśli to konieczne, datę ważności.
4. Utwórz token i skopiuj jego wartość przed zamknięciem okna dialogowego.
5. Przechowuj go bezpiecznie na potrzeby zamierzonej integracji.

!!! warning "Skopiuj token przed zamknięciem"
    Pełna wartość jest pokazana tylko raz. Przechowuj je bezpiecznie i trzymaj z dala od wiadomości, zrzutów ekranu i kontroli źródła. Jeśli go zgubisz, utwórz zamiennik i unieważnij stary token.

## Poznaj API {#explore-the-api}

Otwórz [odniesienie API (interfejs Swagger)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"}, aby przeglądać punkty końcowe, pola żądań i odpowiedzi.

Aby wypróbować uwierzytelnione żądanie, wybierz **Authorize**, wklej swój token API bez przedrostka `Bearer` i potwierdź. Swagger dodaje nagłówek autoryzacji za Ciebie. Wybierz punkt końcowy, wybierz **Try it out**, wypełnij wymagane pola i wybierz **Execute**. Te żądania wykorzystują Twoje konto i mogą tworzyć, zmieniać lub usuwać prawdziwe dane.

Punkty końcowe bezpieczeństwa konta wymagają interaktywnej sesji logowania i nie można ich używać z tokenami API.

## Użyj tokena w swojej integracji {#use-a-token-in-your-integration}

Wyślij swój token w Nagłówek `Authorization` przy każdym żądaniu API:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Zastąp `YOUR_API_TOKEN` wartością skopiowaną podczas tworzenia tokena. Tokeny działają z uprawnieniami Twojego konta. Utworzenie tokena nie daje dostępu do pracy innego użytkownika ani do zasobów innej organizacji; autoryzacja nadal obowiązuje.

## Unieważnij token {#revoke-a-token}

Wybierz token z listy, wybierz **Revoke** i zatwierdź. Zaktualizuj każdą integrację, która go używała, za pomocą zastępczego poświadczenia. Unieważnij nieużywane tokeny i dane uwierzytelniające, które podejrzewasz, że zostały ujawnione.

Tokeny API to ustawienia konta. Zmiana obszarów roboczych nie powoduje utworzenia oddzielnego zestawu tokenów.
