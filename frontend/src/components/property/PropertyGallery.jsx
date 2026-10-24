import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';

const FALLBACK_MAIN =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

export default function PropertyGallery({ images = [], title = 'Luxury Property' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no images provided, prepare single fallback image object
  const galleryImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 'fallback-1',
            image_url: FALLBACK_MAIN,
            caption: 'Main Exterior View',
            is_cover: 1,
          },
        ];

  const currentImage = galleryImages[activeIndex] || galleryImages[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-white)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '2rem',
      }}
    >
      {/* Large Main Image Display */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '58%', // 16:9.3 luxury landscape aspect ratio
          backgroundColor: '#0a0a0a',
          overflow: 'hidden',
        }}
      >
        <img
          src={currentImage.image_url}
          alt={currentImage.caption || currentImage.alt_text || title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.25s ease-in-out',
          }}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_MAIN;
          }}
        />

        {/* Gradient shadow for contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Badges on top of Main Image */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 2,
          }}
        >
          {Boolean(currentImage.is_cover) && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: 'var(--color-yellow-primary)',
                color: 'var(--color-black)',
                fontWeight: '800',
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Sparkles size={12} /> COVER PHOTO
            </span>
          )}

          {currentImage.caption && (
            <span
              style={{
                backgroundColor: 'rgba(10, 10, 10, 0.75)',
                backdropFilter: 'blur(4px)',
                color: 'var(--color-white)',
                fontWeight: '600',
                fontSize: '0.75rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {currentImage.caption}
            </span>
          )}
        </div>

        {/* Photo Counter Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            color: 'var(--color-white)',
            fontSize: '0.78rem',
            fontWeight: '700',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            zIndex: 2,
          }}
        >
          <ImageIcon size={14} />
          <span>
            {activeIndex + 1} / {galleryImages.length}
          </span>
        </div>

        {/* Previous & Next Arrows (if > 1 image) */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--color-black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                zIndex: 3,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-yellow-primary)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: 'var(--color-black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                zIndex: 3,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-yellow-primary)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Bar */}
      {galleryImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem',
            overflowX: 'auto',
            backgroundColor: 'var(--color-bg-subtle)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {galleryImages.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  position: 'relative',
                  width: '90px',
                  height: '62px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: isSelected
                    ? '2.5px solid var(--color-yellow-primary)'
                    : '1px solid var(--color-border)',
                  opacity: isSelected ? 1 : 0.65,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.15s',
                  padding: 0,
                  backgroundColor: '#e5e7eb',
                }}
              >
                <img
                  src={img.image_url}
                  alt={img.caption || `Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_MAIN;
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
