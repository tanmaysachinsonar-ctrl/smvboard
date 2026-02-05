import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  description: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'GRANT' | 'OTHER';
  balance: number;
  createdAt: string;
  _count: {
    transactions: number;
  };
}

export default function AccountDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id || typeof id !== 'string') return;

    const fetchAccountDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
          throw new Error('Keine Authentifizierung');
        }

        const response = await fetch(`/api/v1/accounts/${id}?includeTransactions=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          setError('Konto nicht gefunden');
          return;
        }

        if (response.status === 403) {
          setError('Zugriff verweigert');
          return;
        }

        if (!response.ok) {
          throw new Error('Fehler beim Laden des Kontos');
        }

        const data = await response.json();
        setAccount(data.account);
        setTransactions(data.transactions || []);
      } catch (err: any) {
        console.error('Error fetching account:', err);
        setError(err.message || 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [user, id]);

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CASH: 'Bargeld',
      BANK: 'Bankkonto',
      GRANT: 'Zuschuss',
      OTHER: 'Sonstiges',
    };
    return labels[type] || type;
  };

  const getTransactionTypeStyle = (type: string) => {
    const styles: Record<string, string> = {
      INCOME: 'text-green-400 bg-green-500/10',
      EXPENSE: 'text-red-400 bg-red-500/10',
      TRANSFER: 'text-blue-400 bg-blue-500/10',
    };
    return styles[type] || 'text-gray-400 bg-gray-500/10';
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INCOME: 'Einnahme',
      EXPENSE: 'Ausgabe',
      TRANSFER: 'Überweisung',
    };
    return labels[type] || type;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Layout>
        <Head>
          <title>Fehler | SMVBoard</title>
        </Head>
        <div className="p-8">
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">{error === 'Konto nicht gefunden' ? '🔍' : '🚫'}</div>
            <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
            <Link
              href="/finances"
              className="inline-block px-6 py-3 bg-accent hover:bg-accentHover text-white rounded-lg transition"
            >
              ← Zurück zu Finanzen
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Konto wird geladen... | SMVBoard</title>
        </Head>
        <div className="p-8">
          <div className="bg-card rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-400">Lade Kontodetails...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>{account.name} | SMVBoard</title>
      </Head>

      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/finances"
              className="text-accent hover:underline mb-2 inline-block text-sm"
            >
              ← Zurück zu Finanzen
            </Link>
            <h1 className="text-3xl font-bold text-white">{account.name}</h1>
            <p className="text-gray-400 mt-1">
              {getAccountTypeLabel(account.type)} · Erstellt am {formatDate(account.createdAt)}
            </p>
          </div>

          {user.role === 'OWNER' && (
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg transition">
                Bearbeiten
              </button>
              <button className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition">
                Löschen
              </button>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-accent to-purple-600 rounded-lg p-8 mb-8 shadow-lg">
          <div className="text-white/80 text-sm mb-2">Aktueller Saldo</div>
          <div className="text-5xl font-bold text-white mb-4">
            {formatCurrency(account.balance)}
          </div>
          <div className="text-white/70 text-sm">
            {account._count.transactions} Transaktion{account._count.transactions !== 1 ? 'en' : ''}
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Transaktionen</h2>
            <Link
              href={`/finances/transactions/new?accountId=${account.id}`}
              className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg transition text-sm"
            >
              + Neue Transaktion
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-gray-400">Noch keine Transaktionen vorhanden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-smvbg">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                      Datum
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                      Beschreibung
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                      Kategorie
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Typ</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">
                      Betrag
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {transaction.category?.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTransactionTypeStyle(transaction.type)}`}
                        >
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-semibold text-right ${
                          transaction.type === 'INCOME'
                            ? 'text-green-400'
                            : transaction.type === 'EXPENSE'
                              ? 'text-red-400'
                              : 'text-gray-300'
                        }`}
                      >
                        {transaction.type === 'INCOME'
                          ? '+'
                          : transaction.type === 'EXPENSE'
                            ? '-'
                            : ''}
                        {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
