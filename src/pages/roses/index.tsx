import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface School {
  id: string;
  name: string;
  description?: string;
  _count: {
    users: number;
    receivedOrders: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  pricePerRose: number;
  status: string;
}

interface Order {
  id: string;
  recipientName: string;
  recipientClass?: string;
  roseCount: number;
  senderNote?: string;
  isAnonymous: boolean;
  createdAt: string;
  recipientSchool: {
    id: string;
    name: string;
  };
  campaign?: {
    id: string;
    name: string;
  };
}

interface OrderFormData {
  recipientSchoolId: string;
  recipientName: string;
  recipientClass: string;
  roseCount: number;
  senderNote: string;
  isAnonymous: boolean;
}

export default function RosesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<OrderFormData>({
    recipientSchoolId: '',
    recipientName: '',
    recipientClass: '',
    roseCount: 1,
    senderNote: '',
    isAnonymous: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setError('Nicht angemeldet');
        return;
      }

      // Fetch schools, campaigns, and orders in parallel
      const [schoolsRes, campaignsRes, ordersRes] = await Promise.all([
        fetch('/api/v1/roses/schools', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/roses/campaigns?status=OPEN', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/roses/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!schoolsRes.ok || !campaignsRes.ok || !ordersRes.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }

      const schoolsData = await schoolsRes.json();
      const campaignsData = await campaignsRes.json();
      const ordersData = await ordersRes.json();

      setSchools(schoolsData.schools || []);
      setActiveCampaign(campaignsData.activeCampaign || null);
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Nicht angemeldet');
      }

      const payload = {
        ...formData,
        recipientName: formData.recipientName.trim(),
        recipientClass: formData.recipientClass.trim() || undefined,
        senderNote: formData.senderNote.trim() || undefined,
        campaignId: activeCampaign?.id,
      };

      const response = await fetch('/api/v1/roses/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Bestellung');
      }

      // Success
      setSuccessMessage('Bestellung erfolgreich erstellt! 🌹');
      setShowOrderModal(false);
      setFormData({
        recipientSchoolId: '',
        recipientName: '',
        recipientClass: '',
        roseCount: 1,
        senderNote: '',
        isAnonymous: false,
      });

      // Refresh orders
      fetchData();

      // Hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Fehler beim Erstellen der Bestellung');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-gray-400">Bitte melde dich an, um Rosen zu bestellen.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Rosenaktion - SMVboard</title>
      </Head>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🌹 Rosenaktion</h1>
          <p className="text-gray-400 text-lg max-w-3xl">
            Bestelle Rosen für deine Mitschüler – egal an welcher Schule im Verbund sie sind. Die
            Verteilung erfolgt automatisch über die jeweilige Schule.
          </p>
        </div>

        {/* Campaign Info */}
        {activeCampaign && (
          <div className="mb-8 p-6 bg-accent/10 border border-accent/30 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Aktuelle Kampagne: {activeCampaign.name}
            </h2>
            {activeCampaign.description && (
              <p className="text-gray-300 mb-3">{activeCampaign.description}</p>
            )}
            <div className="flex gap-6 text-sm text-gray-400">
              <span>Start: {new Date(activeCampaign.startDate).toLocaleDateString('de-DE')}</span>
              <span>Ende: {new Date(activeCampaign.endDate).toLocaleDateString('de-DE')}</span>
              <span className="text-accent font-medium">
                {activeCampaign.pricePerRose.toFixed(2)} € pro Rose
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
          >
            + Rose bestellen
          </button>
          <button
            onClick={() => router.push('/roses/distribution')}
            className="px-6 py-3 bg-card hover:bg-gray-800 text-white rounded-lg border border-gray-700 font-medium transition-colors"
          >
            📊 Verteilung ansehen
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-card rounded-lg border border-gray-800">
            <div className="text-3xl font-bold text-accent mb-2">
              {orders.reduce((sum, order) => sum + order.roseCount, 0)}
            </div>
            <div className="text-gray-400">Bestellte Rosen</div>
          </div>
          <div className="p-6 bg-card rounded-lg border border-gray-800">
            <div className="text-3xl font-bold text-white mb-2">{orders.length}</div>
            <div className="text-gray-400">Bestellungen</div>
          </div>
          <div className="p-6 bg-card rounded-lg border border-gray-800">
            <div className="text-3xl font-bold text-white mb-2">{schools.length}</div>
            <div className="text-gray-400">Schulen im Verbund</div>
          </div>
        </div>

        {/* My Orders Table */}
        <div className="bg-card rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-semibold text-white">Meine Bestellungen</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Lädt...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Du hast noch keine Rosen bestellt.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-smvbg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Empfänger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Schule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Klasse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Anzahl
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nachricht
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Datum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-900/50">
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {order.recipientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {order.recipientSchool.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {order.recipientClass || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-sm font-medium bg-accent/20 text-accent rounded">
                          {order.roseCount}x 🌹
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                        {order.senderNote || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('de-DE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-semibold text-white">Rose bestellen</h2>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
              {/* School Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ziel-Schule *
                </label>
                <select
                  name="recipientSchoolId"
                  value={formData.recipientSchoolId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Bitte wählen...</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Empfänger Name *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="z.B. Max Mustermann"
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Recipient Class */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Klasse (Optional)
                </label>
                <input
                  type="text"
                  name="recipientClass"
                  value={formData.recipientClass}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="z.B. 10a"
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Rose Count */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Anzahl Rosen *
                </label>
                <input
                  type="number"
                  name="roseCount"
                  value={formData.roseCount}
                  onChange={handleInputChange}
                  required
                  min={1}
                  max={10}
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Sender Note */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nachricht (Optional, max. 200 Zeichen)
                </label>
                <textarea
                  name="senderNote"
                  value={formData.senderNote}
                  onChange={handleInputChange}
                  maxLength={200}
                  rows={3}
                  placeholder="Eine persönliche Nachricht..."
                  className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                />
                <div className="text-sm text-gray-500 text-right mt-1">
                  {formData.senderNote.length}/200
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  id="isAnonymous"
                  className="w-4 h-4 text-accent bg-smvbg border-gray-700 rounded focus:ring-accent"
                />
                <label htmlFor="isAnonymous" className="ml-2 text-sm text-gray-300">
                  Anonyme Bestellung (dein Name wird nicht angezeigt)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  disabled={submitting}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Wird erstellt...' : 'Bestellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
