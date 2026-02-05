import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import MonthView from '../../components/calendar/MonthView';
import CalendarToolbar from '../../components/calendar/CalendarToolbar';
import EventModal from '../../components/calendar/EventModal';
import EventCard from '../../components/calendar/EventCard';
import { Event, CreateEventRequest, UpdateEventRequest } from '../../types/models';

type ViewMode = 'list' | 'month';

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768 && viewMode === 'month') {
        setViewMode('list');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

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
      // Map API response to Event type
      const mappedEvents: Event[] = data.map((e: any) => ({
        ...e,
        startAt: e.start,
        endAt: e.end,
      }));
      setEvents(mappedEvents);
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

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
    } else if (direction === 'prev') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setSelectedDate(undefined);
    setShowModal(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setShowModal(true);
  };

  const handleSubmitEvent = async (data: CreateEventRequest | UpdateEventRequest) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) {
      throw new Error('Nicht authentifiziert');
    }

    if (selectedEvent) {
      // Update
      const response = await fetch(`/api/v1/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Event konnte nicht aktualisiert werden');
      }
    } else {
      // Create
      const response = await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Event konnte nicht erstellt werden');
      }
    }

    await fetchEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Möchten Sie dieses Event wirklich löschen?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('Nicht authentifiziert');
      }

      const response = await fetch(`/api/v1/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Event konnte nicht gelöscht werden');
      }

      setShowModal(false);
      setSelectedEvent(null);
      await fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      setError(error instanceof Error ? error.message : 'Event konnte nicht gelöscht werden');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Kalender - SMVBoard</title>
      </Head>

      <div className="space-y-6">
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

        {/* Calendar Toolbar */}
        <CalendarToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onCreateEvent={handleCreateEvent}
          showToggle={true}
        />

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-gray-400">Lädt Events...</p>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Keine Events vorhanden</h3>
            <p className="text-gray-400 mb-4">Erstellen Sie Ihr erstes Event.</p>
            <button
              onClick={handleCreateEvent}
              className="px-6 py-3 bg-accent hover:bg-accentHover rounded-md transition"
            >
              Erstes Event erstellen
            </button>
          </div>
        ) : (
          /* Calendar Views */
          <>
            {viewMode === 'month' ? (
              <MonthView
                events={events}
                currentDate={currentDate}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
              />
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Event Modal */}
        <EventModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
            setSelectedDate(undefined);
            setError(null);
          }}
          onSubmit={handleSubmitEvent}
          event={selectedEvent}
          initialDate={selectedDate}
        />

        {/* Delete Button in Modal */}
        {showModal && selectedEvent && (
          <div className="fixed bottom-24 right-4 md:right-8 z-[60]">
            <button
              onClick={() => handleDeleteEvent(selectedEvent.id)}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label="Event löschen"
            >
              {deleteLoading ? 'Löschen...' : '🗑️ Löschen'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
