import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

interface RoseOrder {
  id: string;
  recipientName: string;
  recipientSchool: string;
  quantity: number;
  createdAt: string;
}

interface GroupedOrder {
  recipientName: string;
  totalQuantity: number;
  orderCount: number;
}

export default function RoseAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<RoseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity'>('name');
  const [grouped, setGrouped] = useState(true);

  // Redirect wenn nicht eingeloggt
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Lade Bestellungen
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          throw new Error('Keine Authentifizierung');
        }

        const response = await fetch('/api/v1/roses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Bestellungen');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Gruppierte Bestellungen
  const groupedOrders = useMemo<GroupedOrder[]>(() => {
    const groups = new Map<string, GroupedOrder>();

    orders.forEach((order) => {
      const existing = groups.get(order.recipientName);
      if (existing) {
        existing.totalQuantity += order.quantity;
        existing.orderCount += 1;
      } else {
        groups.set(order.recipientName, {
          recipientName: order.recipientName,
          totalQuantity: order.quantity,
          orderCount: 1,
        });
      }
    });

    return Array.from(groups.values());
  }, [orders]);

  // Gefilterte und sortierte Daten
  const displayData = useMemo(() => {
    const data = grouped
      ? groupedOrders
      : orders.map((o) => ({
          recipientName: o.recipientName,
          totalQuantity: o.quantity,
          orderCount: 1,
        }));

    // Filtern
    const filtered = data.filter((item) =>
      item.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sortieren
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.recipientName.localeCompare(b.recipientName);
      } else {
        return b.totalQuantity - a.totalQuantity;
      }
    });
  }, [orders, groupedOrders, grouped, searchTerm, sortBy]);

  // Stats
  const stats = useMemo(
    () => ({
      totalRecipients: groupedOrders.length,
      totalRoses: orders.reduce((sum, o) => sum + o.quantity, 0),
      totalOrders: orders.length,
    }),
    [orders, groupedOrders]
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'Name;Anzahl Rosen\n';
    const rows = groupedOrders
      .map((order) => `${order.recipientName};${order.totalQuantity}`)
      .join('\n');

    const csv = '\uFEFF' + headers + rows; // UTF-8 BOM
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rosen-bestellungen-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Rosen-Verwaltung | SMVBoard</title>
      </Head>

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🌹 Rosen-Verwaltung
          </h1>
          <p className="text-gray-400 mt-2">Übersicht aller Bestellungen für deine Schule</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-3xl font-bold text-white">{stats.totalRecipients}</div>
            <div className="text-gray-400 text-sm">Empfänger</div>
          </div>
          <div className="bg-card rounded-lg p-6">
            <div className="text-4xl mb-2">🌹</div>
            <div className="text-3xl font-bold text-white">{stats.totalRoses}</div>
            <div className="text-gray-400 text-sm">Rosen gesamt</div>
          </div>
          <div className="bg-card rounded-lg p-6">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
            <div className="text-gray-400 text-sm">Bestellungen</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nach Name suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'quantity')}
              className="px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="name">Nach Name</option>
              <option value="quantity">Nach Anzahl</option>
            </select>

            {/* Gruppierung */}
            <button
              onClick={() => setGrouped(!grouped)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                grouped
                  ? 'bg-accent text-white'
                  : 'bg-smvbg border border-gray-700 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {grouped ? '✓ Gruppiert' : 'Einzeln'}
            </button>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              disabled={orders.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📥 CSV Export
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Bestellungen...</p>
          </div>
        ) : displayData.length === 0 ? (
          /* Empty State */
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🌹</div>
            <p className="text-xl text-gray-400">
              {searchTerm ? 'Keine Ergebnisse gefunden' : 'Noch keine Bestellungen vorhanden'}
            </p>
          </div>
        ) : (
          /* Table */
          <div className="bg-card rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-smvbg">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Empfänger-Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Anzahl Rosen
                  </th>
                  {grouped && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Bestellungen
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 text-white">{item.recipientName}</td>
                    <td className="px-6 py-4 text-white">
                      <span className="flex items-center gap-2">🌹 {item.totalQuantity}</span>
                    </td>
                    {grouped && <td className="px-6 py-4 text-gray-400">{item.orderCount}x</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
