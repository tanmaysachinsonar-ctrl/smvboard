import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface School {
  id: string;
  name: string;
}

interface DistributionItem {
  recipientName: string;
  recipientClass: string | null;
  totalRoses: number;
  orderCount: number;
}

interface DistributionStats {
  totalRecipients: number;
  totalRoses: number;
  totalOrders: number;
  averageRosesPerRecipient: number;
}

interface DistributionData {
  school: School;
  distribution: DistributionItem[];
  stats: DistributionStats;
}

export default function RosesDistributionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [distributionData, setDistributionData] = useState<DistributionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchDistribution(selectedSchoolId);
    }
  }, [selectedSchoolId]);

  const fetchSchools = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setError('Nicht angemeldet');
        return;
      }

      const response = await fetch('/api/v1/roses/schools', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Schulen');
      }

      const data = await response.json();
      setSchools(data.schools || []);

      // Auto-select first school
      if (data.schools && data.schools.length > 0) {
        setSelectedSchoolId(data.schools[0].id);
      }
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Fehler beim Laden der Schulen');
    }
  };

  const fetchDistribution = async (schoolId: string) => {
    try {
      setLoading(true);
      setError('');

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Nicht angemeldet');
      }

      const response = await fetch(`/api/v1/roses/distribution?schoolId=${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Laden der Verteilungsliste');
      }

      const data = await response.json();
      setDistributionData(data);
    } catch (err: any) {
      console.error('Error fetching distribution:', err);
      setError(err.message || 'Fehler beim Laden der Verteilungsliste');
      setDistributionData(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredDistribution = distributionData?.distribution.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.recipientName.toLowerCase().includes(searchLower) ||
      item.recipientClass?.toLowerCase().includes(searchLower)
    );
  });

  const exportToCSV = () => {
    if (!distributionData) return;

    const headers = ['Name', 'Klasse', 'Anzahl Rosen', 'Anzahl Bestellungen'];
    const rows = distributionData.distribution.map((item) => [
      item.recipientName,
      item.recipientClass || '',
      item.totalRoses.toString(),
      item.orderCount.toString(),
    ]);

    const csvContent = [
      '\uFEFF', // UTF-8 BOM
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rosenaktion_${distributionData.school.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-400">Bitte melde dich an, um die Verteilung zu sehen.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Rosenaktion - Verteilung - SMVboard</title>
      </Head>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/roses')}
              className="text-accent hover:text-accent-light mb-4 flex items-center gap-2"
            >
              ← Zurück
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Rosen-Verteilung</h1>
            <p className="text-gray-400">Aggregierte Liste aller Rosen-Empfänger pro Schule</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* School Selector */}
        <div className="mb-8 flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">Schule auswählen</label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {distributionData && (
            <>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors print:hidden"
              >
                📥 CSV Export
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-card hover:bg-gray-800 text-white rounded-lg border border-gray-700 font-medium transition-colors print:hidden"
              >
                🖨️ Drucken
              </button>
            </>
          )}
        </div>

        {/* Statistics Cards */}
        {distributionData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:mb-4">
            <div className="p-6 bg-card rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-accent mb-2">
                {distributionData.stats.totalRoses}
              </div>
              <div className="text-gray-400">Gesamt Rosen</div>
            </div>
            <div className="p-6 bg-card rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-white mb-2">
                {distributionData.stats.totalRecipients}
              </div>
              <div className="text-gray-400">Empfänger</div>
            </div>
            <div className="p-6 bg-card rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-white mb-2">
                {distributionData.stats.totalOrders}
              </div>
              <div className="text-gray-400">Bestellungen</div>
            </div>
            <div className="p-6 bg-card rounded-lg border border-gray-800">
              <div className="text-3xl font-bold text-white mb-2">
                ∅ {distributionData.stats.averageRosesPerRecipient}
              </div>
              <div className="text-gray-400">Pro Empfänger</div>
            </div>
          </div>
        )}

        {/* Search */}
        {distributionData && distributionData.distribution.length > 0 && (
          <div className="mb-6 print:hidden">
            <input
              type="text"
              placeholder="Name oder Klasse suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}

        {/* Distribution Table */}
        <div className="bg-card rounded-lg border border-gray-800 overflow-hidden print:border-black">
          <div className="p-6 border-b border-gray-800 print:border-black print:bg-white">
            <h2 className="text-2xl font-semibold text-white print:text-black">
              {distributionData
                ? `Verteilungsliste: ${distributionData.school.name}`
                : 'Verteilungsliste'}
            </h2>
            <p className="text-sm text-gray-400 mt-1 print:text-black">
              Stand:{' '}
              {new Date().toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Lädt...</div>
          ) : !distributionData || distributionData.distribution.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Keine Rosen für diese Schule bestellt.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full print:text-black">
                <thead className="bg-smvbg print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 print:text-black uppercase tracking-wider">
                      Nr.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 print:text-black uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 print:text-black uppercase tracking-wider">
                      Klasse
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 print:text-black uppercase tracking-wider">
                      Anzahl Rosen
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 print:text-black uppercase tracking-wider print:hidden">
                      Bestellungen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 print:divide-gray-300">
                  {(filteredDistribution || distributionData.distribution).map((item, index) => (
                    <tr
                      key={`${item.recipientName}-${item.recipientClass}`}
                      className="hover:bg-gray-900/50 print:hover:bg-transparent print:bg-white"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 print:text-black">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white print:text-black font-medium">
                        {item.recipientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 print:text-black">
                        {item.recipientClass || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="px-3 py-1 text-sm font-bold bg-accent/20 text-accent print:bg-transparent print:text-black rounded">
                          {item.totalRoses}x 🌹
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 print:hidden">
                        {item.orderCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600">
          <p>Rosenaktion - SMVboard</p>
          <p>Generiert am: {new Date().toLocaleString('de-DE')}</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:border-black {
            border-color: black !important;
          }
        }
      `}</style>
    </Layout>
  );
}
