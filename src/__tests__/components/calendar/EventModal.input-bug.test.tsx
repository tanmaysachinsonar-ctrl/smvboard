import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventModal from '../../../components/calendar/EventModal';

/**
 * Bug Reproduction Tests for Modal Input Issue
 *
 * This test suite reproduces and prevents the bug where users
 * could not type into input fields in the EventModal.
 *
 * Root Cause: The overlay's onClick={onClose} was preventing
 * focus and input events from reaching the form fields.
 */

describe('EventModal - Input Field Bug Tests', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bug Reproduction: Input fields should accept text input', () => {
    it('should allow typing in title field', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;

      // This was failing before the fix
      fireEvent.change(titleInput, { target: { value: 'Test Event Title' } });

      expect(titleInput.value).toBe('Test Event Title');
    });

    it('should allow typing in description textarea', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const descriptionTextarea = screen.getByLabelText(/Beschreibung/i) as HTMLTextAreaElement;

      // This was failing before the fix
      fireEvent.change(descriptionTextarea, { target: { value: 'This is a test description' } });

      expect(descriptionTextarea.value).toBe('This is a test description');
    });

    it('should allow typing in location field', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const locationInput = screen.getByLabelText(/Ort/i) as HTMLInputElement;

      // This was failing before the fix
      fireEvent.change(locationInput, { target: { value: 'Conference Room A' } });

      expect(locationInput.value).toBe('Conference Room A');
    });

    it('should allow changing date/time inputs', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const startInput = screen.getByLabelText(/Startzeit/i) as HTMLInputElement;

      fireEvent.change(startInput, { target: { value: '2026-02-15T10:00' } });

      expect(startInput.value).toBe('2026-02-15T10:00');
    });
  });

  describe('Bug Prevention: Input fields maintain focus', () => {
    it('should not lose focus when clicking inside modal content', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i);

      fireEvent.click(titleInput);
      expect(titleInput).toHaveFocus();

      // Focus should still be maintainable after clicking
      fireEvent.click(titleInput);
      expect(titleInput).toHaveFocus();
    });

    it('should allow focus on multiple fields', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i);
      const descriptionInput = screen.getByLabelText(/Beschreibung/i);

      fireEvent.click(titleInput);
      expect(titleInput).toHaveFocus();

      fireEvent.click(descriptionInput);
      expect(descriptionInput).toHaveFocus();
    });
  });

  describe('Bug Prevention: Overlay only closes on direct click', () => {
    it('should NOT close modal when clicking on modal content', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const modalContent = screen.getByRole('dialog').querySelector('.bg-white')!;
      fireEvent.click(modalContent);

      expect(mockHandlers.onClose).not.toHaveBeenCalled();
    });

    it('should NOT close modal when clicking on input fields', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i);
      fireEvent.click(titleInput);

      expect(mockHandlers.onClose).not.toHaveBeenCalled();
    });

    it('should close modal only when clicking overlay background', async () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      // Click directly on the overlay (the div with bg-black/50)
      const overlay = screen.getByRole('dialog');

      // Simulate clicking on the overlay itself, not children
      fireEvent.click(overlay, { target: overlay });

      expect(mockHandlers.onClose).toHaveBeenCalled();
    });
  });

  describe('Bug Prevention: Form submission works correctly', () => {
    it('should submit form with typed values', async () => {
      mockHandlers.onSubmit.mockResolvedValue(undefined);

      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;
      const descriptionTextarea = screen.getByLabelText(/Beschreibung/i) as HTMLTextAreaElement;
      const startInput = screen.getByLabelText(/Startzeit/i) as HTMLInputElement;

      // Type into all fields
      fireEvent.change(titleInput, { target: { value: 'Team Meeting' } });
      fireEvent.change(descriptionTextarea, { target: { value: 'Weekly sync' } });
      fireEvent.change(startInput, { target: { value: '2026-02-15T10:00' } });

      // Submit the form
      const submitButton = screen.getByText('Erstellen');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Team Meeting',
            description: 'Weekly sync',
          })
        );
      });
    });
  });

  describe('Bug Prevention: No pointer-events issues', () => {
    it('should not have disabled or readonly attributes', () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i);

      expect(titleInput).not.toBeDisabled();
      expect(titleInput).not.toHaveAttribute('readonly');
    });

    it('should have correct input types', () => {
      render(<EventModal isOpen={true} {...mockHandlers} />);

      const titleInput = screen.getByLabelText(/Titel/i);
      const startInput = screen.getByLabelText(/Startzeit/i);
      const descriptionInput = screen.getByLabelText(/Beschreibung/i);

      expect(titleInput).toHaveAttribute('type', 'text');
      expect(startInput).toHaveAttribute('type', 'datetime-local');
      expect(descriptionInput.tagName.toLowerCase()).toBe('textarea');
    });
  });
});
