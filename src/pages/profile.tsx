import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ProfilePage() {
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
        <title>Profil - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mein Profil</h1>

        <div className="bg-card rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Persönliche Informationen</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <div className="px-4 py-2 bg-smvbg rounded-md">{user.name || 'Nicht angegeben'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-Mail</label>
              <div className="px-4 py-2 bg-smvbg rounded-md">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Rolle</label>
              <div className="px-4 py-2 bg-smvbg rounded-md">
                {user.role === 'OWNER'
                  ? 'Eigentümer'
                  : user.role === 'MEMBER'
                    ? 'Mitglied'
                    : 'Zuschauer'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Organisation</label>
              <div className="px-4 py-2 bg-smvbg rounded-md">{user.orgId}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition">
              Profil bearbeiten
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition">
              Passwort ändern
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account-Einstellungen</h2>
          <p className="text-gray-400 mb-4">
            Verwalten Sie Ihre Account-Einstellungen, Benachrichtigungen und Sicherheitsoptionen.
          </p>
          <button
            onClick={() => router.push('/settings')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
          >
            Zu Einstellungen →
          </button>
        </div>
      </div>
    </Layout>
  );
}
