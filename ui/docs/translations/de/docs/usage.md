---
title: Nutzung des Genehmigungsworkflows, Token und Speicherbeschränkungen
description: Sehen Sie, welche Click2Approve-Aktionen Token verwenden, wie der Dateispeicher gemessen wird und was bei einem Limit passiert. Verwenden Sie ein Beispiel, um die Nutzung eines Dokumenten-Workflows abzuschätzen.
---
# Nutzung und Token {#usage-and-tokens}

Wählen Sie einen Arbeitsbereich aus und öffnen Sie **Usage**, um dessen Token-Guthaben, den Abrechnungszeitraum und den insgesamt belegten Speicher anzuzeigen. Die Tabelle unter den Kacheln listet jede Aktion und ihre **Tokens used** auf, einschließlich Null-Token-Einträgen. Die Aktionen werden nach den verwendeten Token geordnet, wobei der höchste Wert zuerst gilt und bei gleichen Beträgen alphabetisch geordnet wird. Beim Sortieren werden genaue Beträge verwendet, bevor die Anzeige gerundet wird. Die Token- und Speicherkacheln zeigen verbrauchte und verfügbare Mengen mit einer Quotenleiste an. Angezeigte Token-Beträge werden auf ganze Token abgerundet; Buchhaltungs- und Quotenbalken behalten die Bruchgenauigkeit bei.

## Monatliches Token-Kontingent {#monthly-allowance}

Jeder Tarif enthält Tokens. Bei Personal Free erneuern sie sich monatlich ab Beginn der ersten Laufzeit. Bei kostenpflichtigen Tarifen werden sie für jeden bestätigten, bezahlten Abrechnungszeitraum bereitgestellt. Business Trial erhält einmalig ein Kontingent für den Probemonat. Unverbrauchte Tokens verfallen; sie werden weder in den nächsten Zeitraum noch in andere Arbeitsbereiche übertragen.

| Planen | Monatlicher Preis (USD, ohne Steuern) | Enthaltene Token | Speicher |
| --- | --- | --- | --- |
| Personal Free | $0 | 1.000 pro Monat | 1 GB |
| Personal Pro | 20 $ | 50.000 pro Monat | 10 GB |
| Business Trial | 0 $ für nur einen Monat | 10.000 einmalig | 1 GB |
| Business Pro | 100 $ | 300.000 pro Monat | 100 GB |

## Was verwendet Token {#what-uses-tokens}

Token-Raten sind:

| Action | Token |
| --- | --- |
| Hochladen | 1 pro MB |
| Datei ansehen oder herunterladen | 2 pro MB |
| Workflow-E-Mail | 5 pro Empfänger |
| Eine Anfrage senden oder erneut senden | 10 |
| Erstellen Sie eine Aufgabe | 2 pro Aufgabe |

Das Lesen von Anforderungs- und Aufgabendetails oder -listen, das Erledigen von Aufgaben und das Abbrechen von Anforderungen werden nicht gemessen und verbrauchen keine Token. Für Übermittlung und erneute Übermittlung wird dieselbe Rate verwendet.

Übertragungen verwenden dezimale MB (1.000.000 Bytes). Kleine Dateien verbrauchen gebrochene Token, anstatt jede Datei auf ein MB aufzurunden. Dateivorschauen übertragen auch Daten. Das Anzeigen einer bereits von Ihrem Browser zwischengespeicherten Kopie führt nicht zu einer weiteren Serverübertragung. Erfolgreiche Dateiübertragungen werden für Dokumentbytes berechnet, ohne dass der Aufwand für die Daten-URL-Codierung anfällt.

Anfragen und Aufgaben werden dem ursprünglichen Workflow-Arbeitsbereich belastet, auch wenn ein Genehmiger einen persönlichen Posteingang verwendet. Uploads von Aufgaben- und Diskussionsseiten gehören zum Arbeitsbereich der Anfrage, der für Upload, Speicherung und Downloads aufkommt. Beim Vorbereiten einer neuen Anfrage vorgenommene Uploads gehören zum ausgewählten Arbeitsbereich. Kontobestätigung, Passwortzurücksetzungen, Sicherheitshinweise, Rechnungs-E-Mails und öffentliche Branding-Assets verbrauchen keine Workspace-Tokens.

## Beispiel-Workflow {#example-workflow}

Ein Workflow mit 10 MB hochgeladen, 10 MB angezeigt oder heruntergeladen, fünf Workflow-E-Mail-Empfängerzustellungen, einer übermittelten Anfrage und fünf erstellten Aufgaben verwendet **75 Token**:

| Aktivität | Berechnung | Tokens used |
| --- | --- | --- |
| 10 MB hochladen | 10 × 1 | 10 |
| 10 MB ansehen oder herunterladen | 10 × 2 | 20 |
| Versenden Sie fünf Workflow-E-Mails an jeweils einen Empfänger | 5 × 5 | 25 |
| Senden Sie eine Anfrage | 1 × 10 | 10 |
| Fünf Aufgaben erstellen | 5 × 2 | 10 |
| **Total**| |**75** |

Das Abschließen dieser Aufgaben selbst verbraucht keine Token. Weitere Dateiübertragungen, E-Mails, erneute Übermittlungen oder durch spätere Workflow-Schritte erstellte Aufgaben werden zu den oben genannten Sätzen separat berechnet.

## Gebührenerhebung und unzureichende Tokens {#charging-and-insufficient-tokens}

Uploads, Downloads und Workflow-E-Mails prüfen vor Beginn die verfügbaren Tokens und berechnen abgeschlossene Arbeiten direkt. Für fehlgeschlagene Uploads und nicht gesendete E-Mails fallen keine Gebühren an. Unterbrochene Downloads werden für die übertragenen Dokumentbytes berechnet. Durch das Anhängen oder Löschen einer hochgeladenen Datei wird die Upload-Gebühr nicht erstattet.

Gleichzeitige Aktionen können dazu führen, dass der Kontostand unter Null sinkt; Weitere kostenpflichtige Aktionen werden blockiert, bis Token verfügbar sind.

Burst- und Parallelitätsbeschränkungen schützen den Dienst ebenfalls. Eine vorübergehend geschwindigkeitsbeschränkte Aktion kann später wiederholt werden.

Wenn die Token nicht ausreichen, werden neue kostenpflichtige Aktionen blockiert. Vorhandene Anforderungs- und Aufgabendatensätze bleiben zugänglich; Für die Dateianzeige sind weiterhin Token erforderlich. Durch das Abschließen einer Aufgabe können Aufgaben für den nächsten Schritt erstellt werden, für den Token in der Geschwindigkeit der Aufgabenerstellung erforderlich sind. Öffnen Sie **Plans**, um Ihren Zuschuss zu überprüfen. Durch das Löschen eines Datensatzes werden bereits verbrauchte Token nicht erstattet.

## Speicher ist ein separates Limit {#storage-is-a-separate-limit}

Speicher misst, dass Dateien derzeit Speicherplatz belegen, einschließlich geplanter Dateien, die auf die Bereinigung warten. Es handelt sich nicht um jeden Monat ein neues Upload-Kontingent. Das Aufbewahren einer Datei verbraucht keine zusätzlichen Token, wird aber auf die Speicherkapazität Ihres Plans angerechnet, bis sie entfernt wird.

Wählen Sie [Aufbewahrung](retention.md), ungefähr wie lange Sie Datensätze benötigen. Bei einer geplanten Planänderung bleibt der aktuell bezahlte Anspruch erhalten, bis er wirksam wird. Ein kostenpflichtiges Upgrade wird nach bestätigter Zahlung aktiviert; Es werden keine Token gewährt, nur weil der Checkout geöffnet wurde.
