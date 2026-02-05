import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-smvbg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const plans = [
    {
      name: 'Free',
      price: '0€',
      period: 'für immer',
      features: [
        'Bis zu 5 Mitglieder',
        'Basis Event-Management',
        'Einfache Finanzverwaltung',
        'E-Mail Support',
      ],
      current: true,
    },
    {
      name: 'Premium',
      price: '19€',
      period: 'pro Monat',
      features: [
        'Unbegrenzte Mitglieder',
        'Erweiterte Event-Funktionen',
        'Detaillierte Finanzberichte',
        'CSV/PDF Export',
        'Prioritäts-Support',
        'Custom Branding',
      ],
      current: false,
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '49€',
      period: 'pro Monat',
      features: [
        'Alle Premium Features',
        'Multi-Organization Support',
        'API-Zugang',
        'Dedizierter Account Manager',
        'SLA Garantie',
        'Custom Integrations',
      ],
      current: false,
    },
  ];

  return (
    <Layout>
      <Head>
        <title>Premium Upgrade - SMVBoard</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Wählen Sie Ihren Plan</h1>
          <p className="text-xl text-gray-400">
            Erweitern Sie Ihre SMV-Verwaltung mit Premium-Features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card rounded-lg p-8 relative ${
                plan.recommended ? 'border-2 border-accent' : 'border border-gray-800'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent rounded-full text-sm font-medium">
                  Empfohlen
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-700 rounded-md cursor-not-allowed"
                >
                  Aktueller Plan
                </button>
              ) : (
                <button className="w-full px-6 py-3 bg-accent hover:bg-accentHover rounded-md transition font-medium">
                  Upgrade zu {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-card rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Häufig gestellte Fragen</h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">Kann ich jederzeit kündigen?</h3>
              <p className="text-gray-400">
                Ja, Sie können Ihr Abonnement jederzeit kündigen. Es läuft bis zum Ende der
                bezahlten Periode.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Welche Zahlungsmethoden akzeptieren Sie?</h3>
              <p className="text-gray-400">
                Wir akzeptieren alle gängigen Kreditkarten, PayPal und SEPA-Lastschrift.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Kann ich zwischen Plänen wechseln?</h3>
              <p className="text-gray-400">
                Ja, Sie können jederzeit upgraden oder downgraden. Die Abrechnung wird anteilig
                angepasst.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Gibt es eine Geld-zurück-Garantie?</h3>
              <p className="text-gray-400">
                Ja, wir bieten eine 30-Tage Geld-zurück-Garantie auf alle Premium-Pläne.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400">
            Haben Sie Fragen?{' '}
            <a href="mailto:support@smvboard.de" className="text-accent hover:underline">
              Kontaktieren Sie uns
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
