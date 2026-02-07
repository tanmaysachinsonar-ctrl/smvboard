import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, name, orgName, schoolCode || undefined);
      // Show email confirmation message instead of redirecting
      setShowEmailConfirmation(true);
    } catch (err: any) {
      // Check if it's an email confirmation required error
      if (err.message?.includes('Email not confirmed')) {
        setShowEmailConfirmation(true);
      } else {
        setError(err.message || 'Registrierung fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registrierung - SMVBoard</title>
      </Head>
      <div className="min-h-screen bg-smvbg flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-4xl font-bold text-white">SMVBoard</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Erstelle dein Schülersprecher-Konto
            </p>
          </div>

          {showEmailConfirmation ? (
            // Email confirmation success message
            <div className="bg-card rounded-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Fast geschafft! 🎉</h3>
                <p className="text-gray-300 mb-4">
                  Wir haben dir eine{' '}
                  <span className="font-semibold text-accent">Bestätigungs-Email</span> an
                </p>
                <p className="text-white font-medium bg-smvbg px-4 py-2 rounded mb-6">{email}</p>
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-accent mb-2 flex items-center">
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Nächste Schritte:
                  </h4>
                  <ol className="text-sm text-gray-300 space-y-2 ml-7">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">1.</span>
                      Öffne dein Email-Postfach
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">2.</span>
                      Suche nach der Email von SMVBoard/Supabase
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">3.</span>
                      Klicke auf den Bestätigungs-Link
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">4.</span>
                      Danach kannst du dich sofort anmelden!
                    </li>
                  </ol>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  💡 Tipp: Schau auch im Spam-Ordner nach
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accentHover transition"
                >
                  Weiter zum Login
                </Link>
              </div>
            </div>
          ) : (
            // Original signup form
            <div className="bg-card rounded-lg p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Dein Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Max Mustermann"
                  />
                </div>

                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-gray-300">
                    Name deiner Schule/Organisation
                  </label>
                  <input
                    id="orgName"
                    name="orgName"
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Beispiel-Gymnasium"
                  />
                </div>

                <div>
                  <label htmlFor="schoolCode" className="block text-sm font-medium text-gray-300">
                    Schulcode <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="schoolCode"
                    name="schoolCode"
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    className="mt-1 block w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="SCHULE-2024"
                    maxLength={20}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Falls deine Schule bereits einen Code hat, gib ihn hier ein
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="name@schule.de"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Passwort (mindestens 8 Zeichen)
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accentHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Registrierung läuft...' : 'Registrieren'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Bereits ein Konto?{' '}
                  <Link href="/login" className="font-medium text-accent hover:text-accentHover">
                    Jetzt anmelden
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
