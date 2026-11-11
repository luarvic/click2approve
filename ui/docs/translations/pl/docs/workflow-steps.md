---
title: Skonfiguruj kroki przepływu pracy zatwierdzania dokumentów
description: Skonfiguruj etapy zatwierdzania w odpowiedniej kolejności lub pozwól kilku recenzentom działać na jednym etapie. Wybierz wszystkich lub dowolnego wykonawcy, wymagane podpisy, komentarze i załączniki.
---
# Skonfiguruj etapy przepływu pracy zatwierdzania dokumentów {#configure-workflow-steps}

Przepływ pracy zatwierdzania określa, kto i w jakiej kolejności wykonuje czynności na dokumencie. **osoba przydzielona** to osoba lub zespół przypisany do kroku. Kroki przebiegają jeden po drugim. Na tym samym etapie może działać kilku osób.

Użyj **Add step**, aby utworzyć kolejny krok, strzałek, aby zmienić jego kolejność, a przycisku usuwania, aby go usunąć.

## Zatwierdzenia sekwencyjne i równoległe {#sequential-and-parallel-approvals}

Użyj oddzielnych kroków, gdy jedna decyzja musi nastąpić przed drugą. To jest **zatwierdzenie sekwencyjne**. Na przykład recenzent zatwierdza propozycję w kroku 1, a następnie klient podpisuje się w kroku 2.

Umieść ludzi w tym samym kroku, gdy mogą recenzować w tym samym czasie. Jest to **zatwierdzenie równoległe** w ramach tego etapu. Same kroki nadal działają w odpowiedniej kolejności.

| Potrzebujesz… | Skonfiguruj przepływ pracy w ten sposób |
| --- | --- |
| Jeden recenzent, a za nim kolejny | Dodaj osobny krok dla każdego recenzenta |
| Dwóch recenzentów, którzy muszą zatwierdzić | Dodaj oba do jednego kroku i włącz **All assignees must complete** |
| Zgoda jednej z kilku osób | Dodaj je do jednego kroku i pozostaw **All assignees must complete** wyłączone |
| Zatwierdzenie, po którym następuje sporządzony podpis | Dodaj krok **Approve**, następnie krok **Sign** z włączoną opcją **Require an electronic signature** |

## Wybierz akcję i uczestników {#choose-an-action-and-participants}

Dla każdego kroku wybierz **Action** i wpisz jasne **Instructions**. Dostępne działania to Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept i Complete. Wybierz działanie odpowiadające decyzji, którą chcesz zapisać.

Dodaj wykonawców pocztą elektroniczną i przed przesłaniem sprawdź wyświetlane nazwiska i adresy.

!!! info "Osoby przypisane do organizacji"
    W organizacji wybierz **Employee** lub **Team**, aby przypisać pracę w bieżącej organizacji. Te typy wykonawców są niedostępne w Personal.

## Wymagaj od wszystkich lub dowolnego wykonawcy {#require-everyone-or-any-assignee}

Włącz **All assignees must complete**, aby wymagać pomyślnej odpowiedzi od każdego wykonawcy. Gdy ta opcja jest wyłączona, jedna pomyślna odpowiedź kończy krok i pomija inne oczekujące zadania. Przełącznik pojawia się, gdy krok ma kilku przypisanych lub przypisanie zespołowe.

Odmowna decyzja wstrzymuje żądanie z niepowodzeniem, nawet jeśli **All assignees must complete** jest wyłączone. Ta opcja nie pozwala innym osobom na zmianę odrzucenia.

Na przykład użyj jednego kroku dla dwóch recenzentów, którzy muszą działać oboje, po czym nastąpi oddzielny krok podpisywania. Użyj opcji „każdy wykonawca”, jeśli jeden dostępny uczestnik może podjąć wymaganą decyzję.

## Dodatkowe wymagania {#additional-requirements}

Sekcje **Additional requirements** i **Visibility** pozostają widoczne na każdym kroku podczas tworzenia lub sprawdzania wniosku lub edytowania szablonu. Przejrzyj ich ustawienia przed zapisaniem lub przesłaniem.

Włącz wymagania, które musi spełniać uczestnik:

- **Require a comment**, aby zebrać wyjaśnienia.
- **Require an electronic signature**, aby zebrać szczegóły podpisu i narysowany podpis.
- **Require an attachment**, aby pobrać plik odpowiedzi.

Etykieta działania i wymaganie dotyczące podpisu elektronicznego to osobne ustawienia. Włącz wymaganie podpisu, gdy potrzebny jest narysowany podpis. Przejrzyj wymagania wraz z wybranym działaniem, aby uczestnicy wiedzieli, co zapewnić. Zobacz [Ukończ zadanie](complete-a-task.md).

## Widoczność kroku {#step-visibility}

Zleceniodawca i bezpośrednie osoby przypisane do kroku, łącznie z osobami przypisanymi przez e-mail, zawsze mogą zobaczyć ten krok. **Visibility** kontroluje, kto jeszcze może zobaczyć jego szczegóły i załączniki odpowiedzi:

| Ustawienie | Dodatkowi odbiorcy |
| --- | --- |
| All participants | Uczestnicy mający dostęp do wniosku |
| Assignees and organization participants | Uczestnicy organizacji; dostępne dla przepływów pracy organizacji |
| Assignees only | Brak dodatkowych uczestników |

Przypisania e-maili pozostają w obszarze roboczym Personal odbiorcy, nawet jeśli jego e-mail należy do pracownika organizacji. Przypisane kroki pozostają widoczne w przepływie pracy, dostępne na czacie krokowym i uwzględnione na potwierdzeniu odbiorcy.

Te ustawienia nie zapewniają członkostwa w obszarze roboczym ani dostępu do niepowiązanych żądań. Wybierz ograniczone ustawienie, jeśli inni uczestnicy nie potrzebują szczegółów kroku.

## Wersje {#revisions}

Po [ponownym przesłaniu żądania](track-requests.md) przejrzyj i edytuj kroki dotyczące nowej wersji. Przepływ pracy rozpoczyna się od pierwszego kroku; poprzednie decyzje pozostają zapisane w poprzedniej rewizji i jej potwierdzeniach. W przypadku często używanych procesów organizacji zapisz kroki jako [szablon](templates.md).
