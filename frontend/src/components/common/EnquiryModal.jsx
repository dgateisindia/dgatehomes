import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import PropertyEnquiryForm from '../property/PropertyEnquiryForm';

/**
 * Reusable Lead & Property Enquiry Modal.
 * Embeds the "Speak With Specialist" form with high-priority z-index (9998/9999),
 * 360Realtors-style dark blurred backdrop, keyboard Escape close,
 * backdrop click close, and body scroll lock.
 */
export default function EnquiryModal({ isOpen, onClose, property }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Lock background body scroll when enquiry modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key to close modal & focus management
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="property-enquiry-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.50)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalBackdropFade 0.22s ease-out',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={property?.title ? `Enquiry for ${property.title}` : 'Speak With Specialist'}
        tabIndex={-1}
        className="property-enquiry-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 9999,
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          animation: 'modalDialogScale 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
        }}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close enquiry modal"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-black)',
            cursor: 'pointer',
            zIndex: 20,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-border)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={18} />
        </button>

        {/* Reused Existing "Speak With Specialist" Component */}
        <PropertyEnquiryForm
          key={property?.id || property?.slug || 'generic-enquiry'}
          property={property}
        />
      </div>

      <style>{`
        @keyframes modalBackdropFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalDialogScale {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 640px) {
          .property-enquiry-modal-backdrop {
            padding: 12px !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .property-enquiry-modal-dialog {
            width: calc(100% - 24px) !important;
            max-width: calc(100% - 24px) !important;
            max-height: calc(100vh - 24px) !important;
            overflow-y: auto !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .property-enquiry-modal-backdrop,
          .property-enquiry-modal-dialog {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
