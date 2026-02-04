import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  createdAt: string;
  _count: { transactions: number };
}

export default function FinancesPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: 'CASH', balance: 0 });

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  async function fetchAccounts() {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch('/api/v1/accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch('/api/v1/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAccount),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewAccount({ name: '', type: 'CASH', balance: 0 });
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Finanzen - SMVBoard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Finanzen</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition"
          >
            + Neues Konto
          </button>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-accent to-purple-600 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white/80">Gesamtguthaben</h2>
          <p className="text-4xl font-bold mt-2">€ {totalBalance.toFixed(2)}</p>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="text-center py-12">Lädt...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Link key={account.id} href={`/finances/accounts/${account.id}`}>
                <a className="block bg-card rounded-lg p-6 hover:ring-2 hover:ring-accent transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{account.name}</h3>
                      <p className="text-sm text-gray-400">{account.type}</p>
                    </div>
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                      {account._count.transactions} Transaktionen
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-4">€ {account.balance.toFixed(2)}</p>
                </a>
              </Link>
            ))}
          </div>
        )}

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Neues Konto erstellen</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Typ</label>
                  <select
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  >
                    <option value="CASH">Bargeld</option>
                    <option value="BANK">Bank</option>
                    <option value="GRANT">Fördergelder</option>
                    <option value="OTHER">Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Anfangssaldo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-smvbg border border-gray-700 rounded-md"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent hover:bg-accentHover rounded-md transition"
                  >
                    Erstellen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
