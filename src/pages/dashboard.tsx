import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Willkommen bei SMVBoard</h1>
          <div className="space-x-4">
            <Link href="/login" className="px-6 py-3 bg-accent hover:bg-accentHover rounded-md transition inline-block">
              Anmelden
            </Link>
            <Link href="/signup" className="px-6 py-3 bg-card hover:bg-gray-800 rounded-md transition inline-block">
              Registrieren
            </Link>
          </div>
        </div>
      </div>
    );
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
          <Link href="/finances" className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition">
            <div className="text-4xl mb-2">💰</div>
            <h2 className="text-xl font-semibold">Finanzen</h2>
            <p className="text-gray-400 text-sm mt-1">Konten & Transaktionen verwalten</p>
          </Link>

          <Link href="/members" className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition">
            <div className="text-4xl mb-2">👥</div>
            <h2 className="text-xl font-semibold">Mitglieder</h2>
            <p className="text-gray-400 text-sm mt-1">SMV-Team organisieren</p>
          </Link>

          <Link href="/events" className="bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition">
            <div className="text-4xl mb-2">📅</div>
            <h2 className="text-xl font-semibold">Kalender</h2>
            <p className="text-gray-400 text-sm mt-1">Events planen & verwalten</p>
          </Link>

          <Link href="/subscription" className="bg-gradient-to-br from-accent to-purple-600 rounded-lg p-6 hover:ring-2 hover:ring-white transition">
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
