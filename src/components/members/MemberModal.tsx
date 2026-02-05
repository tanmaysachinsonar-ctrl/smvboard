import React, { useState, useEffect } from 'react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<void>;
  member?: Member | null;
  mode: 'create' | 'edit';
}

interface Member {
  id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export interface MemberFormData {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
}

export default function MemberModal({ isOpen, onClose, onSubmit, member, mode }: MemberModalProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    position: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member && mode === 'edit') {
      setFormData({
        name: member.name,
        position: member.position || '',
        email: member.email || '',
        phone: member.phone || '',
      });
    } else {
      setFormData({
        name: '',
        position: '',
        email: '',
        phone: '',
      });
    }
    setError(null);
  }, [member, mode, isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Neues Mitglied hinzufügen' : 'Mitglied bearbeiten'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Max Mustermann"
            />
          </div>

          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-1">
              Position
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="z.B. Schülersprecher, Kassenwart"
            />
          </div>

          {/* E-Mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="max@schule.de"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-smvbg border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="+49 123 456789"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-accent hover:bg-accentHover disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md transition font-medium"
            >
              {loading ? 'Speichert...' : mode === 'create' ? 'Hinzufügen' : 'Speichern'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-md transition"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
