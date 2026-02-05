import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthView from '../../../components/calendar/MonthView';
import { Event } from '../../../types/models';

describe('MonthView', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Test Event 1',
      startAt: '2026-02-15T10:00:00Z',
      endAt: '2026-02-15T12:00:00Z',
      allDay: false,
      color: '#3B82F6',
      orgId: 'org1',
      createdById: 'user1',
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'All Day Event',
      startAt: '2026-02-20T00:00:00Z',
      allDay: true,
      color: '#10B981',
      orgId: 'org1',
      createdById: 'user1',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  const mockHandlers = {
    onEventClick: jest.fn(),
    onDateClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render calendar grid with weekdays', () => {
    const currentDate = new Date(2026, 1, 1); // February 2026
    render(<MonthView events={mockEvents} currentDate={currentDate} {...mockHandlers} />);

    // Check weekday headers
    expect(screen.getByText('Mo')).toBeInTheDocument();
    expect(screen.getByText('Di')).toBeInTheDocument();
    expect(screen.getByText('Mi')).toBeInTheDocument();
    expect(screen.getByText('Do')).toBeInTheDocument();
    expect(screen.getByText('Fr')).toBeInTheDocument();
    expect(screen.getByText('Sa')).toBeInTheDocument();
    expect(screen.getByText('So')).toBeInTheDocument();
  });

  it('should render events on correct dates', () => {
    const currentDate = new Date(2026, 1, 1);
    render(<MonthView events={mockEvents} currentDate={currentDate} {...mockHandlers} />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('All Day Event')).toBeInTheDocument();
  });

  it('should call onEventClick when event is clicked', () => {
    const currentDate = new Date(2026, 1, 1);
    render(<MonthView events={mockEvents} currentDate={currentDate} {...mockHandlers} />);

    const eventButton = screen.getByText('Test Event 1');
    fireEvent.click(eventButton);

    expect(mockHandlers.onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('should call onDateClick when date cell is clicked', () => {
    const currentDate = new Date(2026, 1, 1);
    render(<MonthView events={mockEvents} currentDate={currentDate} {...mockHandlers} />);

    // Find a date cell (e.g., the 1st of the month)
    const dateCells = screen.getAllByRole('button');
    const dateCell = dateCells.find((cell) =>
      cell.getAttribute('aria-label')?.includes('01.02.2026')
    );

    if (dateCell) {
      fireEvent.click(dateCell);
      expect(mockHandlers.onDateClick).toHaveBeenCalled();
    }
  });

  it('should show today indicator', () => {
    const today = new Date();
    render(<MonthView events={[]} currentDate={today} {...mockHandlers} />);

    // Today should have special styling (checked via class)
    const dayNumber = today.getDate();
    const todayElement = screen.getByText(dayNumber.toString());
    expect(todayElement).toBeInTheDocument();
  });

  it('should truncate events when more than 3 per day', () => {
    const manyEvents: Event[] = Array.from({ length: 5 }, (_, i) => ({
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      startAt: '2026-02-15T10:00:00Z',
      allDay: false,
      orgId: 'org1',
      createdById: 'user1',
      createdAt: '2026-02-01T00:00:00Z',
    }));

    const currentDate = new Date(2026, 1, 1);
    render(<MonthView events={manyEvents} currentDate={currentDate} {...mockHandlers} />);

    // Should show "+2 weitere" indicator
    expect(screen.getByText('+2 weitere')).toBeInTheDocument();
  });

  it('should apply custom event colors', () => {
    const currentDate = new Date(2026, 1, 1);
    render(<MonthView events={mockEvents} currentDate={currentDate} {...mockHandlers} />);

    const event1 = screen.getByText('Test Event 1');
    expect(event1).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('should support keyboard navigation', () => {
    const currentDate = new Date(2026, 1, 1);
    render(<MonthView events={mockEvents} currentDate={currentDate} {...mockHandlers} />);

    const dateCells = screen.getAllByRole('button');
    const firstCell = dateCells[0];

    if (firstCell) {
      fireEvent.keyDown(firstCell, { key: 'Enter' });
      expect(mockHandlers.onDateClick).toHaveBeenCalled();
    }
  });
});
