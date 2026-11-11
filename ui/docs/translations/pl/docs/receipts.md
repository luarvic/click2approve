---
title: Potwierdzenia decyzji i weryfikacja plików dokumentów
description: Otwórz zapis decyzji i podpisów dotyczących dokumentu. Udostępnij potwierdzenie przez link i sprawdź, czy plik odpowiada zapisanej wersji.
---
# Potwierdzenia decyzji i weryfikacja plików {#receipts-and-verification}

**Potwierdzenie** to zapis tworzony przez Click2Approve po zakończeniu zgłoszenia. Zachowuje szczegóły, wynik i działania uczestników, w tym złożone podpisy. Pozwala sprawdzić, kto podjął działanie i jaki wynik zapisano.

Potwierdzenie możesz udostępnić przez link weryfikacyjny. Odbiorca obejrzy zapis i sprawdzi, czy jego kopia dokumentu odpowiada plikowi wymienionemu w potwierdzeniu.

!!! info "Kto zarządza potwierdzeniem?"
    Tylko użytkownik, któremu je wystawiono, może otworzyć lub usunąć potwierdzenie w obszarze roboczym i zarządzać linkami. Dotyczy to Personal i organizacji. Role Owner i Admin nie pozwalają otwierać cudzych potwierdzeń.

Autor zgłoszenia i każdy wykonawca, który otrzymał zadanie, dostają potwierdzenie po zakończeniu, anulowaniu lub zastąpieniu zgłoszenia nową wersją. Każda osoba otrzymuje jedno na obszar roboczy i wersję zgłoszenia, nawet jeśli ma wiele zadań lub jest również autorem. Ukończenie zadania nie jest konieczne: zapisany stan odróżnia przydzielenie od wykonanej czynności. Kroki, które nie utworzyły zadania, nie wystawiają potwierdzenia wykonawcy.

## Otwieranie potwierdzenia {#open-a-receipt}

Otwórz **Receipts** w obszarze, z którego wysłano zgłoszenie lub w którym wykonano zadanie. Wybierz właściwe potwierdzenie. Nagłówek karty **Receipt** zawiera krótki numer, podobnie jak karty zgłoszeń i zadań. Dalej są pełny identyfikator i data, a następnie sekcje **Request** i **Task** ze szczegółami, wynikami, uczestnikami, działaniami i dostępnymi podpisami.

Nagłówki **Request** i **Task** zawierają krótkie numery zarówno w obszarze roboczym, jak i na udostępnionej stronie weryfikacyjnej. Pełne identyfikatory pozostają w szczegółach, jeśli są dostępne.

Daty używają lokalnej daty i godziny bez sekund. Puste pola i numer pierwszej wersji są ukryte.

Podczas drukowania sekcje Request i Task mogą przechodzić na kolejne strony. Nagłówek pozostaje z pierwszym wierszem, a pojedyncze wiersze i podpisy nie są dzielone, jeśli mieszczą się na stronie.

Potwierdzenie zachowuje kontekst zakończonej pracy. Ustawienia widoczności dla uczestnika mogą ograniczać zawarte kroki. Jest niezależne od bieżącego zgłoszenia.

## Tworzenie linku weryfikacyjnego {#create-a-verification-link}

1. Otwórz potwierdzenie, którym możesz zarządzać.
2. Wybierz **Share**.
3. Wybierz **New link**, ustaw **Expires** i utwórz link.
4. Wybierz utworzony link na liście, aby otworzyć adres weryfikacji, następnie skopiuj go i przekaż właściwej osobie.

Kod QR na karcie prowadzi do tego samego linku. Logo lub nazwa Click2Approve nad kartą otwierają stronę główną.

!!! warning "Każdy posiadacz linku może zobaczyć potwierdzenie"
    Aktywny link otwiera zapis bez członkostwa w obszarze roboczym. Przed udostępnieniem sprawdź zawartość: może obejmować nazwiska, decyzje i podpisy.

## Weryfikacja pliku {#verify-a-file}

Otwórz potwierdzenie w swoim obszarze albo aktywny link i wybierz **Verify file**. Wskaż własną kopię dokumentu. Przeglądarka obliczy **SHA-256 hash**, czyli skrót zawartości. Click2Approve porówna go z zapisanymi skrótami i pokaże zgodność z plikiem zgłoszenia lub załącznikiem odpowiedzi uczestnika. Plik jest odczytywany w przeglądarce; wybrana kopia nie jest przesyłana na serwer.

Gdy otrzymasz zatwierdzoną ofertę i link do potwierdzenia, otwórz link i sprawdź ofertę przez **Verify file**. Zmieniona zawartość nie da zgodnego skrótu, nawet przy tej samej nazwie pliku.

Wynik pojawia się nad **Verify file**. **File verified** wskazuje zgodny załącznik i jego zgłoszenie lub zadanie. **File does not match** oznacza brak pliku o tym samym skrócie. Sprawdź wybraną wersję i spróbuj ponownie.

Weryfikacja korzysta z metadanych i skrótów zachowanych w potwierdzeniu. Działa również po usunięciu oryginalnych załączników; przechowywanie potwierdzenia nie zatrzymuje tych plików.

Zgodność potwierdza identyczną zawartość z zapisanym plikiem. Nie ocenia twierdzeń dokumentu ani nie weryfikuje niezależnie tożsamości podpisującego.

## Zatrzymanie udostępniania {#stop-sharing}

W **Share** wybierz link, użyj **Remove** i potwierdź, gdy dostęp nie jest już potrzebny. Wygasły lub unieważniony link nie udostępnia potwierdzenia. Utworzenie innego nie wydłuża ważności dotychczasowego.

Jeśli link nie działa, poproś właściciela o aktualny. Publiczny link udostępnia tylko to potwierdzenie, nie zgłoszenia, zadania ani katalogi organizacji.

## Okres przechowywania potwierdzeń {#receipt-retention}

Czyszczenie w tle usuwa potwierdzenia i linki zgodnie z [zasadami przechowywania](retention.md) ich obszaru roboczego, licząc od utworzenia potwierdzenia:

| Plan | Przechowywanie potwierdzeń |
| --- | --- |
| Personal Free | Pięć lat |
| Business Trial | Jeden miesiąc |
| Plany płatne | Skonfigurowany okres **Requests and receipts**, w tym **Never delete** |

Potwierdzenie osobistego wykonawcy podlega zasadom jego obszaru Personal, niezależnie od planu organizacji wysyłającej zgłoszenie. Zmiana planu zmienia też zasady dla istniejących, jeszcze nieusuniętych potwierdzeń. Usunięcie pierwotnego zgłoszenia nie usuwa potwierdzeń. Usunięcie obszaru lub czyszczenie związane z płatnościami może jednak usunąć je wcześniej.

Link nie jest niezależną kopią zapasową potwierdzenia. Unieważnienie zatrzymuje udostępnianie bez usuwania zapisu.

## Usuwanie swojego potwierdzenia {#delete-your-receipt}

Wybierz **Delete** w swoim potwierdzeniu i zatwierdź w **Delete receipt**. To trwale usuwa zapis i wszystkie jego linki, ale nie pierwotne zgłoszenie ani potwierdzenia innych uczestników. Owner i Admin również mogą usuwać tylko potwierdzenia wystawione im samym.

Aby zatrzymać udostępnianie i zachować potwierdzenie, unieważnij jego linki.
