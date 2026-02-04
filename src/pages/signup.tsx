import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, name, orgName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
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
        </div>
      </div>
    </>
  );
}
