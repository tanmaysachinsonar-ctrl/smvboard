import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendarToolbar from '../../../components/calendar/CalendarToolbar';

describe('CalendarToolbar', () => {
  const mockHandlers = {
    onViewModeChange: jest.fn(),
    onNavigate: jest.fn(),
    onCreateEvent: jest.fn(),
  };

  const defaultProps = {
    viewMode: 'list' as const,
    currentDate: new Date(2026, 1, 1),
    showToggle: true,
    ...mockHandlers,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render current month and year', () => {
    render(<CalendarToolbar {...defaultProps} />);
    expect(screen.getByText('Februar 2026')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<CalendarToolbar {...defaultProps} />);

    expect(screen.getByLabelText('Vorheriger Monat')).toBeInTheDocument();
    expect(screen.getByLabelText('Nächster Monat')).toBeInTheDocument();
    expect(screen.getByText('Heute')).toBeInTheDocument();
  });

  it('should call onNavigate with correct direction', () => {
    render(<CalendarToolbar {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Vorheriger Monat'));
    expect(mockHandlers.onNavigate).toHaveBeenCalledWith('prev');

    fireEvent.click(screen.getByText('Heute'));
    expect(mockHandlers.onNavigate).toHaveBeenCalledWith('today');

    fireEvent.click(screen.getByLabelText('Nächster Monat'));
    expect(mockHandlers.onNavigate).toHaveBeenCalledWith('next');
  });

  it('should render view mode toggle when showToggle is true', () => {
    render(<CalendarToolbar {...defaultProps} showToggle={true} />);

    expect(screen.getByLabelText('Listen-Ansicht')).toBeInTheDocument();
    expect(screen.getByLabelText('Monats-Ansicht')).toBeInTheDocument();
  });

  it('should not render view mode toggle when showToggle is false', () => {
    render(<CalendarToolbar {...defaultProps} showToggle={false} />);

    expect(screen.queryByLabelText('Listen-Ansicht')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Monats-Ansicht')).not.toBeInTheDocument();
  });

  it('should highlight active view mode', () => {
    const { rerender } = render(<CalendarToolbar {...defaultProps} viewMode="list" />);

    const listButton = screen.getByLabelText('Listen-Ansicht');
    expect(listButton).toHaveAttribute('aria-pressed', 'true');

    rerender(<CalendarToolbar {...defaultProps} viewMode="month" />);

    const monthButton = screen.getByLabelText('Monats-Ansicht');
    expect(monthButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onViewModeChange when toggle buttons are clicked', () => {
    render(<CalendarToolbar {...defaultProps} viewMode="list" />);

    fireEvent.click(screen.getByLabelText('Monats-Ansicht'));
    expect(mockHandlers.onViewModeChange).toHaveBeenCalledWith('month');

    fireEvent.click(screen.getByLabelText('Listen-Ansicht'));
    expect(mockHandlers.onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('should render create event button', () => {
    render(<CalendarToolbar {...defaultProps} />);

    const createButton = screen.getByLabelText('Neues Event erstellen');
    expect(createButton).toBeInTheDocument();
  });

  it('should call onCreateEvent when create button is clicked', () => {
    render(<CalendarToolbar {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Neues Event erstellen'));
    expect(mockHandlers.onCreateEvent).toHaveBeenCalled();
  });
});
