import Head from 'next/head'
import Link from 'next/link'
import { tokens } from '../lib/designTokens'

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>SMVBoard — Dashboard</title>
      </Head>
      <main className="min-h-screen bg-smvbg text-white p-6">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">SMVBoard</h1>
          <div className="flex items-center gap-4">
            <button className="px-3 py-2 bg-card rounded">Org: MeineSchule</button>
            <button className="px-3 py-2 bg-accent rounded" style={{ background: tokens.colors.accent }}>Upgrade</button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg">
            <h2 className="text-lg font-semibold">Kontostand</h2>
            <p className="text-3xl mt-4">€ 3.420,50</p>
            <div className="mt-4 flex gap-2">
              <Link href="/finances/accounts"><a className="px-3 py-2 bg-accent rounded">Zur Finanzen</a></Link>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg md:col-span-2">
            <h2 className="text-lg font-semibold">Letzte Transaktionen</h2>
            <ul className="mt-4 divide-y divide-gray-800">
              <li className="py-3 flex justify-between">
                <div>
                  <div className="font-medium">Beamerkauf</div>
                  <div className="text-sm text-gray-400">Hardware • 2025-01-10</div>
                </div>
                <div className="text-right">- € 350,00</div>
              </li>
              <li className="py-3 flex justify-between">
                <div>
                  <div className="font-medium">Spendenlauf Einnahme</div>
                  <div className="text-sm text-gray-400">Event • 2025-01-05</div>
                </div>
                <div className="text-right">+ € 1.200,00</div>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  )
}