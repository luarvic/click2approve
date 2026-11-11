---
title: Napraw brakujące zadania zatwierdzania i nieudane przesłania
description: Znajdź brakujące żądania lub zadania i rozwiąż problemy z zatwierdzaniem dokumentów w Click2Approve, w tym z nieudanymi przesłaniami, problemami z logowaniem i wygasłymi linkami do potwierdzeń.
---
# Rozwiązywanie problemów z zatwierdzaniem dokumentów {#troubleshooting}

Jeśli nie możesz znaleźć zadania zatwierdzenia, prześlij prośbę lub otwórz link do potwierdzenia, zacznij od sprawdzenia swojego konta i wybranego obszaru roboczego. Otwórz żądanie lub zadanie, aby sprawdzić jego aktualny status. Następnie przeczytaj komunikat o błędzie dotyczący działania, które się nie powiodło.

## Nie mogę znaleźć żądania lub zadania {#i-cannot-find-a-request-or-task}

Zadania adresowane e-mailem pojawiają się w **Personal**. Przypisania pracowników i zespołów pojawiają się w ich organizacji. Sprawdź adres e-mail konta, status pracownika, członkostwo w zespole i ewentualne delegacje. Zadanie może również zostać anulowane, pominięte, ukończone, zastąpione lub usunięte.

Łącze e-mail nie zapewnia dostępu organizacji. Zobacz [Przestrzenie robocze i nawigacja](workspaces.md).

Jeśli widzisz **Page not found**, strona mogła zostać przeniesiona lub nie masz do niej dostępu. Wybierz **Home**, aby wrócić, a następnie sprawdź swoje konto i obszar roboczy.

## Brakuje pozycji menu lub akcji {#a-menu-item-or-action-is-missing}

Sprawdź [Funkcje i dostępność](features.md). Pracownicy, zespoły, delegacje i szablony wymagają obszaru roboczego organizacji. Twoja rola, plan lub stan rozliczeń mogą ukryć lub wyłączyć elementy sterujące. Wybierz właściwą organizację i poproś właściciela lub administratora o sprawdzenie Twojego dostępu.

## Aplikacja ładuje się ponownie po aktualizacji {#the-app-reloads-after-an-update}

Aplikacja ładuje się automatycznie po wykryciu nowej wersji i ponownym otwarciu bieżącej strony. Tekst, którego nie zapisałeś, może zostać utracony.

## Przesyłanie lub ukończenie zadania nie powiodło się. {#submission-or-task-completion-fails}

Popraw zaznaczone pola i podaj wszystkie wymagane komentarze, podpisy i załączniki. Poczekaj na zakończenie przesyłania. Sprawdź [Wykorzystanie](usage.md), jeśli wiadomość wspomina o zasobach.

Odśwież zasób przed ponowną próbą po błędzie API: inny uczestnik lub delegat mógł już go ukończyć. Sprawdź Żądania lub Zadania, aby określić, czy pierwotna akcja powiodła się, zanim ją powtórzysz.

## Nie mogę poprawić żądania {#i-cannot-revise-a-request}

Ponowne przesłanie jest dostępne tylko w przypadku kwalifikujących się żądań bez nowszej wersji i bez pomyślnego wyniku. Nowa wersja ponownie uruchamia przepływ pracy; poprzednie decyzje pozostają w mocy poprzedniej rewizji. Zobacz [Śledź i poprawiaj żądania](track-requests.md).

## Link weryfikacyjny nie działa {#a-verification-link-does-not-work}

Link mógł wygasnąć, zostać unieważniony lub prowadzić do usuniętego potwierdzenia. Poproś właściciela potwierdzenia o aktualny link. [Potwierdzenia i weryfikacja](receipts.md).

## Nie mogę się zalogować ani odebrać wiadomości e-mail {#i-cannot-sign-in-or-receive-email}

Sprawdź, czy wymagane jest potwierdzenie e-mailem i w razie potrzeby poproś o nowe potwierdzenie lub wiadomość dotyczącą resetowania hasła. Sprawdź spam i adres swojego konta. W przypadku MFA wypróbuj nieużywany kod odzyskiwania; w przypadku kluczy spróbuj zalogować się na zarejestrowanym zgodnym urządzeniu lub za pomocą hasła.

Przejrzyj [Rejestracja i logowanie](sign-in.md), [MFA i hasła](security.md) oraz [Powiadomienia](notifications.md).

## Obszar roboczy jest zablokowany dla płatności {#the-workspace-is-blocked-for-payment}

Otwórz **Plans** i wykonaj akcję odzyskiwania płatności przed wyświetlonym terminem. Właściciel lub administrator organizacji musi zarządzać płatnościami organizacji. Zobacz [Plany i rozliczenia](plans-and-billing.md).

## Usuwanie jest zablokowane {#deletion-is-blocked}

Przeczytaj komunikat o zależności. Inny rekord może nadal odwoływać się do pracownika, zespołu lub jednostki przepływu pracy. Przed usunięciem powiązanych rekordów zapoznaj się z [Przechowywanie i usuwanie](retention.md).

## Uzyskaj pomoc lub zgłoś błąd {#get-help-or-report-a-bug}

Użyj linków **Report a bug** lub **Ask question** w aplikacji. Uwzględnij kroki umożliwiające odtworzenie, oczekiwany wynik, rzeczywisty wynik, przybliżony czas i odpowiedni typ obszaru roboczego. Jeśli błąd API oferuje **Details**, przejrzyj informacje diagnostyczne i uwzględnij tylko te, które są odpowiednie dla kanału pomocy.

Trzymaj hasła, tokeny API, kody odzyskiwania, linki weryfikacyjne i dokumenty prywatne poza publicznymi raportami. W przypadku problemów z kontem, pocztą e-mail, bezpieczeństwem lub rozliczeniami skontaktuj się z pomocą techniczną.
