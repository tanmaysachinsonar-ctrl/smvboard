import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>SMVBoard - Verwaltungssoftware für Schülermitverwaltungen</title>
        <meta name="description" content="Professionelle Verwaltungssoftware für SMV - Finanzen, Mitglieder, Events" />
      </Head>

      <div className="min-h-screen bg-smvbg text-white">
        {/* Hero Section */}
        <header className="container mx-auto px-4 py-20">
          <nav className="flex justify-between items-center mb-20">
            <div className="text-2xl font-bold">SMVBoard</div>
            <div className="space-x-4">
              <Link href="/login" className="px-4 py-2 rounded-md hover:bg-card transition">
                Anmelden
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition">
                Kostenlos starten
              </Link>
            </div>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Verwaltungssoftware für deine SMV
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Finanzen verwalten, Mitglieder organisieren, Events planen - alles an einem Ort.
              Speziell entwickelt für Schülermitverwaltungen.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup" className="px-8 py-3 bg-accent hover:bg-accentHover rounded-md text-lg font-medium transition">
                Jetzt kostenlos starten
              </Link>
              <Link href="/login" className="px-8 py-3 bg-card hover:bg-gray-800 rounded-md text-lg font-medium transition">
                Demo ansehen
              </Link>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Alles was deine SMV braucht</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Finanzverwaltung</h3>
                <p className="text-gray-400">
                  Konten, Transaktionen und Budgets zentral verwalten. Immer den Überblick behalten.
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">Mitgliederverwaltung</h3>
                <p className="text-gray-400">
                  Alle SMV-Mitglieder mit Rollen, Kontaktdaten und Positionen organisieren.
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">Event-Kalender</h3>
                <p className="text-gray-400">
                  Events planen, Teilnehmer verwalten und alle Termine im Blick haben.
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Reports & Analytics</h3>
                <p className="text-gray-400">
                  Übersichtliche Dashboards und Berichte für bessere Entscheidungen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Bereit loszulegen?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Starte jetzt kostenlos und bringe deine SMV auf das nächste Level.
            </p>
            <Link href="/signup" className="inline-block px-8 py-3 bg-accent hover:bg-accentHover rounded-md text-lg font-medium transition">
              Kostenlos registrieren
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-gray-800 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2026 SMVBoard. Alle Rechte vorbehalten.
              </p>
              <div className="flex gap-6">
                <Link href="/legal/terms" className="text-gray-400 hover:text-white">AGB</Link>
                <Link href="/legal/privacy" className="text-gray-400 hover:text-white">Datenschutz</Link>
                <Link href="/legal/imprint" className="text-gray-400 hover:text-white">Impressum</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
