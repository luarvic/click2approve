---
title: System zatwierdzania dokumentów typu open source
description: Self-host Click2Approve, bezpłatny system zatwierdzania dokumentów na licencji MIT z wieloetapowym przepływem pracy, wieloma recenzentami i podpisami elektronicznymi. Porównaj wydania.
---
# System zatwierdzania dokumentów typu open source {#open-source-document-approval-system}

Click2Approve to bezpłatny system zatwierdzania dokumentów typu open source, objęty licencją MIT, który można hostować we własnej infrastrukturze. Przesyłaj dokumenty, przypisuj recenzentów według adresów e-mail i śledź ich decyzje dzięki wieloetapowemu procesowi zatwierdzania. Możesz poprosić o podpisy elektroniczne i komentarze, gdy zadanie wymaga wyjaśnienia.

Wersja open source obsługuje konta indywidualne i obieg dokumentów osobistych do użytku osobistego lub komercyjnego. Nie ma opłaty licencyjnej Click2Approve; pokrywasz koszty swojej infrastruktury i dostawcy. Aby rozpocząć, zobacz [kod źródłowy i instrukcje dotyczące samodzielnego hostingu](https://github.com/luarvic/click2approve).

Wersja komercyjna dodaje obszary robocze organizacji, narzędzia do współpracy oraz kontrolę użytkowania i przechowywania opartą na subskrypcji. Pozostałe przewodniki w tym portalu opisują usługę komercyjną; użyj tego porównania, aby sprawdzić, które funkcje dotyczą wersji open source.

## Przykład: przejrzyj i zatwierdź propozycję {#example-review-and-approve-a-proposal}

1. Prześlij propozycję i dodaj etap zatwierdzania dla osób, które muszą ją sprawdzić.
2. Wybierz, czy wszyscy przydzieleni do danego kroku muszą odpowiedzieć, czy może go ukończyć tylko jeden recenzent. Etapy przepływu pracy przebiegają w określonej kolejności, a w każdym kroku może działać wielu przypisanych osób.
3. Dodaj krok podpisywania, jeśli propozycja również wymaga podpisu elektronicznego.
4. Śledź postęp żądania i zapisane decyzje z **Requests**. Każdy uczestnik znajduje przydzieloną mu pracę w **Tasks**.

Zobacz [Utwórz żądanie](create-a-request.md) i [Konfiguruj kroki przepływu pracy](workflow-steps.md), aby zapoznać się z elementami sterującymi przepływem pracy. Udostępniane potwierdzenia i weryfikacja plików to funkcje komercyjne; przy wyborze wydania zobacz porównanie poniżej.

## Porównanie funkcji {#feature-comparison}

| Funkcja | Otwarte oprogramowanie | Komercyjne |
| --- | --- | --- |
| Personal żądania i zadania z przesłanymi plikami | Zawarte | Zawiera |
| Wiele etapów przepływu pracy, przypisanie szeregowe lub równoległe oraz zasady ukończenia wszystkich/dowolnych | Zawarte | Zawiera |
| Zatwierdzenie, podpisanie, potwierdzenie, potwierdzenie, przegląd, weryfikacja, akceptacja i zakończenie działań | Zawarte | Zawiera |
| Wymagane uwagi i podpisy elektroniczne | Zawarte | Zawarte |
| Żądanie śledzenia, anulowania i usunięcia | Zawarte | Zawiera |
| Profile, zapisane podpisy, hasło logowania, MFA i hasła | Zawarte | Zawiera |
| Powiadomienia e-mailowe i w aplikacji | Zawarte | Zawiera |
| Przestrzenie robocze organizacji, pracownicy, role i przydzieleni pracownicy | Niedostępne | Zawiera |
| Zespoły i osoby przypisane do zespołów | Niedostępne | Zawiera |
| Delegations | Niedostępne | Zawiera |
| Szablony przepływu pracy organizacji | Niedostępne | Zawiera |
| Dyskusje i załączniki do dyskusji | Niedostępne | Zawiera |
| Załączniki odpowiedzi na zadanie i wymagane pliki odpowiedzi | Niedostępne | Zawiera |
| Żądanie poprawek i porównań plików pomiędzy wersjami | Niedostępne | Zawiera |
| Receipts, udostępniane łącza weryfikacyjne i weryfikacja plików | Niedostępne | Zawiera |
| Tokeny API do integracji | Niedostępne | Zawiera |
| Plany subskrypcyjne, raportowanie wykorzystania tokenów i rozliczenia | Niedostępne | Zawiera |
| Ustawienia przechowywania obszaru roboczego i automatyczne czyszczenie przechowywania | Niedostępne | W zestawie |

Funkcje komercyjne zależą od Twojego obszaru roboczego, roli, uczestnictwa i limitów planu. Zobacz [Funkcje i dostępność](features.md), aby uzyskać uprawnienia dotyczące obszaru roboczego, oraz [Plany i rozliczenia](plans-and-billing.md), aby uzyskać informacje o subskrypcjach. Dostarczanie poczty e-mail w przypadku instalacji na własnym serwerze wymaga dostawcy poczty e-mail.

## Użyj aplikacji typu open source {#use-the-open-source-app}

1. Zarejestruj się lub zaloguj na swoje konto.
2. Wybierz **New request**, prześlij swoje pliki i skonfiguruj etapy przepływu pracy, korzystając z adresów e-mail wykonawców. Zobacz [Utwórz żądanie](create-a-request.md) i [Konfiguruj kroki przepływu pracy](workflow-steps.md), aby poznać wspólne elementy sterujące przepływem pracy.
3. Użyj **Requests** do śledzenia wysłanych prac i **Tasks** do wykonania przypisanych Ci działań. Zobacz [Wykonaj zadanie](complete-a-task.md), aby uzyskać komentarze i podpisy; załączniki odpowiedzi są dostępne w wersji komercyjnej.

Nawigacja organizacji i narzędzia komercyjne są ukryte w aplikacji typu open source. Możesz zarządzać swoim profilem, zapisanym podpisem, preferencjami powiadomień, MFA i hasłami za pomocą menu profilu.

## Źródło i samodzielny hosting {#source-and-self-hosting}

W [repozytorium open source](https://github.com/luarvic/click2approve) znajdziesz kod źródłowy, licencję MIT, konfigurację Dockera i instrukcje dotyczące samodzielnego hostingu. Odwiedź [usługę Click2Approve](../index.md), aby uzyskać wersję komercyjną.
