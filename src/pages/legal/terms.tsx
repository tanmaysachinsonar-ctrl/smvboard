import React from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <Layout>
      <Head>
        <title>Allgemeine Geschäftsbedingungen - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Geltungsbereich</h2>
            <p className="text-gray-300">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der SMVBoard-Plattform,
              einer Verwaltungssoftware für Schülermitverwaltungen (SMV). Mit der Registrierung und Nutzung
              unserer Dienste erklären Sie sich mit diesen Bedingungen einverstanden.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Vertragsschluss</h2>
            <p className="text-gray-300">
              Der Vertrag kommt mit der erfolgreichen Registrierung auf der SMVBoard-Plattform zustande.
              Sie erhalten eine Bestätigungs-E-Mail mit Ihren Zugangsdaten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Leistungsumfang</h2>
            <p className="text-gray-300">
              SMVBoard bietet folgende Funktionen:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Finanzverwaltung (Konten, Transaktionen, Budgets)</li>
              <li>Mitgliederverwaltung</li>
              <li>Kalender und Event-Management</li>
              <li>Subscription-Verwaltung</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Nutzerpflichten</h2>
            <p className="text-gray-300">
              Sie verpflichten sich, die Plattform nur für rechtmäßige Zwecke zu nutzen und keine
              unbefugten Zugriffe zu versuchen. Die Weitergabe von Zugangsdaten an Dritte ist untersagt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Preise und Zahlung</h2>
            <p className="text-gray-300">
              Die aktuellen Preise finden Sie auf unserer Pricing-Seite. Zahlungen erfolgen über Stripe.
              Bei Zahlungsverzug behalten wir uns vor, den Zugang zu sperren.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Kündigung</h2>
            <p className="text-gray-300">
              Sie können Ihr Abonnement jederzeit über das Billing-Portal kündigen. Die Kündigung wird
              zum Ende des laufenden Abrechnungszeitraums wirksam.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Haftung</h2>
            <p className="text-gray-300">
              Wir haften nur für Schäden, die auf Vorsatz oder grober Fahrlässigkeit beruhen.
              Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit gesetzlich zulässig.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Datenschutz</h2>
            <p className="text-gray-300">
              Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie in unserer{' '}
              <Link href="/legal/privacy" className="text-accent hover:text-accentHover">
                Datenschutzerklärung
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Änderungen der AGB</h2>
            <p className="text-gray-300">
              Wir behalten uns vor, diese AGB zu ändern. Sie werden über Änderungen per E-Mail informiert.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Schlussbestimmungen</h2>
            <p className="text-gray-300">
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist [Ihr Standort].
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
