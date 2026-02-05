import React, { useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated (after loading)
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Lädt...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - SMVBoard</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Willkommen, {user.name || user.email}!</h1>
          <p className="text-gray-400 mt-1">Hier ist eine Übersicht deiner SMV-Verwaltung</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/finances"
            className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition"
          >
            <div className="text-4xl mb-2">💰</div>
            <h2 className="text-xl font-semibold">Finanzen</h2>
            <p className="text-gray-400 text-sm mt-1">Konten & Transaktionen verwalten</p>
          </Link>

          <Link
            href="/members"
            className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition"
          >
            <div className="text-4xl mb-2">👥</div>
            <h2 className="text-xl font-semibold">Mitglieder</h2>
            <p className="text-gray-400 text-sm mt-1">SMV-Team organisieren</p>
          </Link>

          <Link
            href="/events"
            className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition"
          >
            <div className="text-4xl mb-2">📅</div>
            <h2 className="text-xl font-semibold">Kalender</h2>
            <p className="text-gray-400 text-sm mt-1">Events planen & verwalten</p>
          </Link>

          <Link
            href="/roses"
            className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition"
          >
            <div className="text-4xl mb-2">🌹</div>
            <h2 className="text-xl font-semibold">Rosenaktion</h2>
            <p className="text-gray-400 text-sm mt-1">Rosen bestellen & verteilen</p>
          </Link>

          <Link
            href="/subscription"
            className="bg-gradient-to-br from-accent to-purple-600 rounded-lg p-6 hover:ring-2 hover:ring-white transition"
          >
            <div className="text-4xl mb-2">⭐</div>
            <h2 className="text-xl font-semibold">Premium</h2>
            <p className="text-white/80 text-sm mt-1">Erweiterte Features freischalten</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Neueste Aktivitäten</h2>
          <div className="space-y-3 text-sm text-gray-400">
            <p>🔹 Willkommen bei SMVBoard! Beginne mit dem Einrichten deiner Organisation.</p>
            <p>🔹 Füge Mitglieder hinzu und erstelle dein erstes Konto.</p>
            <p>🔹 Plane Events und verwalte deine SMV-Finanzen zentral.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
