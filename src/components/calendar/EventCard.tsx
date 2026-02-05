import React from 'react';
import { Event } from '../../types/models';
import { getContrastColor } from '../../lib/color';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

/**
 * EventCard Component
 *
 * Kompakte Event-Darstellung für Listen-Ansicht.
 */
export default function EventCard({ event, onClick }: EventCardProps) {
  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : null;
  const bgColor = event.color || '#3B82F6';
  const textColor = getContrastColor(bgColor);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-card border border-gray-800 rounded-lg hover:border-accent hover:shadow-md transition-all"
      aria-label={`Event: ${event.title}`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: bgColor,
      }}
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Title with Color Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              {event.allDay ? '⏱️ Ganztägig' : '📅 Event'}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-1 truncate">{event.title}</h3>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formatDate(startDate)}
              {!event.allDay && (
                <>
                  {', '}
                  {formatTime(startDate)}
                  {endDate && ` - ${formatTime(endDate)}`}
                </>
              )}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
