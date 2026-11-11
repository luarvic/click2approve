---
title: Wykorzystanie, tokeny i limity przechowywania
description: Zobacz, które akcje Click2Approve korzystają z tokenów, jak mierzona jest pamięć plików i co dzieje się przy limicie. Skorzystaj z przykładu, aby oszacować wykorzystanie obiegu dokumentów.
---
# Wykorzystanie, tokeny i limity przechowywania {#usage-and-tokens}

Wybierz obszar roboczy i otwórz **Usage**, aby zobaczyć saldo tokenów, okres rozliczeniowy i całkowite zajęte miejsce. Tabela poniżej kafelków zawiera listę każdej akcji i jej **Tokens used**, łącznie z wpisami bez tokena. Akcje są uporządkowane według wykorzystanych żetonów, zaczynając od najwyższego, z kolejnością alfabetyczną dla równych kwot. Sortowanie wykorzystuje dokładne ilości przed zaokrągleniem wyświetlania. Kafelki Tokeny i Magazyn pokazują wykorzystane i dostępne ilości z paskiem przydziału. Wyświetlane kwoty tokenów są zaokrąglane w dół do pełnych tokenów; paski księgowe i kwotowe zachowują ułamkową precyzję.

## Miesięczny limit tokenów {#monthly-allowance}

Każdy plan obejmuje tokeny. W Personal Free odnawiają się co miesiąc od daty rozpoczęcia pierwszego okresu. W planach płatnych są przyznawane na każdy potwierdzony opłacony okres rozliczeniowy. Business Trial otrzymuje jedną pulę na cały miesiąc próbny. Niewykorzystane tokeny wygasają: nie przechodzą na kolejny okres i nie można ich przenosić między przestrzeniami roboczymi.

| Zaplanuj | Cena miesięczna (USD, bez podatków) | Dołączone tokeny | Pamięć |
| --- | --- | --- | --- |
| Personal Free | 0 dolarów | 1000 miesięcznie | 1 GB |
| Personal Pro | 20 dolarów | 50 000 miesięcznie | 10 GB |
| Business Trial | 0 $ tylko przez jeden miesiąc | 10 000 raz | 1 GB |
| Business Pro | 100 dolarów | 300 000 miesięcznie | 100 GB |

## Do czego wykorzystywane są tokeny {#what-uses-tokens}

Stawki za tokeny wynoszą:

| Action | Tokeny |
| --- | --- |
| Prześlij | 1 na MB |
| Wyświetl lub pobierz plik | 2 na MB |
| E-mail z przepływem pracy | 5 na odbiorcę |
| Prześlij lub ponownie złóż wniosek | 10 |
| Utwórz zadanie | 2 na zadanie |

Czytanie żądań i szczegółów zadań lub list, kończenie zadań i anulowanie żądań nie jest liczone i nie zużywa tokenów. Przesyłanie i ponowne przesyłanie mają tę samą stawkę.

Transfery wykorzystują dziesiętne MB (1 000 000 bajtów). Małe pliki zużywają tokeny ułamkowe, zamiast zaokrąglać każdy plik do jednego MB. Podglądy plików również przesyłają dane. Przeglądanie kopii już zapisanej w pamięci podręcznej przez przeglądarkę nie powoduje przeniesienia innego serwera. Opłaty za pomyślne transfery plików są naliczane za bajty dokumentu, bez narzutu związanego z kodowaniem adresu URL danych.

Żądania i zadania są obciążane początkowym obszarem roboczym przepływu pracy, nawet jeśli osoba zatwierdzająca korzysta z osobistej skrzynki odbiorczej. Przesyłane treści ze stron zadań i dyskusji należą do obszaru roboczego żądania, który płaci za ich przesyłanie, przechowywanie i pobieranie. Przesłane pliki wykonane podczas przygotowywania nowego żądania należą do wybranego obszaru roboczego. Weryfikacja konta, resetowanie hasła, powiadomienia dotyczące bezpieczeństwa, e-maile rozliczeniowe i zasoby związane z brandingiem publicznym nie zużywają tokenów obszaru roboczego.

## Przykładowy przepływ pracy {#example-workflow}

Przepływ pracy obejmujący 10 MB przesłanych, 10 MB wyświetlonych lub pobranych, pięć przepływów pracy dostarczonych do adresatów wiadomości e-mail, jedno przesłane żądanie i pięć utworzonych zadań wykorzystuje **75 tokenów**:

| Aktywność | Obliczenia | Tokens used |
| --- | --- | --- |
| Prześlij 10 MB | 10 × 1 | 10 |
| Wyświetl lub pobierz 10 MB | 10 × 2 | 20 |
| Dostarcz pięć wiadomości e-mail z przepływem pracy do jednego odbiorcy, każdy | 5 × 5 | 25 |
| Prześlij jedną prośbę | 1 × 10 | 10 |
| Utwórz pięć zadań | 5 × 2 | 10 |
| **Total**| |**75** |

Ukończenie tych zadań samo w sobie nie powoduje zużycia tokenów. Dalsze przesyłanie plików, e-maile, ponowne przesyłanie lub zadania utworzone na późniejszych etapach przepływu pracy są rozliczane osobno według powyższych stawek.

## Rozliczanie i niewystarczająca liczba tokenów {#charging-and-insufficient-tokens}

Przesyłanie, pobieranie i wysyłanie e-maili w procesie sprawdzają dostępne tokeny przed rozpoczęciem, a następnie rozliczają wykonaną pracę. Nieudane przesyłanie i niewysłane e-maile nie są obciążane opłatami. Za przerwane pobieranie pobierana jest opłata za przesłane bajty dokumentów. Załączenie lub usunięcie przesłanego pliku nie powoduje zwrotu opłaty za przesłanie.

Jednoczesne działania mogą spowodować, że saldo spadnie poniżej zera; dalsze płatne działania są blokowane do czasu udostępnienia tokenów.

Limity serii i współbieżności również chronią usługę. Można ponowić akcję z tymczasowym ograniczeniem szybkości.

Gdy liczba tokenów jest niewystarczająca, nowe płatne akcje są blokowane. Istniejące zapisy żądań i zadań pozostają dostępne; przeglądanie plików nadal wymaga tokenów. Ukończenie zadania może spowodować utworzenie zadań do następnego kroku, który wymaga żetonów w tempie tworzenia zadania. Otwórz **Plans**, aby sprawdzić swój limit. Usunięcie rekordu nie powoduje zwrotu już wykorzystanych tokenów.

## Miejsce na dane to osobny limit {#storage-is-a-separate-limit}

Pamięć mierzy pliki aktualnie zajmujące miejsce, w tym zaplanowane pliki oczekujące na oczyszczenie. Nie jest to nowy limit przesyłania każdego miesiąca. Przechowywanie pliku nie powoduje zużycia dodatkowych tokenów, ale wlicza się do pojemności Twojego planu do czasu jego usunięcia.

Wybierz [przechowywanie](retention.md), aby określić, jak długo potrzebujesz rekordów. Zaplanowana zmiana planu zachowuje aktualnie płatne uprawnienia do czasu jej wejścia w życie. Płatne uaktualnienie aktywuje się po zweryfikowaniu płatności; nie przyznaje tokenów tylko dlatego, że otwarto stronę płatności.
