# 🌹 Rosenaktion - Benutzerhandbuch

## Übersicht

Die **Rosenaktion** ist ein schulübergreifendes Bestellsystem, das es Schülern ermöglicht, Rosen für Mitschüler zu bestellen – unabhängig davon, an welcher Schule im Verbund der Empfänger ist. Das System optimiert die Logistik durch intelligente Aggregation: Jede Schule verteilt nur die Rosen, die ihre eigenen Schüler empfangen.

### Hauptfunktionen

- **Rosen bestellen**: Schüler können Rosen für Empfänger an beliebigen Schulen im Verbund bestellen
- **Kampagnen-System**: Zeitlich begrenzte Aktionen (z.B. Valentinstag)
- **Verteilungslisten**: Automatisch aggregierte Listen pro Schule
- **CSV-Export**: Verteilungslisten zum Ausdrucken oder Weiterverarbeiten
- **Anonyme Bestellungen**: Optional kann der Absender anonym bleiben

---

## Für Schüler

### Wie bestelle ich eine Rose?

1. **Anmelden**: Melde dich mit deinem Account an
2. **Zur Rosenaktion navigieren**: 
   - Dashboard → "Rosenaktion" Card
   - Oder: Navigation → "Rosenaktion" 🌹
3. **Bestellung aufgeben**:
   - Klicke auf "+ Rose bestellen"
   - **Ziel-Schule**: Wähle die Schule des Empfängers
   - **Empfänger Name**: Gib den vollständigen Namen ein (z.B. "Max Mustermann")
   - **Klasse** (optional): Hilft bei der Identifikation (z.B. "10a")
   - **Anzahl**: Wie viele Rosen? (1-10 pro Bestellung)
   - **Nachricht** (optional): Persönliche Nachricht (max. 200 Zeichen)
   - **Anonym**: Häkchen setzen, wenn dein Name nicht angezeigt werden soll
4. **Absenden**: Klicke auf "Bestellen"

### Meine Bestellungen ansehen

Auf der Hauptseite der Rosenaktion siehst du eine Tabelle mit all deinen Bestellungen:

- **Empfänger**: Für wen hast du bestellt?
- **Schule**: An welcher Schule?
- **Anzahl**: Wie viele Rosen?
- **Nachricht**: Deine persönliche Nachricht
- **Datum**: Wann hast du bestellt?

### Häufige Fragen (Schüler)

**Kann ich mehrere Rosen für dieselbe Person bestellen?**  
Ja! Du kannst mehrere separate Bestellungen aufgeben oder bis zu 10 Rosen in einer Bestellung.

**Kann ich eine Bestellung ändern oder stornieren?**  
Aktuell nicht direkt in der App. Wende dich an deine SMV-Admins.

**Wann wird die Rose übergeben?**  
Die Rosen werden am Ende der Kampagne (z.B. am Valentinstag) übergeben. Das genaue Datum siehst du in der Kampagnen-Info.

**Ist meine Bestellung wirklich anonym?**  
Ja, wenn du das Häkchen "Anonyme Bestellung" gesetzt hast. Die SMV-Admins sehen beim Verteilen nicht, wer die Rose bestellt hat.

**Was kostet eine Rose?**  
Der Preis wird in der Kampagne angezeigt (z.B. 1,50 € pro Rose). Die Zahlung erfolgt üblicherweise in der Schule bei der SMV.

---

## Für SMV-Admins

### Verteilungsliste ansehen

1. **Navigation**: Rosenaktion → "Verteilung ansehen"
2. **Schule auswählen**: Wähle im Dropdown die Schule aus
3. **Liste prüfen**: 
   - Siehst du alle Empfänger mit aggregierter Rosenanzahl
   - Beispiel: "Max Müller, 10a → 7x 🌹" (auch wenn 3 separate Bestellungen)

### Verteilungsliste exportieren

#### CSV-Export
- Klicke auf "CSV Export"
- Datei wird heruntergeladen (UTF-8 mit BOM für Excel)
- Enthält: Name, Klasse, Anzahl Rosen, Anzahl Bestellungen

#### Drucken
- Klicke auf "Drucken"
- Browser-Druckdialog öffnet sich
- Layout ist für Papier optimiert (ohne Farben/Navigation)

### Statistiken verstehen

Die Verteilungsseite zeigt folgende Kennzahlen:

- **Gesamt Rosen**: Summe aller Rosen für diese Schule
- **Empfänger**: Anzahl einzigartiger Personen
- **Bestellungen**: Anzahl separater Bestellungen
- **Ø Pro Empfänger**: Durchschnittliche Rosen pro Person

### Suchfunktion nutzen

- Gib einen Namen oder eine Klasse ins Suchfeld ein
- Die Tabelle wird live gefiltert
- Beispiel: "10a" zeigt nur Empfänger aus der Klasse 10a

### Zugriffskontrolle

- **MEMBER**: Können nur die Verteilung ihrer eigenen Schule sehen
- **OWNER**: Können alle Schulen im Verbund sehen und zwischen ihnen wechseln

### Häufige Fragen (Admins)

**Warum sehe ich weniger Bestellungen als erwartet?**  
Die Liste ist **aggregiert**: Wenn Max 3 separate Bestellungen erhalten hat (2, 3 und 1 Rose), siehst du nur eine Zeile mit "6x 🌹".

**Wie organisiere ich die Verteilung?**  
1. Liste ausdrucken oder exportieren
2. Rosen vorbereiten (z.B. mit Namenskärtchen)
3. Nach Klassen sortieren (falls angegeben)
4. In der Pause/nach Unterricht verteilen

**Was mache ich mit Empfängern ohne Klasse?**  
Versuche die Person über den Namen zu identifizieren. Optional: Durchsage in der Schule.

**Kann ich die Verteilung nach Kampagne filtern?**  
Ja, die API unterstützt `campaignId` als Parameter. In der UI wird aktuell automatisch die aktive Kampagne genutzt.

---

## Logistik-Konzept

### Das Problem

Wenn Schule A eine Rose für einen Schüler an Schule B bestellt, wer kauft und liefert die Rose?

### Die Lösung

**Empfänger-Schule verteilt**: Jede Schule kauft nur die Rosen, die ihre eigenen Schüler empfangen – egal von welcher Schule bestellt.

#### Beispiel

**Bestellungen**:
- Schule A bestellt: 10 Rosen → Max (Schule B)
- Schule B bestellt: 5 Rosen → Max (Schule B)
- Schule C bestellt: 3 Rosen → Max (Schule B)

**Verteilung**:
- Schule B gibt Max: **18 Rosen** (kein Transport zwischen Schulen nötig)

### Vorteile

- ✅ Kein schulübergreifender Transport
- ✅ Jede Schule arbeitet eigenständig
- ✅ Zentrale Bestellübersicht
- ✅ Automatische Aggregation

---

## Kampagnen-System

### Was ist eine Kampagne?

Eine Kampagne ist ein zeitlich begrenzter Aktionszeitraum (z.B. "Valentinstag 2026").

### Kampagnen-Status

- **PLANNED**: Geplant, aber noch nicht gestartet
- **OPEN**: Aktiv, Bestellungen möglich
- **CLOSED**: Beendet, keine neuen Bestellungen
- **ARCHIVED**: Archiviert

### Aktive Kampagne

Auf der Hauptseite wird die aktuelle Kampagne angezeigt mit:
- Name (z.B. "Valentinstag 2026")
- Beschreibung
- Start- und Enddatum
- Preis pro Rose

---

## Technische Hinweise

### Multi-School-Architektur

Das System nutzt ein **Schulverbund-Modell**:
- Eine **Organization** = ein Schulverbund (z.B. "Stadt München SMVs")
- Mehrere **Schools** innerhalb der Organization
- Jeder **User** ist einer School zugeordnet
- **RoseOrders** verbinden Sender-School und Recipient-School

### Datenbank-Modelle

#### School
```prisma
model School {
  id          String
  orgId       String
  name        String
  accessCode  String  // z.B. "GYMN_2026"
  description String?
  users       User[]
  sentOrders  RoseOrder[]
  receivedOrders RoseOrder[]
}
```

#### RoseOrder
```prisma
model RoseOrder {
  id                String
  senderSchoolId    String
  recipientSchoolId String
  recipientName     String
  recipientClass    String?
  roseCount         Int
  senderNote        String?
  isAnonymous       Boolean
  campaignId        String?
  createdById       String
}
```

### API-Endpunkte

| Endpunkt | Methode | Beschreibung | Zugriff |
|----------|---------|--------------|---------|
| `/api/v1/roses/schools` | GET | Liste aller Schulen | Authenticated |
| `/api/v1/roses/campaigns` | GET | Liste aller Kampagnen | Authenticated |
| `/api/v1/roses/order` | POST | Neue Bestellung erstellen | MEMBER+ |
| `/api/v1/roses/my-orders` | GET | Eigene Bestellungen | Authenticated |
| `/api/v1/roses/distribution` | GET | Verteilungsliste | MEMBER+ |

### Aggregations-Algorithmus

Die Verteilungsliste wird nach **recipientName + recipientClass** aggregiert:

```typescript
// Beispiel: 3 Orders für "Max Müller, 10a"
const orders = [
  { recipientName: "Max Müller", recipientClass: "10a", roseCount: 2 },
  { recipientName: "Max Müller", recipientClass: "10a", roseCount: 3 },
  { recipientName: "Max Müller", recipientClass: "10a", roseCount: 1 },
];

// Aggregiert zu:
{
  recipientName: "Max Müller",
  recipientClass: "10a",
  totalRoses: 6,
  orderCount: 3
}
```

---

## Support & Feedback

Bei Fragen oder Problemen wende dich an:
- Deine SMV-Admins (OWNER-Rolle)
- Technischer Support: [support@smvboard.de](mailto:support@smvboard.de)

---

**Version**: 1.1.0  
**Letzte Aktualisierung**: Februar 2026
