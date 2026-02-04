import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  async function fetchEvents() {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch('/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
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
          <button className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition">
            + Neues Event
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Lädt...</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-card rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-400 mt-1">{event.description}</p>
                    )}
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-400">
                      <span>📅 {new Date(event.start).toLocaleDateString('de-DE')}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    von {event.createdBy.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
