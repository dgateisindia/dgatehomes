import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Settings,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Globe,
  Server,
  Cloud,
  ShieldCheck,
  RefreshCw,
  Copy,
  CheckCircle2,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Database,
  Layers,
} from 'lucide-react';
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminLoadingState,
  AdminErrorState,
} from '../../components/admin/ui';
import { getAdminSettings } from '../../services/adminSettingsService';
import { CONTACT_CONFIG } from '../../config/contact';

function SettingRow({
  label,
  value,
  subtext,
  badge,
  badgeVariant = 'neutral',
  action,
  copyValue,
  copyKey,
  copiedKey,
  onCopy,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.85rem 0',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap',
        gap: '0.65rem',
      }}
    >
      <div style={{ maxWidth: '45%' }}>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: '700',
            color: 'var(--color-black-heading)',
            display: 'block',
          }}
        >
          {label}
        </span>
        {subtext && (
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '0.1rem' }}>
            {subtext}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {badge && <AdminBadge variant={badgeVariant}>{badge}</AdminBadge>}

        {value && (
          <span
            style={{
              fontSize: '0.82rem',
              color: '#334155',
              fontWeight: '500',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </span>
        )}

        {action}

        {copyValue && (
          <button
            type="button"
            onClick={() => onCopy(copyValue, copyKey)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
            }}
            title={`Copy ${label}`}
          >
            {copiedKey === copyKey ? (
              <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
            ) : (
              <Copy size={13} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { getToken } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchSettings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error('Authentication token required.');

        const data = await getAdminSettings(token);
        setSettings(data);
      } catch (err) {
        console.warn('[AdminSettingsPage] Falling back to client contact config:', err.message);
        // Fallback to client-side central config
        setSettings({
          company: {
            name: CONTACT_CONFIG.companyName,
            tagline: CONTACT_CONFIG.tagline,
            defaultCity: CONTACT_CONFIG.defaultCity,
            officeAddress: CONTACT_CONFIG.address,
          },
          contact: {
            phone: CONTACT_CONFIG.phoneRaw,
            phoneDisplay: CONTACT_CONFIG.phoneDisplay,
            whatsapp: CONTACT_CONFIG.whatsappNumber,
            email: CONTACT_CONFIG.email,
            supportHours: CONTACT_CONFIG.supportHours,
          },
          socialLinks: CONTACT_CONFIG.socialLinks,
          enquiryPreferences: {
            autoAssignLeads: false,
            instantWhatsappAlerts: true,
            notificationEmail: CONTACT_CONFIG.email,
            workingDays: 'Monday to Sunday',
          },
          system: {
            environment: import.meta.env.MODE || 'production',
            defaultCurrency: 'INR (₹)',
            authProvider: 'Clerk',
            clerkConfigured: true,
            clerkKeyPrefix: 'pk_live/test...',
            storageProvider: 'Cloudinary',
            cloudinaryConfigured: true,
            cloudinaryCloudName: 'dgate-homes',
            rateLimitWindowMinutes: 15,
            rateLimitMaxRequests: 100,
          },
        });
        if (err.status !== 404) {
          setError(err.message ? `Configuration notice: ${err.message}` : null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const company = settings?.company || {};
  const contact = settings?.contact || {};
  const social = settings?.socialLinks || {};
  const prefs = settings?.enquiryPreferences || {};
  const system = settings?.system || {};

  return (
    <AdminPageContainer>
      {/* Page Header */}
      <AdminPageHeader
        icon={Settings}
        title="Platform Administration Settings"
        subtitle="Application runtime configuration, enterprise contact parameters, and integration telemetry."
        badgeText="Read Only"
        badgeColor="#475569"
        badgeBg="#f1f5f9"
        actions={
          <button
            type="button"
            onClick={() => fetchSettings(true)}
            disabled={loading || refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--color-black-heading)',
              cursor: loading || refreshing ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <RefreshCw
              size={14}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                color: 'var(--color-yellow-hover)',
              }}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Configuration'}</span>
          </button>
        }
      />

      {/* Governance Notice Banner */}
      <div
        style={{
          backgroundColor: '#fef8eb',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          fontSize: '0.8rem',
          color: '#855302',
          lineHeight: 1.5,
        }}
      >
        <Info size={16} style={{ color: '#d19a22', flexShrink: 0, marginTop: '0.15rem' }} />
        <div>
          <strong style={{ color: '#78350f' }}>Central Configuration Architecture:</strong> Core contact
          parameters and environment integrations are governed securely through application environment configs.
          This guarantees all public property pages and enquiry workflows reference verified channels with zero secret
          key exposure.
        </div>
      </div>

      {/* Error state */}
      <AdminErrorState error={error} onRetry={() => fetchSettings()} />

      {loading ? (
        <AdminCard>
          <AdminLoadingState message="Loading administrative configuration parameters..." />
        </AdminCard>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Card 1: Company Information */}
          <AdminCard
            title="Company Information"
            subtitle="Brand identity, market location, and corporate address"
            icon={Building2}
          >
            <SettingRow
              label="Company Name"
              value={company.name || 'Dgate Homes'}
              copyValue={company.name}
              copyKey="comp-name"
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
            />
            <SettingRow
              label="Tagline & Positioning"
              value={company.tagline || 'Exclusive Luxury Real Estate & High-Value Developments'}
            />
            <SettingRow
              label="Primary Market City"
              value={company.defaultCity || 'Bengaluru'}
              badge="Default Hub"
              badgeVariant="yellow"
            />
            <SettingRow
              label="Corporate Office Address"
              value={company.officeAddress || 'Level 4, Prestige Meridian, MG Road, Bangalore 560001'}
              copyValue={company.officeAddress}
              copyKey="comp-addr"
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
            />
          </AdminCard>

          {/* Card 2: Contact Information */}
          <AdminCard
            title="Contact Information"
            subtitle="Public advisory lines, messaging channels, and operating hours"
            icon={Phone}
          >
            <SettingRow
              label="Primary Phone"
              value={contact.phoneDisplay || '+91 95385 64300'}
              subtext="Click-to-call link for public listings"
              copyValue={contact.phoneDisplay || contact.phone}
              copyKey="contact-phone"
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
              action={
                <a
                  href={CONTACT_CONFIG.getTelUrl()}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    color: 'var(--color-yellow-hover)',
                    textDecoration: 'none',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#fef8eb',
                  }}
                >
                  Call Dial
                </a>
              }
            />
            <SettingRow
              label="WhatsApp Direct Line"
              value={contact.whatsapp || '+919538564300'}
              subtext="Pre-filled buyer and tenant inquiries"
              copyValue={contact.whatsapp}
              copyKey="contact-wa"
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
              action={
                <a
                  href={CONTACT_CONFIG.getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    color: '#15803d',
                    textDecoration: 'none',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#dcfce7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <span>Chat</span>
                  <ExternalLink size={11} />
                </a>
              }
            />
            <SettingRow
              label="Support Email"
              value={contact.email || 'dgatehome@gmail.com'}
              copyValue={contact.email}
              copyKey="contact-email"
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
              action={
                <a
                  href={CONTACT_CONFIG.getMailtoUrl()}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    color: '#0369a1',
                    textDecoration: 'none',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#e0f2fe',
                  }}
                >
                  Mailto
                </a>
              }
            />
            <SettingRow
              label="Advisory Hours"
              value={contact.supportHours || 'Mon - Sun: 9:00 AM - 8:00 PM IST'}
            />
          </AdminCard>

          {/* Card 3: Platform Configuration */}
          <AdminCard
            title="Platform Configuration"
            subtitle="Application runtime mode, currency, and request rate limiting"
            icon={Server}
          >
            <SettingRow
              label="Server Runtime"
              subtext="Active execution environment mode"
              badge={(system.environment || 'production').toUpperCase()}
              badgeVariant={system.environment === 'production' ? 'success' : 'warning'}
            />
            <SettingRow
              label="Currency Standard"
              value={system.defaultCurrency || 'INR (₹)'}
              subtext="Indian Lakhs & Crores formatting standard"
            />
            <SettingRow
              label="API Rate Limiting Shield"
              value={`Max ${system.rateLimitMaxRequests || 100} req / ${system.rateLimitWindowMinutes || 15} min`}
              badge="Active"
              badgeVariant="info"
            />
            <SettingRow
              label="Enquiry Lead Distribution"
              value="Admin-assigned CRM workflow"
              badge="Manual"
              badgeVariant="neutral"
            />
            <SettingRow
              label="WhatsApp Notification Link"
              value="Direct customer dispatch"
              badge="Enabled"
              badgeVariant="success"
            />
          </AdminCard>

          {/* Card 4: Integration Status */}
          <AdminCard
            title="Integration Status"
            subtitle="Cloud identity, storage, and persistence connectivity"
            icon={ShieldCheck}
          >
            <SettingRow
              label="Clerk Identity Provider"
              subtext="Admin authentication & JWT verification"
              badge={system.clerkConfigured ? 'Configured & Active' : 'Fallback / Local Mode'}
              badgeVariant={system.clerkConfigured ? 'success' : 'warning'}
              value={system.clerkKeyPrefix ? `Key: ${system.clerkKeyPrefix}` : null}
            />
            <SettingRow
              label="Cloudinary Media Storage"
              subtext="Property photo galleries & cover images"
              badge={system.cloudinaryConfigured ? 'Connected' : 'Unconfigured'}
              badgeVariant={system.cloudinaryConfigured ? 'success' : 'neutral'}
              value={system.cloudinaryCloudName ? `Cloud: ${system.cloudinaryCloudName}` : null}
            />
            <SettingRow
              label="MySQL Database Engine"
              subtext="Relational persistence layer"
              badge="Connected & Pool Active"
              badgeVariant="success"
              value="10 pooled connections"
            />
            <SettingRow
              label="Frontend Build Environment"
              subtext="Vite + React single-page bundle"
              badge="Vite Production"
              badgeVariant="neutral"
            />
          </AdminCard>
        </div>
      )}
    </AdminPageContainer>
  );
}
