import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Finanzen', href: '/finances', icon: '💰' },
    { name: 'Mitglieder', href: '/members', icon: '👥' },
    { name: 'Kalender', href: '/events', icon: '📅' },
    { name: 'Rosenaktion', href: '/roses', icon: '🌹' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-smvbg text-white">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold">
                SMVBoard
              </Link>

              <div className="hidden md:flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      router.pathname.startsWith(item.href)
                        ? 'bg-accent text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user.role === 'OWNER' && (
                <Link
                  href="/subscription"
                  className="px-4 py-2 bg-accent hover:bg-accentHover rounded-md text-sm font-medium transition"
                >
                  Upgrade
                </Link>
              )}

              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 transition">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm">{user.name || user.email}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-800">
                      Profil
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-800">
                      Einstellungen
                    </Link>
                    <hr className="border-gray-800 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 text-red-400"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">© 2026 SMVBoard. Alle Rechte vorbehalten.</p>
            <div className="flex space-x-6">
              <Link href="/legal/terms" className="text-sm text-gray-400 hover:text-white">
                AGB
              </Link>
              <Link href="/legal/privacy" className="text-sm text-gray-400 hover:text-white">
                Datenschutz
              </Link>
              <Link href="/legal/imprint" className="text-sm text-gray-400 hover:text-white">
                Impressum
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
