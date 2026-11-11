---
title: Funkcje zatwierdzania dokumentów i dostęp do obszaru roboczego
description: Zobacz, które funkcje Click2Approve działają w obszarach roboczych osobistych i organizacji, w tym kroki zatwierdzania, podpisy, zespoły, szablony i potwierdzenia.
---
# Funkcje zatwierdzania dokumentów i dostęp do obszaru roboczego {#features-and-availability}

Click2Approve łączy w sobie przeglądanie dokumentów, etapy zatwierdzania, podpisy elektroniczne i śledzenie żądań. Wykorzystaj **Personal**, swoją przestrzeń roboczą do własnych zgłoszeń i zadań kierowanych na adres e-mail, do pracy indywidualnej. Użyj obszaru roboczego organizacji do wspólnych biznesowych przepływów pracy. Twój obszar roboczy, rola i plan określają, jakie działania możesz podjąć.

Możesz także podłączyć własne narzędzia za pośrednictwem Click2Approve API. Zobacz [API tokeny](api-tokens.md), aby utworzyć dane uwierzytelniające i uwierzytelnić żądania integracji.

!!! info "Tylko organizacja"
    Pracownicy, zespoły, delegacje i szablony przepływów pracy należą do organizacji. Aby z nich skorzystać, wybierz organizację w selektorze obszarów roboczych. Inne funkcje opisane w tym przewodniku są również dostępne w Personal.

## Jak działa zatwierdzanie dokumentów {#how-document-approval-works}

1. [Utwórz wniosek](create-a-request.md) zawierający dokumenty i instrukcje.
2. [Skonfiguruj kroki przepływu pracy](workflow-steps.md), aby wybrać, kto ma działać i w jakiej kolejności. Kilka osób może przeglądać na tym samym etapie.
3. Uczestnicy otwierają **Tasks**, aby [zapisać swoje decyzje](complete-a-task.md). Krok może wymagać komentarza, podpisu elektronicznego lub pliku odpowiedzi.
4. Otwórz **Requests**, aby [sprawdzić postęp](track-requests.md). Po zakończeniu żądania [receipts](receipts.md) zachowuje jego wynik i zarejestrowane działania.

Na przykład dwie osoby mogą sprawdzić ofertę w pierwszym kroku, a klient dodać podpis w kolejnym. Jeśli potrzebujesz odręcznie narysowanego podpisu, włącz w tym kroku **Require an electronic signature**.

## Odniesienie do obszaru roboczego {#workspace-reference}

| Funkcja | Personal | Organizacja |
| --- | --- | --- |
| Requests, zadania, uporządkowane kroki i e-maile do przypisanych osób | Dostępne | Dostępne |
| Wymagane uwagi i podpisy elektroniczne | Dostępne | Dostępne |
| Dyskusje i załączniki do dyskusji | Dostępne | Dostępne |
| Załączniki odpowiedzi na zadanie | Dostępne | Dostępne |
| Poproś o poprawki | Dostępne dla kwalifikujących się żądań | Dostępne dla kwalifikujących się żądań |
| Pracownicy i osoby upoważnione przez pracowników | — | Dostępne |
| Zespoły i osoby przypisane do zespołów | — | Dostępne |
| Delegations | — | Dostępne |
| Szablony przepływu pracy | — | Twórz własne i ponownie wykorzystuj szablony udostępnione w organizacji |
| Potwierdzenia i linki weryfikacyjne | Przeglądaj, udostępniaj i usuwaj wystawione Ci potwierdzenia | Każdy członek może przeglądać, udostępniać i usuwać wystawione mu potwierdzenia |
| Plans, użytkowanie i przechowywanie | Zarządzaj własnym planem i ustawieniami | Właściciele i administratorzy zarządzają planem i ustawieniami |
| Profile, zapisany podpis, MFA, hasła i tokeny API | Ustawienia konta | Te same ustawienia konta we wszystkich obszarach roboczych |

## Uprawnienia organizacji {#organization-permissions}

Członkowie mogą przeglądać katalogi pracowników, zespołów i delegacji. Właściciele i administratorzy zarządzają pracownikami, zespołami, delegacjami, rozliczeniami i przechowywaniem. Szablony są domyślnie prywatne; ich twórcy mogą udostępniać je innym członkom organizacji do przeglądania i używania. Tylko twórca może edytować lub usunąć szablon. Dostęp do potwierdzenia jest ograniczony do użytkownika, któremu dany potwierdzenie jest wystawiony. Tylko właściciel może zaplanować usunięcie organizacji.

Dostęp do żądania lub zadania zależy od uczestnictwa, relacji w zespole i delegowania. Samo członkostwo w organizacji nie udostępnia wszystkich przepływów pracy ani nie zapewnia dostępu do zapisów innej organizacji.

Patrz [Pracownicy i role](employees.md), aby zapoznać się z informacjami o roli oraz [Wykorzystanie i limity](usage.md), aby zapoznać się z ograniczeniami planu. Otwórz **Plans**, aby zobaczyć swoje aktualne uprawnienia i dostępne opcje planu.
