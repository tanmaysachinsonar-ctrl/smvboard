import React from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';

export default function ImprintPage() {
  return (
    <Layout>
      <Head>
        <title>Impressum - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Impressum</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Angaben gemäß § 5 TMG</h2>
            <p className="text-gray-300">
              [Ihr Name / Ihre Organisation]<br />
              [Ihre Straße und Hausnummer]<br />
              [PLZ] [Ort]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Kontakt</h2>
            <p className="text-gray-300">
              Telefon: [Ihre Telefonnummer]<br />
              E-Mail: [Ihre E-Mail-Adresse]<br />
              Website: https://smvboard.de
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Umsatzsteuer-ID</h2>
            <p className="text-gray-300">
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
              [Ihre USt-IdNr.]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Verantwortlich für den Inhalt</h2>
            <p className="text-gray-300">
              nach § 55 Abs. 2 RStV:<br />
              [Name der verantwortlichen Person]<br />
              [Adresse]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Haftungsausschluss</h2>
            
            <h3 className="text-xl font-semibold mb-2 mt-4">Haftung für Inhalte</h3>
            <p className="text-gray-300">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Haftung für Links</h3>
            <p className="text-gray-300">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">Urheberrecht</h3>
            <p className="text-gray-300">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Streitschlichtung</h2>
            <p className="text-gray-300">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              https://ec.europa.eu/consumers/odr<br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
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
