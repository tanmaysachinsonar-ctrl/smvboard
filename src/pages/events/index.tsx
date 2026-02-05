import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

interface Event {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  location?: string;
  createdBy: { name: string; email: string };
}

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
  });

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setError('Nicht authentifiziert. Bitte melden Sie sich erneut an.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Events konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setError('Nicht authentifiziert. Bitte melden Sie sich erneut an.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newEvent,
          start: new Date(newEvent.start).toISOString(),
          end: newEvent.end ? new Date(newEvent.end).toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      setShowAddModal(false);
      setNewEvent({ title: '', description: '', start: '', end: '', location: '' });
      await fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
      setError(error instanceof Error ? error.message : 'Event konnte nicht erstellt werden.');
    } finally {
      setCreateLoading(false);
    }
  }

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Kalender - SMVBoard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Kalender & Events</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition"
          >
            + Neues Event
          </button>
        </div>
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-400">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">Lädt...</div>
        ) : events.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Keine Events vorhanden</h3>
            <p className="text-gray-400 mb-4">Erstellen Sie Ihr erstes Event.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-accent hover:bg-accentHover rounded-md transition"
            >
              Erstes Event erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-card rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    {event.description && <p className="text-gray-400 mt-1">{event.description}</p>}
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                      <span>📅 {new Date(event.start).toLocaleDateString('de-DE')}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">von {event.createdBy.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Neues Event erstellen</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titel *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beschreibung</label>
                  <textarea
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Startdatum *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Enddatum</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ort</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? 'Erstelle...' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Neues Event erstellen</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titel *</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beschreibung</label>
                  <textarea
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Startdatum *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Enddatum</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ort</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? 'Erstelle...' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}{' '}
      </div>
    </Layout>
  );
}
