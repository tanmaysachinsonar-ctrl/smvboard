import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) throw new Error('Nicht authentifiziert');

      const response = await fetch('/api/v1/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Fehler beim Speichern');
      }

      setSuccess(true);
      setIsEditing(false);
      
      // Reload user data
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Profil - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mein Profil</h1>

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-6">
            Profil erfolgreich aktualisiert!
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-card rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Persönliche Informationen</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition text-sm"
              >
                Bearbeiten
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rolle</label>
                <div className="px-4 py-2 bg-gray-800 rounded-md text-gray-500">
                  {user.role === 'OWNER'
                    ? 'Eigentümer'
                    : user.role === 'MEMBER'
                      ? 'Mitglied'
                      : 'Zuschauer'}{' '}
                  (nicht änderbar)
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 py-2 bg-accent hover:bg-accentHover disabled:bg-gray-700 rounded-md transition"
                >
                  {saveLoading ? 'Speichert...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user.name || '', email: user.email || '' });
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : (
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
          )}
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
