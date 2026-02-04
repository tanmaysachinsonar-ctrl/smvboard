import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/dashboard',
    query: {},
    asPath: '/dashboard',
  })),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

describe('Layout Component', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children without nav when user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should render navigation when user is logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
        orgId: 'org123',
      },
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <Layout>
        <div>Dashboard Content</div>
      </Layout>
    );

    // Check that navigation items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Finanzen')).toBeInTheDocument();
    expect(screen.getByText('Mitglieder')).toBeInTheDocument();
    expect(screen.getByText('Kalender')).toBeInTheDocument();
  });

  it('should display user name in navigation', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        orgId: 'org123',
      },
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render footer with legal links', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'OWNER',
        orgId: 'org123',
      },
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('AGB')).toBeInTheDocument();
    expect(screen.getByText('Datenschutz')).toBeInTheDocument();
    expect(screen.getByText('Impressum')).toBeInTheDocument();
  });

  it('should render children content', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      signOut: mockSignOut,
    });

    render(
      <Layout>
        <h1>Page Title</h1>
        <p>Page Content</p>
      </Layout>
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
