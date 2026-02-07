import React, { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';

interface School {
  id: string;
  name: string;
}

export default function RoseOrderPage() {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientSchool: '',
    quantity: 1,
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load schools on mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/public/schools');
        if (response.ok) {
          const data = await response.json();
          setSchools(data.schools || []);
        } else {
          setError('Fehler beim Laden der Schulen');
        }
      } catch (err) {
        console.error('Failed to load schools:', err);
        setError('Fehler beim Laden der Schulen');
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/v1/roses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern der Bestellung');
      }

      setSuccess(true);
      setFormData({ recipientName: '', recipientSchool: '', quantity: 1 });

      // Success-Message nach 3 Sekunden ausblenden
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Rosen bestellen | SMVBoard</title>
      </Head>

      <div className="min-h-screen bg-smvbg flex items-center justify-center px-4 py-12">
        <div className="bg-card rounded-xl shadow-xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌹</div>
            <h1 className="text-3xl font-bold text-white mb-2">Rosen bestellen</h1>
            <p className="text-gray-400">Schulübergreifende Valentinstag-Aktion</p>
            <p className="text-sm text-gray-500 mt-2">✨ Vollständig anonym</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              <p className="font-semibold">✓ Bestellung erfolgreich!</p>
              <p className="text-sm">Deine Rose(n) werden zum Valentinstag überreicht.</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              <p className="font-semibold">✗ Fehler</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Empfänger Name */}
            <div>
              <label
                htmlFor="recipientName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Name des Empfängers
              </label>
              <input
                type="text"
                id="recipientName"
                required
                disabled={loading}
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full px-4 py-3 bg-smvbg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                placeholder="Max Mustermann"
              />
            </div>

            {/* Schule */}
            <div>
              <label
                htmlFor="recipientSchool"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Schule des Empfängers
              </label>
              <select
                id="recipientSchool"
                required
                disabled={loading || loadingSchools}
                value={formData.recipientSchool}
                onChange={(e) => setFormData({ ...formData, recipientSchool: e.target.value })}
                className="w-full px-4 py-3 bg-smvbg border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              >
                <option value="">{loadingSchools ? 'Lade Schulen...' : 'Bitte wählen...'}</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.name}>
                    {school.name}
                  </option>
                ))}
              </select>
              {schools.length === 0 && !loadingSchools && (
                <p className="mt-2 text-sm text-yellow-500">
                  Keine Schulen verfügbar. Bitte kontaktiere einen Administrator.
                </p>
              )}
            </div>

            {/* Anzahl */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">
                Anzahl Rosen
              </label>
              <select
                id="quantity"
                required
                disabled={loading}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-smvbg border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} Rose{num > 1 ? 'n' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accentHover text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                <>🌹 Bestellung absenden</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Die Bestellung ist vollständig anonym.</p>
            <p>Abholung/Verteilung erfolgt am Valentinstag.</p>
          </div>
        </div>
      </div>
    </>
  );
}
