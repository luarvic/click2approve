---
title: Przechowywanie i usuwanie zapisów zatwierdzeń
description: Dowiedz się, jak długo Click2Approve przechowuje żądania, potwierdzenia i pliki. Przejrzyj ustawienia przechowywania i to, co się stanie, gdy usuniesz rekord lub organizację.
---
# Przechowywanie i usuwanie {#retention-and-deletion}

Wybierz, jak długo mają być przechowywane żądania, potwierdzenia i powiadomienia w każdym obszarze roboczym. Kontrola usuwania zależy od zasobu i Twoich uprawnień.

## Ustaw przechowywanie {#set-retention}

1. Wybierz obszar roboczy i otwórz **Retention**.
2. Przejrzyj okresy **Requests**, **Receipts** i **Notifications** w przypadku planów bezpłatnych i próbnych lub **Requests and receipts** i **Notifications** w przypadku planów płatnych. Pośrednie wartości suwaka pojawiają się w małym dymku nad uchwytem suwaka; punkty końcowe to **1 month** i **Never delete**.
3. Jeśli Twój plan i uprawnienia pozwalają na zmiany, wybierz okres dla każdego z nich i wybierz **Save**.

Użytkownicy Personal zarządzają własnymi ustawieniami, a właściciele i administratorzy — polityką organizacji. W Personal Free i Business Trial wnioski oraz powiadomienia są przechowywane przez miesiąc. Potwierdzenia są przechowywane przez pięć lat w Personal Free i przez miesiąc w Business Trial, licząc od utworzenia. Płatne plany pozwalają skonfigurować **Requests and receipts** oraz **Notifications**, w tym opcję **Never delete**.

Gdy Personal Free lub Business Trial stanie się aktywny, oba okresy automatycznie zmienią się na jeden miesiąc, łącznie z poprzednim ustawieniem **Never delete**. Zaplanowane przejście na niższą wersję powoduje zachowanie bieżących ustawień przechowywania do zakończenia płatnego okresu. Żądania i powiadomienia starsze niż miesiąc kwalifikują się do czyszczenia tła. Czyszczenie potwierdzeń następuje po okresie wpływów bieżącego planu, w tym w przypadku istniejących potwierdzeń; aktualizacja przed czyszczeniem może wydłużyć ich przechowywanie.

!!! warning "Przechowywanie nie jest kopią zapasową"
    Rekordy można usunąć poprzez czyszczenie w tle po okresie ich przechowywania. Wybierz politykę, która spełni Twoje potrzeby w zakresie prowadzenia dokumentacji przed zgromadzeniem ważnej historii przepływu pracy.

## Przypomnienia o przechowywaniu {#retention-reminders}

Zanim upłyną termin przechowywania żądań i potwierdzeń, ich właściciele otrzymują
**Retention deletion reminders**. Standardowy okres wypowiedzenia wynosi jeden tydzień. Każde
przypomnienie określa rekord, którego dotyczy problem, oraz datę jego usunięcia. E-maile zawierają łącza do tego rekordu, ustawień przechowywania obszaru roboczego i tego przewodnika.
Przypomnienia o prośbach trafiają do osoby zgłaszającej prośbę; przypomnienia o potwierdzeniach trafiają tylko do właściciela potwierdzenia.
Każde żądanie lub potwierdzenie generuje jedno przypomnienie; zmiana terminu przechowywania
nie resetuje tego przypomnienia.

Zarządzaj dostawą **In-app** i **Email** w ramach **User profile → Notifications → Retention deletion reminders**.
Oba starty włączone. Wyłączenie przypomnień nie wyłącza czyszczenia przechowywania. Aby
przechowywać dane dłużej, zmień okres przechowywania, jeśli pozwala na to Twój plan i uprawnienia
lub skontaktuj się z właścicielem lub administratorem organizacji.
Przypomnienia e-mailowe korzystają z [tokenów powiadomień e-mail](usage.md) i wymagają wystarczającej
tokenów w obszarze roboczym.

Przypomnienia podążają za Twoimi preferencjami powiadomień i normalnymi próbami dostarczenia.
Czyszczenie przechowywania odbywa się zgodnie ze skonfigurowanym harmonogramem, nawet jeśli przypomnienie jest wyłączone
lub nie może zostać dostarczone. Przypomnienia dotyczą automatycznego przechowywania żądań i potwierdzeń;
czyszczenie powiadomień, usuwanie ręczne, usuwanie organizacji i czyszczenie związane z płatnościami
czyszczenie podlega własnym regułom.

## Usuń pojedyncze rekordy {#delete-individual-records}

Skorzystaj z akcji usuwania oferowanej dla żądania, zadania, potwierdzenia, pracownika, zespołu, szablonu lub delegacji tylko wtedy, gdy zamierzasz usunąć ten rekord. Przeczytaj potwierdzenie i ewentualną wiadomość potwierdzającą.

Tylko właściciel potwierdzenia może go usunąć ręcznie. Ręczne usuwanie i czyszczenie przechowywania powodują jednoczesne usunięcie potwierdzenia i linków weryfikacyjnych. Usunięcie potwierdzenia nie powoduje usunięcia pierwotnej prośby ani potwierdzeń innych uczestników. Usunięcie pierwotnego żądania nie powoduje usunięcia jego potwierdzeń.

Relacja z innego rekordu może uniemożliwić usunięcie. W stosownych przypadkach rozwiąż zidentyfikowaną relację. Powtarzające się próby nie usuwają zależności.

Żądanie z nowszą wersją nie może zostać usunięte, jeśli ta wersja się do niego odwołuje. Rozpocznij od najnowszej wersji podczas usuwania łańcucha wersji. Usuwanie harmonogramów czyszczenia; poczekaj, aż ta wersja zostanie usunięta, zanim spróbujesz ponownie zastosować poprzednią wersję.

Usunięcie żądania powoduje, że będzie ono natychmiast kwalifikowało się do oczyszczenia w tle, niezależnie od jego wieku. Wcześniej wykorzystane tokeny nie podlegają zwrotowi.

Potwierdzenia zachowują metadane plików i skróty bez wydłużania okresu przechowywania załączników. Usunięcie potwierdzenia nie powoduje usunięcia ani nie zaplanowania oczyszczenia jego oryginalnych załączników.

Pliki powiązane z usuniętymi rekordami przepływu pracy można zaplanować do późniejszego oczyszczenia, dzięki czemu ich zapisana zawartość i wykorzystanie nie znikną natychmiast. Awatary profili i logo organizacji można natychmiast usunąć po wymianie lub usunięciu.

## Usuń organizację {#delete-an-organization}

!!! warning "Usunięcie organizacji powoduje natychmiastowe zablokowanie dostępu"
    Tylko właściciel może zaplanować usunięcie organizacji. Organizacja natychmiast znika z obszaru wyboru obszaru roboczego i staje się niedostępna; przetwarzanie w tle usuwa dane później. Przed potwierdzeniem należy zachować wymagane zapisy. Opóźnienie w usuwaniu usterek nie umożliwia odzyskania.

## Usunięcie związane z płatnością {#payment-related-removal}

Zawieszenie płatności ma swój własny termin. Rozwiąż nieudane płatności w ramach [Planów](plans-and-billing.md) przed upływem tego terminu. Wygaśnięcie usuwa organizacje biznesowe; Obszary robocze Personal tracą dane przepływu pracy i wracają do Personal Free, zachowując tożsamość i profil. Ustawienie przechowywania nie zastępuje procesu odzyskiwania płatności.
