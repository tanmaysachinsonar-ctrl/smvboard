import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Einstellungen - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

        {/* Benachrichtigungen */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Benachrichtigungen</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">E-Mail-Benachrichtigungen</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-accent rounded" />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Event-Erinnerungen</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-accent rounded" />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Finanz-Updates</span>
              <input type="checkbox" className="w-5 h-5 text-accent rounded" />
            </label>
          </div>
        </div>

        {/* Sprache & Region */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sprache & Region</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sprache</label>
              <select className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md">
                <option>Deutsch</option>
                <option>English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Zeitzone</label>
              <select className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md">
                <option>Europe/Berlin</option>
                <option>Europe/Vienna</option>
                <option>Europe/Zurich</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privatsphäre */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Privatsphäre & Sicherheit</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Profil für andere sichtbar</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-accent rounded" />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Zwei-Faktor-Authentifizierung</span>
              <input type="checkbox" className="w-5 h-5 text-accent rounded" />
            </label>

            <div>
              <button className="text-accent hover:underline text-sm">
                Datenschutzrichtlinien anzeigen →
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-red-900/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-400">Gefahrenzone</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account löschen</p>
                <p className="text-sm text-gray-400">Alle Daten werden permanent gelöscht</p>
              </div>
              <button className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md transition">
                Account löschen
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="px-6 py-2 bg-accent hover:bg-accentHover rounded-md transition">
            Änderungen speichern
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </Layout>
  );
}
