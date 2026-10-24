import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, useClerk } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Building,
  MessageSquare,
  Sparkles,
  FolderTree,
  Tag,
  Landmark,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  History,
  ShieldAlert,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import DgateLogo from '../components/common/DgateLogo';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Properties', path: '/admin/properties', icon: Building },
  { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
  { label: 'Amenities', path: '/admin/amenities', icon: Sparkles },
  { label: 'Property Types', path: '/admin/property-types', icon: FolderTree },
  { label: 'Tags', path: '/admin/tags', icon: Tag },
  { label: 'Projects', path: '/admin/projects', icon: Landmark },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: History, superAdminOnly: true },
  { label: 'Security Events', path: '/admin/security-events', icon: ShieldAlert, superAdminOnly: true },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useClerk();
  const { adminProfile, user } = useAdminAuth();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || adminProfile?.role === 'super_admin'
  );

  const currentNav =
    visibleNavItems.find((item) =>
      item.path === '/admin'
        ? location.pathname === '/admin'
        : location.pathname.startsWith(item.path)
    ) || visibleNavItems[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-brand-beige)' }}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--color-brand-navy)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          borderRight: '1px solid rgba(221, 217, 207, 0.15)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(0)',
          transition: 'transform 0.25s ease-in-out',
        }}
        className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(221, 217, 207, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.45rem', textDecoration: 'none' }}
          >
            <DgateLogo variant="adminSidebar" />
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--color-brand-yellow)', letterSpacing: '0.8px', textTransform: 'uppercase', paddingLeft: '2px', lineHeight: 1 }}>
              Admin Portal
            </span>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-close-btn"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 0.75rem 0.6rem' }}>
            Main Menu
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.68rem 0.85rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                      backgroundColor: isActive ? 'rgba(249, 179, 24, 0.16)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--color-brand-yellow)' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-brand-navy-light)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                      }
                    }}
                  >
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? 'var(--color-brand-yellow)' : 'rgba(255, 255, 255, 0.6)',
                        flexShrink: 0,
                      }}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer: Quick Public Site Link & Status */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(221, 217, 207, 0.12)',
            backgroundColor: 'var(--color-brand-navy-hover)',
          }}
        >
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '0.5rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          >
            <span>Live Public Site</span>
            <ExternalLink size={13} style={{ color: 'var(--color-brand-yellow)' }} />
          </Link>
        </div>
      </aside>

      {/* Main Wrapper (Header + Content Canvas) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main-wrapper">
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--color-brand-navy)',
            borderBottom: '1px solid rgba(221, 217, 207, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-hamburger-btn"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'none',
              }}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>Admin</span>
              <ChevronRight size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <span style={{ color: '#ffffff', fontWeight: '700' }}>{currentNav.label}</span>
            </div>
          </div>

          {/* Right: Admin profile pill, UserButton & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }} className="admin-header-user-info">
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', lineHeight: 1.2 }}>
                {adminProfile?.displayName || user?.fullName || 'Administrator'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: 'var(--color-brand-yellow)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {adminProfile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>

            {/* Clerk User Button */}
            <UserButton afterSignOutUrl="/admin/login" />

            {/* Explicit Sign Out Button */}
            <button
              onClick={() => signOut()}
              title="Sign Out"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '0.42rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <LogOut size={14} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <main style={{ flex: 1, backgroundColor: 'var(--color-brand-beige)', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>

      {/* Responsive Layout Styles */}
      <style>{`
        .admin-main-wrapper {
          margin-left: 260px;
        }
        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%) !important;
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .admin-main-wrapper {
            margin-left: 0 !important;
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .admin-header-user-info {
            display: none !important;
          }
          .logout-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
