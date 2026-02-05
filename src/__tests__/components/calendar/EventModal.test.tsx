import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventModal from '../../../components/calendar/EventModal';
import { Event } from '../../../types/models';

describe('EventModal', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    startAt: '2026-02-15T10:00:00Z',
    endAt: '2026-02-15T12:00:00Z',
    allDay: false,
    description: 'Test Description',
    location: 'Test Location',
    color: '#3B82F6',
    orgId: 'org1',
    createdById: 'user1',
    createdAt: '2026-02-01T00:00:00Z',
  };

  const mockHandlers = {
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<EventModal isOpen={false} {...mockHandlers} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render create mode with empty form', () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    expect(screen.getByText('Neues Event erstellen')).toBeInTheDocument();
    expect(screen.getByLabelText(/Titel/)).toHaveValue('');
  });

  it('should render edit mode with prefilled form', () => {
    render(<EventModal isOpen={true} event={mockEvent} {...mockHandlers} />);

    expect(screen.getByText('Event bearbeiten')).toBeInTheDocument();
    expect(screen.getByLabelText(/Titel/)).toHaveValue('Test Event');
    expect(screen.getByLabelText(/Beschreibung/)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/Ort/)).toHaveValue('Test Location');
  });

  it('should call onClose when close button is clicked', () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    fireEvent.click(screen.getByLabelText('Schließen'));
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    fireEvent.click(screen.getByText('Abbrechen'));
    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('should show validation error for empty title', async () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    const submitButton = screen.getByText('Erstellen');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Titel ist erforderlich')).toBeInTheDocument();
    });
  });

  it('should show validation error when end < start', async () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    fireEvent.change(screen.getByLabelText(/Titel/), {
      target: { value: 'Test Event' },
    });
    fireEvent.change(screen.getByLabelText(/Startzeit/), {
      target: { value: '2026-02-15T12:00' },
    });
    fireEvent.change(screen.getByLabelText(/Endzeit/), {
      target: { value: '2026-02-15T10:00' },
    });

    fireEvent.click(screen.getByText('Erstellen'));

    await waitFor(() => {
      expect(screen.getByText('Endzeit muss nach Startzeit liegen')).toBeInTheDocument();
    });
  });

  it('should call onSubmit with correct data on create', async () => {
    mockHandlers.onSubmit.mockResolvedValue(undefined);
    render(<EventModal isOpen={true} {...mockHandlers} />);

    fireEvent.change(screen.getByLabelText(/Titel/), {
      target: { value: 'New Event' },
    });
    fireEvent.change(screen.getByLabelText(/Startzeit/), {
      target: { value: '2026-02-15T10:00' },
    });
    fireEvent.change(screen.getByLabelText(/Beschreibung/), {
      target: { value: 'Description' },
    });

    fireEvent.click(screen.getByText('Erstellen'));

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Event',
          description: 'Description',
        })
      );
    });
  });

  it('should handle allDay checkbox', () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    const allDayCheckbox = screen.getByLabelText(/Ganztägiges Event/);
    expect(allDayCheckbox).not.toBeChecked();

    fireEvent.click(allDayCheckbox);
    expect(allDayCheckbox).toBeChecked();
  });

  it('should handle color picker', () => {
    render(<EventModal isOpen={true} {...mockHandlers} />);

    const colorInput = screen.getByLabelText(/Farbe/);
    fireEvent.change(colorInput, { target: { value: '#FF0000' } });

    expect(colorInput).toHaveValue('#FF0000');
    expect(screen.getByText('#FF0000')).toBeInTheDocument();
  });

  it('should display loading state during submission', async () => {
    mockHandlers.onSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    render(<EventModal isOpen={true} {...mockHandlers} />);

    fireEvent.change(screen.getByLabelText(/Titel/), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/Startzeit/), {
      target: { value: '2026-02-15T10:00' },
    });

    fireEvent.click(screen.getByText('Erstellen'));

    await waitFor(() => {
      expect(screen.getByText('Speichern...')).toBeInTheDocument();
    });
  });

  it('should close modal after successful submission', async () => {
    mockHandlers.onSubmit.mockResolvedValue(undefined);
    render(<EventModal isOpen={true} {...mockHandlers} />);

    fireEvent.change(screen.getByLabelText(/Titel/), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/Startzeit/), {
      target: { value: '2026-02-15T10:00' },
    });

    fireEvent.click(screen.getByText('Erstellen'));

    await waitFor(() => {
      expect(mockHandlers.onClose).toHaveBeenCalled();
    });
  });
});
