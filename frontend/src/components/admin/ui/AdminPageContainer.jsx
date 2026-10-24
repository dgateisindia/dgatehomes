import React from 'react';

/**
 * Standardized container wrapper for all admin pages.
 * Ensures max content width (~1400px), consistent page padding, and vertical spacing.
 */
export default function AdminPageContainer({ children, maxWidth = '1400px', style = {} }) {
  return (
    <div
      style={{
        padding: '1.75rem 2rem',
        maxWidth,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
