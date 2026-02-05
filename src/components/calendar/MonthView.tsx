import React, { useMemo } from 'react';
import { Event } from '../../types/models';

interface MonthViewProps {
  events: Event[];
  currentDate: Date;
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

/**
 * MonthView Component
 *
 * Zeigt einen Monatskalender mit Events in einem Grid-Layout.
 * Unterstützt Navigation, Event-Klicks und Erstellen von Events durch Klick auf Tag.
 */
export default function MonthView({
  events,
  currentDate,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // Berechne alle Tage des Monats + Padding
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Erster Tag des Monats
    const firstDay = new Date(year, month, 1);
    // Letzter Tag des Monats
    const lastDay = new Date(year, month + 1, 0);

    // Wochentag des ersten Tags (0 = Sonntag, 1 = Montag, ...)
    let firstDayOfWeek = firstDay.getDay();
    // Konvertiere zu ISO (0 = Montag)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding-Tage vom vorherigen Monat
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        events: [],
      });
    }

    // Tage des aktuellen Monats
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter((event) => {
        const eventStart = new Date(event.startAt);
        return (
          eventStart.getFullYear() === year &&
          eventStart.getMonth() === month &&
          eventStart.getDate() === day
        );
      });

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        events: dayEvents,
      });
    }

    // Padding-Tage vom nächsten Monat (bis 42 Tage für 6 Wochen)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        events: [],
      });
    }

    return days;
  }, [currentDate, events]);

  return (
    <div className="bg-card rounded-lg shadow overflow-hidden border border-gray-800">
      {/* Wochentag-Header */}
      <div className="grid grid-cols-7 bg-gray-900/50 border-b border-gray-800">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-gray-300">
            {day}
          </div>
        ))}
      </div>

      {/* Kalender-Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-800">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 cursor-pointer hover:bg-gray-800/50 transition-colors ${
              !day.isCurrentMonth ? 'bg-gray-900/30' : ''
            }`}
            onClick={() => onDateClick(day.date)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDateClick(day.date);
              }
            }}
            aria-label={`${day.date.toLocaleDateString('de-DE')}${
              day.events.length > 0 ? `, ${day.events.length} Event(s)` : ''
            }`}
          >
            {/* Tag-Nummer */}
            <div
              className={`text-sm font-medium mb-1 ${
                day.isToday
                  ? 'bg-accent text-white rounded-full w-7 h-7 flex items-center justify-center'
                  : day.isCurrentMonth
                    ? 'text-white'
                    : 'text-gray-600'
              }`}
            >
              {day.date.getDate()}
            </div>

            {/* Events */}
            <div className="space-y-1">
              {day.events.slice(0, 3).map((event) => (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="w-full text-left px-2 py-1 rounded text-xs font-medium truncate hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: event.color || '#3B82F6',
                    color: '#FFFFFF',
                  }}
                  title={event.title}
                  aria-label={`Event: ${event.title}`}
                >
                  {event.allDay ? '⏱️ ' : ''}
                  {event.title}
                </button>
              ))}
              {day.events.length > 3 && (
                <div className="text-xs text-gray-400 px-2">+{day.events.length - 3} weitere</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
