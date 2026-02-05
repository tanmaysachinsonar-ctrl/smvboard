import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import MemberModal, { MemberFormData } from '../../components/members/MemberModal';

interface Member {
  id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export default function MembersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setError(null);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        setError('Nicht authentifiziert. Bitte melden Sie sich erneut an.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/v1/members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setError('Mitglieder konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
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
      fetchMembers();
    }
  }, [user, fetchMembers]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleCreateMember = () => {
    setSelectedMember(null);
    setShowModal(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleSubmitMember = async (data: MemberFormData) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    if (!token) throw new Error('Nicht authentifiziert');

    if (selectedMember) {
      const response = await fetch(`/api/v1/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Mitglied konnte nicht aktualisiert werden');
      }
    } else {
      const response = await fetch('/api/v1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        throw new Error(errorData.error || 'Mitglied konnte nicht erstellt werden');
      }
    }
    await fetchMembers();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Möchten Sie dieses Mitglied wirklich löschen?')) return;
    setDeleteLoading(memberId);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Nicht authentifiziert');
      const response = await fetch(`/api/v1/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Mitglied konnte nicht gelöscht werden');
      await fetchMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Löschen');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Mitglieder - SMVBoard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mitglieder</h1>
          <button
            onClick={handleCreateMember}
            className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition"
          >
            + Neues Mitglied
          </button>
        </div>

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

        {loading ? (
          <div className="text-center py-12">Lädt...</div>
        ) : members.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Keine Mitglieder vorhanden</h3>
            <p className="text-gray-400 mb-4">Fügen Sie Ihr erstes SMV-Mitglied hinzu.</p>
            <button
              onClick={handleCreateMember}
              className="inline-block px-6 py-3 bg-accent hover:bg-accentHover rounded-md transition"
            >
              Erstes Mitglied hinzufügen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div key={member.id} className="bg-card rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold">
                    {member.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    {member.position && <p className="text-sm text-gray-400">{member.position}</p>}
                  </div>
                </div>
                {(member.email || member.phone) && (
                  <div className="mt-4 space-y-1 text-sm">
                    {member.email && <p className="text-gray-400">📧 {member.email}</p>}
                    {member.phone && <p className="text-gray-400">📞 {member.phone}</p>}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEditMember(member)}
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded transition"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={deleteLoading === member.id}
                    className="px-3 py-1.5 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition disabled:opacity-50"
                  >
                    {deleteLoading === member.id ? '...' : 'Löschen'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MemberModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitMember}
        member={selectedMember}
        mode={selectedMember ? 'edit' : 'create'}
      />
    </Layout>
  );
}
