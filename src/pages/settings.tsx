import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  eventReminders: boolean;
  financeUpdates: boolean;
  language: string;
  timezone: string;
  profileVisibility: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  role: string;
  schoolId: string | null;
  school?: {
    id: string;
    name: string;
    accessCode: string;
  } | null;
  org: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load settings on mount
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          throw new Error('Keine Authentifizierung');
        }

        const response = await fetch('/api/v1/settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Einstellungen');
        }

        const data = await response.json();
        setSettings(data);
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setError(err.message || 'Fehler beim Laden');
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Keine Authentifizierung');
      }

      const response = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          eventReminders: settings.eventReminders,
          financeUpdates: settings.financeUpdates,
          language: settings.language,
          timezone: settings.timezone,
          profileVisibility: settings.profileVisibility,
          twoFactorEnabled: settings.twoFactorEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Einstellungen');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSuccessMessage('Einstellungen erfolgreich gespeichert');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (loadingSettings) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Einstellungen...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Einstellungen - SMVBoard</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
            ✓ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            ✗ {error}
          </div>
        )}

        {/* Benachrichtigungen */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Benachrichtigungen</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">E-Mail-Benachrichtigungen</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                className="w-5 h-5 text-accent rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Event-Erinnerungen</span>
              <input
                type="checkbox"
                checked={settings.eventReminders}
                onChange={(e) => updateSetting('eventReminders', e.target.checked)}
                className="w-5 h-5 text-accent rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Finanz-Updates</span>
              <input
                type="checkbox"
                checked={settings.financeUpdates}
                onChange={(e) => updateSetting('financeUpdates', e.target.checked)}
                className="w-5 h-5 text-accent rounded"
              />
            </label>
          </div>
        </div>

        {/* Sprache & Region */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sprache & Region</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sprache</label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Zeitzone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
              >
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Europe/Vienna">Europe/Vienna</option>
                <option value="Europe/Zurich">Europe/Zurich</option>
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
              <input
                type="checkbox"
                checked={settings.profileVisibility}
                onChange={(e) => updateSetting('profileVisibility', e.target.checked)}
                className="w-5 h-5 text-accent rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-gray-300">Zwei-Faktor-Authentifizierung</span>
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => updateSetting('twoFactorEnabled', e.target.checked)}
                className="w-5 h-5 text-accent rounded"
              />
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
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-accent hover:bg-accentHover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Wird gespeichert...
              </>
            ) : (
              'Änderungen speichern'
            )}
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
