import React from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';

export default function PrivacyPage() {
  return (
    <Layout>
      <Head>
        <title>Datenschutzerklärung - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Verantwortlicher</h2>
            <p className="text-gray-300">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
              [Ihr Name/Ihre Organisation]<br />
              [Ihre Adresse]<br />
              E-Mail: [Ihre E-Mail]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p className="text-gray-300">
              Wir erheben und verarbeiten folgende Daten:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Name und E-Mail-Adresse (bei Registrierung)</li>
              <li>Organisationsdaten (Schul-/SMV-Name)</li>
              <li>Finanzdaten (Konten, Transaktionen)</li>
              <li>Mitgliederdaten (Namen, Kontaktdaten)</li>
              <li>Nutzungsdaten (Logs, Zugriffszeiten)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Zweck der Datenverarbeitung</h2>
            <p className="text-gray-300">
              Die Verarbeitung erfolgt zur:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Bereitstellung und Verbesserung unserer Dienste</li>
              <li>Abwicklung von Zahlungen (über Stripe)</li>
              <li>Kommunikation mit Nutzern</li>
              <li>Erfüllung gesetzlicher Pflichten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Rechtsgrundlage</h2>
            <p className="text-gray-300">
              Die Verarbeitung erfolgt auf Grundlage von:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, soweit eingeholt)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Weitergabe von Daten</h2>
            <p className="text-gray-300">
              Wir geben Ihre Daten an folgende Drittanbieter weiter:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Supabase (PostgreSQL):</strong> Datenbankhosting</li>
              <li><strong>Stripe:</strong> Zahlungsabwicklung</li>
              <li><strong>Vercel:</strong> Hosting (optional)</li>
            </ul>
            <p className="text-gray-300 mt-2">
              Diese Anbieter verarbeiten Daten in unserem Auftrag und sind vertraglich zur Einhaltung
              der DSGVO verpflichtet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Speicherdauer</h2>
            <p className="text-gray-300">
              Wir speichern Ihre Daten so lange, wie sie für die Zwecke erforderlich sind oder
              gesetzliche Aufbewahrungspflichten bestehen (z.B. 10 Jahre für Finanzdaten).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Ihre Rechte</h2>
            <p className="text-gray-300">
              Sie haben folgende Rechte:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p className="text-gray-300 mt-2">
              Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter [Ihre E-Mail].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Beschwerderecht</h2>
            <p className="text-gray-300">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Cookies</h2>
            <p className="text-gray-300">
              Wir verwenden technisch notwendige Cookies für die Authentifizierung. Diese sind
              erforderlich für den Betrieb der Plattform.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Stand: {new Date().toLocaleDateString('de-DE')}<br />
              SMVBoard - Verwaltungssoftware für Schülermitverwaltungen
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
