import React from 'react';

interface CalendarToolbarProps {
  viewMode: 'list' | 'month';
  onViewModeChange: (mode: 'list' | 'month') => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onCreateEvent: () => void;
  showToggle?: boolean;
}

/**
 * CalendarToolbar Component
 *
 * Toolbar mit View-Toggle (List/Month), Navigation und Create-Button.
 * Mobile: Toggle wird ausgeblendet, nur ListView angezeigt.
 */
export default function CalendarToolbar({
  viewMode,
  onViewModeChange,
  currentDate,
  onNavigate,
  onCreateEvent,
  showToggle = true,
}: CalendarToolbarProps) {
  const monthName = currentDate.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">{monthName}</h2>
        <div className="flex gap-1 ml-4">
          <button
            onClick={() => onNavigate('prev')}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Vorheriger Monat"
            title="Vorheriger Monat"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('today')}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Heute"
          >
            Heute
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Nächster Monat"
            title="Nächster Monat"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View Toggle (Hidden on Mobile) */}
        {showToggle && (
          <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Listen-Ansicht"
              aria-pressed={viewMode === 'list'}
            >
              Liste
            </button>
            <button
              onClick={() => onViewModeChange('month')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Monats-Ansicht"
              aria-pressed={viewMode === 'month'}
            >
              Monat
            </button>
          </div>
        )}

        {/* Create Event Button */}
        <button
          onClick={onCreateEvent}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          aria-label="Neues Event erstellen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Neues Event</span>
        </button>
      </div>
    </div>
  );
}
