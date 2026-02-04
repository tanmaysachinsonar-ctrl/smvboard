import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  async function fetchMembers() {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch('/api/v1/members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <Layout>
      <Head>
        <title>Mitglieder - SMVBoard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mitglieder</h1>
          <Link href="/members/new" className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition">
            + Neues Mitglied
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Lädt...</div>
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
                    {member.position && (
                      <p className="text-sm text-gray-400">{member.position}</p>
                    )}
                  </div>
                </div>
                {(member.email || member.phone) && (
                  <div className="mt-4 space-y-1 text-sm">
                    {member.email && <p className="text-gray-400">📧 {member.email}</p>}
                    {member.phone && <p className="text-gray-400">📞 {member.phone}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
