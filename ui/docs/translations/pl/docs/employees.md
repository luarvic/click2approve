---
title: Zarządzanie pracownikami i rolami w przestrzeni roboczej
description: Dodaj pracowników do organizacji Click2Approve i zarządzaj ich rolami i dostępem. Porównaj uprawnienia użytkownika, administratora i właściciela dla przepływów pracy zatwierdzania.
---
# Zarządzanie pracownikami i rolami w przestrzeni roboczej {#employees-and-roles}

Pracownicy łączą konta użytkowników z organizacją i dostarczają tożsamości używane do przypisań i zapisów audytu.

!!! info "Tylko organizacja"
    Wybierz organizację, aby wyświetlić jej pracowników. Właściciele i administratorzy mogą dodawać pracowników i zarządzać ich dostępem.

## Dodaj pracownika {#add-an-employee}

Właściciele i administratorzy mogą otworzyć **Employees**, założyć nowego pracownika i wprowadzić jego adres e-mail, imię i nazwisko, stanowisko, rolę i zespoły. Zapisz pracownika, a następnie sprawdź jego status.

E-mail identyfikuje konto, które powinno otrzymać dostęp pracownika. Sprawdź to przed zapisaniem. Nazwa organizacji i stanowisko pracownika mogą różnić się od jego profilu osobistego.

Pracownik, którego adres e-mail nie został jeszcze zarejestrowany, zaczyna od **Pending**. Rejestracja przy użyciu tego adresu e-mail aktywuje członkostwo. Dodanie już zarejestrowanego konta powoduje utworzenie pracownika **Active**.

## Role {#roles}

| Rola | Uprawnienia organizacji |
| --- | --- |
| User (member) | Weź udział w autoryzowanych przepływach pracy, przeglądaj katalogi pracowników, zespołów i delegacji oraz zarządzaj własnymi szablonami |
| Admin | Zarządzaj pracownikami, zespołami, delegacjami, rozliczeniami i przechowywaniem |
| Owner | Zarządzanie administracyjne plus uprawnienia do planowania usunięcia organizacji |

Role nie zapewniają dostępu innym organizacjom. Widoczność żądań i zadań uwzględnia także uczestnictwo, relacje w zespole i delegowanie. Szablony są domyślnie prywatne i można je udostępniać innym członkom organizacji do przeglądania i używania. Tylko twórca szablonu może go edytować lub usunąć, także wtedy, gdy inny członek jest właścicielem lub administratorem.

Dostęp do potwierdzenia następuje po jego własności, niezależnie od roli pracownika. Właściciele i administratorzy mogą przeglądać, udostępniać i usuwać tylko potwierdzenia wystawione dla siebie. Zobacz [Potwierdzenia i weryfikacja](receipts.md).

## Status pracownika {#employee-status}

| Status | Znaczenie |
| --- | --- |
| Pending | Członkostwo nie stało się jeszcze aktywne |
| Active | Dostęp pracownika jest aktywny |
| Disabled | Dostęp pracowników został wyłączony |

Właściciele i administratorzy mogą edytować dane dozwolonych pracowników, członkostwo w zespole i ustawienie **Active**. Wyłączenie dostępu jest przydatne, gdy dana osoba nie powinna już działać w organizacji.

## Usuń pracownika {#remove-an-employee}

Dostępnej akcji usuwania używaj tylko wtedy, gdy pracownik powinien zostać usunięty. Istniejące odniesienia mogą uniemożliwić usunięcie; przeczytaj wiadomość weryfikacyjną i najpierw rozwiąż odpowiednią relację. Wyłączenie dostępu może być wskazane, gdy muszą pozostać relacje historyczne.

Przed zmianą członkostwa przejrzyj [zespoły](teams.md) i [delegacje](delegations.md), które zależą od tego pracownika.
