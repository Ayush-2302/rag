import React, { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { getCollections } from './api/ragApi';
import BackendChat from './components/BackendChat';
import RagAppChat from './components/RagAppChat';
import DocumentIndexer from './components/DocumentIndexer';
import Overview from './components/Overview';
import UserManagement from './components/UserManagement';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Toaster, toast } from 'sonner';
import {
  StatusDot,
  Button,
  Badge,
} from './components/ui';
import {
  DatabaseIcon,
  FileTextIcon,
  HomeIcon,
  MenuIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
} from './components/icons';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: HomeIcon, end: true },
  { to: '/indexer', label: 'Indexer', icon: UploadIcon },
  { to: '/backend', label: 'MongoDB search', icon: DatabaseIcon },
  { to: '/rag-app', label: 'PostgreSQL search', icon: FileTextIcon },
];

const WORKSPACE_LABELS = {
  mongo: 'MongoDB',
  postgres: 'PostgreSQL',
};

/* Lightweight check driven whenever authentication or session status updates. */
function useBackendStatus(user) {
  const [status, setStatus] = useState({ mongo: 'loading', postgres: 'loading' });

  useEffect(() => {
    let alive = true;
    getCollections()
      .then((cols) => {
        if (!alive) return;
        setStatus({
          mongo: Array.isArray(cols?.mongo) ? 'ok' : 'down',
          postgres: Array.isArray(cols?.postgres) ? 'ok' : 'down',
        });
      })
      .catch(() => {
        if (alive) setStatus({ mongo: 'down', postgres: 'down' });
      });
    return () => {
      alive = false;
    };
  }, [user]);

  return status;
}

function SidebarContent({ onNavigate, backendStatus }) {
  const { user, isAuthenticated, isAdmin, openLogin, openRegister, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Product identity */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary shadow-sm">
          <FileTextIcon size={15} className="text-text-inverse" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-text-primary">Docubase</p>
          <p className="text-xs text-text-muted">Enterprise RAG Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Workspace
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`
                }
              >
                <item.icon size={16} className="shrink-0 text-current" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          {isAdmin && (
            <li key="/users">
              <NavLink
                to="/users"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-soft text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`
                }
              >
                <UsersIcon size={16} className="shrink-0 text-current" />
                <span>User management</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* User Session & Role Card */}
      <div className="border-t border-border p-3.5 bg-surface-soft/60">
        {isAuthenticated ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-text-inverse uppercase shadow-sm">
                  {user?.username?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-semibold text-text-primary">{user?.username}</p>
                  <p className="text-xs text-text-muted capitalize">{user?.role} Role</p>
                </div>
              </div>
              <Badge variant={isAdmin ? 'primary' : 'secondary'}>
                {user?.role}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                logout();
                toast.info('Signed out successfully');
              }}
              className="w-full text-text-muted hover:text-text-primary"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="leading-tight">
              <p className="text-xs font-semibold text-text-primary">Account Access</p>
              <p className="text-xs text-text-muted">Sign in to query or index</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="xs"
                onClick={openLogin}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant="secondary"
                size="xs"
                onClick={openRegister}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer: environment info + support */}
      <div className="border-t border-border px-4 py-3.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status</p>
        <div className="mt-2 space-y-1.5">
          {Object.entries(WORKSPACE_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <StatusDot tone={backendStatus[key] === 'ok' ? 'success' : 'danger'}>{label}</StatusDot>
              <span className="text-text-muted">{backendStatus[key] === 'ok' ? 'Connected' : 'Offline'}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-border-light pt-2.5 text-xs">
          <p className="font-medium text-text-secondary">Docubase RAG</p>
        </div>
      </div>
    </div>
  );
}

function MainAppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, openLogin, isAuthenticated } = useAuth();
  const backendStatus = useBackendStatus(user);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-surface lg:block shadow-sm">
        <SidebarContent backendStatus={backendStatus} />
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-surface shadow-2xl">
            <SidebarContent backendStatus={backendStatus} onNavigate={() => setMobileNavOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-2 top-2 rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-primary"
              aria-label="Close navigation"
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-md p-1.5 text-text-secondary hover:bg-surface-hover"
              aria-label="Open navigation"
            >
              <MenuIcon size={18} />
            </button>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary">
              <FileTextIcon size={15} className="text-text-inverse" />
            </span>
            <span className="text-sm font-bold text-text-primary">Docubase</span>
          </div>

          {!isAuthenticated && (
            <Button
              variant="primary"
              size="xs"
              onClick={openLogin}
            >
              Sign In
            </Button>
          )}
        </header>

        <main className="flex min-w-0 flex-1 flex-col">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/indexer" element={<DocumentIndexer />} />
            <Route path="/backend" element={<BackendChat />} />
            <Route path="/rag-app" element={<RagAppChat />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>

      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppLayout />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
