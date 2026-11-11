---
title: Tworzenie wniosku o zatwierdzenie dokumentu
description: Wysyłaj dokumenty do zatwierdzenia w Click2Approve. Dodaj pliki, wskaż uczestników i etapy, a następnie wyślij zgłoszenie z Personal lub organizacji.
---
# Tworzenie wniosku o zatwierdzenie dokumentu {#create-a-request}

Aby przekazać dokument do zatwierdzenia, utwórz **zgłoszenie**. Zawiera pliki, instrukcje i kroki określające działania uczestników. Możesz poprosić o zatwierdzenie, przegląd lub podpis elektroniczny.

Najpierw wybierz obszar roboczy. **Personal** służy do zgłoszeń we własnym imieniu; organizację wybierz, gdy działasz w jej imieniu. Od obszaru zależy właściciel zgłoszenia i dostępne typy wykonawców. **Wykonawca** to osoba lub zespół, któremu przypisujesz krok.

## Przygotuj zgłoszenie {#compose-the-request}

1. [Otwórz aplikację](/app/), wybierz obszar i użyj **New request** na początku grupy **Work** w menu.
2. W organizacji wybierz **Custom** albo **From template**. Przy drugim wariancie wskaż szablon i przejdź do edytora.
3. Wpisz konkretny **Title**, na przykład „Zatwierdź zaktualizowaną umowę z dostawcą”.
4. Dodaj **Description** wyjaśniający cel, kontekst i oczekiwany wynik.
5. Dołącz [pliki do sprawdzenia](files.md).
6. Dodaj i skonfiguruj [kroki procesu](workflow-steps.md).

Karta **Request details** łączy tytuł, **Files to review** i opis. Kroki konfiguruje się poniżej.

W Personal wykonawców wskazuje się przez adres e-mail.

!!! info "Wykonawcy w organizacji"
    W organizacji możesz również przypisywać kroki jej pracownikom i zespołom.

## Przykład: zatwierdzenie i podpisanie oferty {#example-send-a-proposal-for-approval-and-signature}

1. Dodaj ofertę w **Files to review**.
2. Utwórz krok z **Action** ustawionym na **Approve** i wpisz e-mail osoby sprawdzającej.
3. Wybierz **Add step**, ustaw **Action** na **Sign**, dodaj e-mail klienta i włącz **Require an electronic signature**.
4. Uzupełnij **Instructions** w każdym kroku, aby obie osoby wiedziały, co sprawdzić.

Klient otrzyma zadanie po pomyślnym zatwierdzeniu. Jeśli wcześniej musi zgodzić się kilka osób, dodaj je do kroku i włącz **All assignees must complete**. Zasady opisuje [Konfigurowanie kroków](workflow-steps.md).

## Sprawdź i wyślij {#review-and-submit}

Sprawdź pliki, kolejność, działania, instrukcje, uczestników, zasady ukończenia, widoczność i dodatkowe wymagania. Jeśli potrzebujesz rysowanego podpisu, włącz **Require an electronic signature**; samo **Sign** go nie wymaga. Wybierz **Submit** i poczekaj na potwierdzenie przed opuszczeniem strony.

Popraw wyróżnione pola i spróbuj ponownie. Jeśli przeszkadza limit planu, sprawdź [wykorzystanie](usage.md) lub poproś Owner albo Admin organizacji o pomoc.

Jeśli imię lub nazwisko pracownika jest niepełne, ostrzeżenie pokaże sposób zapisania go w historii. Wybierz **Go back**, aby poprawić dane, albo **Proceed anyway**, aby wysłać z obecnym imieniem. Dane pracownika organizacji są zarządzane niezależnie od profilu osobistego.

Przy nowym zgłoszeniu organizacji tworzonym bez szablonu **Save template** zapisuje prywatny szablon z tytułu, opisu i kroków. Obowiązują reguły walidacji szablonów, a zapis nie zastępuje wysłania zgłoszenia. Zgłoszenia z szablonu i ich nowe wersje nie oferują tej opcji. Zobacz [Szablony procesów](templates.md).

## Po wysłaniu {#after-submission}

Otwórz **Requests** i wybierz zgłoszenie, aby śledzić postęp. Uczestnicy działają, gdy proces dochodzi do ich kroków. Dostarczanie powiadomień zależy od preferencji odbiorców.

[Śledzenie i poprawianie zgłoszeń](track-requests.md) wyjaśnia wyniki, anulowanie i nowe wersje. Wyjście z edytora lub anulowanie tworzenia odrzuca zmiany bez pytania o potwierdzenie. Wersje robocze zgłoszeń nie są zapisywane.
