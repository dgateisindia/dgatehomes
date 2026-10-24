import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Send, CheckCircle2, AlertCircle, Building2, ShieldCheck } from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { enquiryService } from '../../services/enquiryService';
import { CONTACT_CONFIG } from '../../config/contact';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PropertyEnquiryForm({ property }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: property?.title
      ? `I am interested in "${property.title}". Please send me the complete brochure, floor plan, and site visit schedule.`
      : '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [enquiryId, setEnquiryId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Synchronize form context whenever active property changes
  useEffect(() => {
    if (property) {
      setFormData((prev) => ({
        ...prev,
        message: property.title
          ? `I am interested in "${property.title}". Please send me the complete brochure, floor plan, and site visit schedule.`
          : '',
      }));
      setError(null);
      setSuccess(false);
      setEnquiryId(null);
      setValidationErrors({});
    }
  }, [property?.id, property?.title]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!PHONE_REGEX.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (min 7 digits)';
    }

    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const propertyId = property?.id || 1;

    setLoading(true);
    setError(null);

    const payload = {
      property_id: propertyId,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() ? formData.email.trim() : undefined,
      message: formData.message.trim() ? formData.message.trim() : undefined,
      source: property?.id ? 'property-card' : 'property-detail-page',
    };

    try {
      const res = await enquiryService.submitEnquiry(payload);
      if (res && res.success) {
        setSuccess(true);
        setEnquiryId(res.data?.enquiryId);
        // Clear form after successful submission
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: '',
        });
        setValidationErrors({});
      } else {
        throw new Error(res?.message || 'Failed to submit enquiry');
      }
    } catch (err) {
      console.error('Enquiry submission error:', err);
      setError(err.message || 'Unable to submit enquiry. Please try again or call our specialist directly.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = CONTACT_CONFIG.getWhatsAppUrl(property?.title, property?.slug);
  const telUrl = CONTACT_CONFIG.getTelUrl();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        padding: '2rem',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-yellow-light)',
            color: 'var(--color-yellow-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Building2 size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-black)' }}>
            Speak With Specialist
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Direct developer liaison, transparent pricing, and zero brokerage assistance.
      </p>

      {/* 10. Direct Instant CTAs: Call & WhatsApp */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <a
          href={telUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontSize: '0.88rem',
            fontWeight: '700',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-black)';
          }}
        >
          <Phone size={16} style={{ color: 'var(--color-yellow-primary)' }} />
          <span>Call Now</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            fontSize: '0.88rem',
            fontWeight: '700',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)',
            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1EBE5D';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#25D366';
          }}
        >
          <MessageCircle size={16} />
          <span>WhatsApp</span>
        </a>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1.25rem 0',
          color: 'var(--color-text-muted)',
          fontSize: '0.78rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        <span>Or Send Query</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
      </div>

      {/* Success State Notification */}
      {success && (
        <div
          style={{
            backgroundColor: 'var(--color-yellow-subtle)',
            border: '1.5px solid var(--color-yellow-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-yellow-primary)',
              color: 'var(--color-black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-black)', marginBottom: '0.35rem' }}>
            Enquiry Received!
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Thank you! Our dedicated property specialist will contact you with full brochure details shortly.
          </p>
          {enquiryId && (
            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--color-black)',
              }}
            >
              Reference ID: #{enquiryId}
            </span>
          )}
        </div>
      )}

      {/* Safe Error Notification */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #f87171',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            color: '#991b1b',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Lead Enquiry Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
            Your Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (validationErrors.name) setValidationErrors({ ...validationErrors, name: null });
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${validationErrors.name ? '#ef4444' : 'var(--color-border)'}`,
              fontSize: '0.92rem',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = validationErrors.name ? '#ef4444' : 'var(--color-border)')}
          />
          {validationErrors.name && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', marginTop: '0.2rem' }}>
              {validationErrors.name}
            </span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
            Phone Number <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (validationErrors.phone) setValidationErrors({ ...validationErrors, phone: null });
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${validationErrors.phone ? '#ef4444' : 'var(--color-border)'}`,
              fontSize: '0.92rem',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = validationErrors.phone ? '#ef4444' : 'var(--color-border)')}
          />
          {validationErrors.phone && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', marginTop: '0.2rem' }}>
              {validationErrors.phone}
            </span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
            Email Address (Optional)
          </label>
          <input
            type="email"
            placeholder="e.g. rahul@example.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (validationErrors.email) setValidationErrors({ ...validationErrors, email: null });
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${validationErrors.email ? '#ef4444' : 'var(--color-border)'}`,
              fontSize: '0.92rem',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = validationErrors.email ? '#ef4444' : 'var(--color-border)')}
          />
          {validationErrors.email && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', marginTop: '0.2rem' }}>
              {validationErrors.email}
            </span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
            Message / Requirements
          </label>
          <textarea
            rows={3}
            placeholder="Share your specific questions or site visit preferences..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontSize: '0.92rem',
              outline: 'none',
              resize: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-yellow-primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <PrimaryButton
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            loading={loading}
            disabled={loading}
            icon={Send}
            iconPosition="right"
          >
            Enquire Now
          </PrimaryButton>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            fontSize: '0.74rem',
            color: 'var(--color-text-muted)',
            marginTop: '0.25rem',
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--color-yellow-primary)' }} />
          <span>Your privacy is safeguarded. No spam guarantee.</span>
        </div>
      </form>
    </div>
  );
}
