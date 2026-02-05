import React, { useState, useEffect } from 'react';
import { Event, CreateEventRequest, UpdateEventRequest } from '../../types/models';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>;
  event?: Event | null;
  initialDate?: Date;
}

/**
 * EventModal Component
 *
 * Modal für Create/Edit von Events.
 * Unterstützt alle Event-Felder: title, start, end, allDay, description, location, color.
 */
export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  event,
  initialDate,
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    allDay: false,
    description: '',
    location: '',
    color: '#3B82F6',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or event changes
  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode
        const startDate = new Date(event.startAt);
        const endDate = event.endAt ? new Date(event.endAt) : null;

        setFormData({
          title: event.title,
          start: formatDateTimeLocal(startDate),
          end: endDate ? formatDateTimeLocal(endDate) : '',
          allDay: event.allDay || false,
          description: event.description || '',
          location: event.location || '',
          color: event.color || '#3B82F6',
        });
      } else {
        // Create mode
        const start = initialDate || new Date();
        start.setHours(9, 0, 0, 0); // Default: 9:00 Uhr

        setFormData({
          title: '',
          start: formatDateTimeLocal(start),
          end: '',
          allDay: false,
          description: '',
          location: '',
          color: '#3B82F6',
        });
      }
      setError(null);
    }
  }, [isOpen, event, initialDate]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Titel ist erforderlich');
      return;
    }

    if (!formData.start) {
      setError('Startzeit ist erforderlich');
      return;
    }

    // Validate: start <= end
    if (formData.end && new Date(formData.start) > new Date(formData.end)) {
      setError('Endzeit muss nach Startzeit liegen');
      return;
    }

    setLoading(true);

    try {
      const data: CreateEventRequest | UpdateEventRequest = {
        title: formData.title.trim(),
        start: new Date(formData.start).toISOString(),
        end: formData.end ? new Date(formData.end).toISOString() : undefined,
        allDay: formData.allDay,
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        color: formData.color,
      };

      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="event-modal-title" className="text-xl font-semibold text-gray-900">
            {event ? 'Event bearbeiten' : 'Neues Event erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              id="event-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event-Titel eingeben"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-start" className="block text-sm font-medium text-gray-700 mb-1">
                Startzeit *
              </label>
              <input
                id="event-start"
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="event-end" className="block text-sm font-medium text-gray-700 mb-1">
                Endzeit
              </label>
              <input
                id="event-end"
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* All Day */}
          <div className="flex items-center">
            <input
              id="event-allday"
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="event-allday" className="ml-2 text-sm text-gray-700">
              Ganztägiges Event
            </label>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="event-location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ort
            </label>
            <input
              id="event-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Aula, Klassenzimmer 3A"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="event-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="event-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Weitere Details zum Event"
            />
          </div>

          {/* Color */}
          <div>
            <label htmlFor="event-color" className="block text-sm font-medium text-gray-700 mb-1">
              Farbe
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="event-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{formData.color}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Speichern...' : event ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
