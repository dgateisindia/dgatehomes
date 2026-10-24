import React from 'react';
import dgateLogoAsset from '../../assets/dgate-homes-logo.png';

/**
 * Official Dgate Homes Brand Logo Component
 *
 * Renders the official Dgate Homes PNG logo asset while strictly preserving
 * its original aspect ratio (1024x723) and color integrity.
 *
 * Variants:
 * - 'header': Public website navigation bar (155px width, 8px 12px padding, 52px height).
 * - 'adminSidebar': Admin panel sidebar (155px width, 6px 10px padding, 10px radius, 50px height).
 * - 'adminLogin': Admin panel login screen (200px width, 6px 12px padding, 12px radius, 64px height).
 * - 'default': Transparent logo element preserving intrinsic aspect ratio.
 * - 'onDark' / 'badge': Clean white container for dark surfaces.
 */
export default function DgateLogo({
  height,
  width,
  onDark = false,
  variant = 'default',
  alt = 'Dgate Homes',
  className = '',
  style = {},
  containerStyle = {},
  ...props
}) {
  // Public website header variant (DO NOT MODIFY: preserved exactly for public navigation)
  if (variant === 'header') {
    return (
      <div
        className={`dgate-logo-card dgate-logo-header ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          lineHeight: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...containerStyle,
        }}
      >
        <img
          src={dgateLogoAsset}
          alt={alt}
          className="dgate-logo-header-img"
          style={{
            aspectRatio: '1024 / 723',
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
            ...style,
          }}
          {...props}
        />
        <style>{`
          .dgate-logo-header {
            height: 52px;
            padding: 8px 12px;
          }
          .dgate-logo-header-img {
            width: ${width ? (typeof width === 'number' ? `${width}px` : width) : '155px'};
          }
          @media (max-width: 640px) {
            .dgate-logo-header {
              height: 46px;
              padding: 6px 10px;
            }
            .dgate-logo-header-img {
              width: ${width ? 'auto' : '130px'};
            }
          }
        `}</style>
      </div>
    );
  }

  // Admin panel sidebar variant: compact, hugging the logo, 155px width, 6px 10px padding, 10px radius
  if (variant === 'adminSidebar' || variant === 'admin') {
    return (
      <div
        className={`dgate-logo-card dgate-logo-admin-sidebar ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.14)',
          lineHeight: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...containerStyle,
        }}
      >
        <img
          src={dgateLogoAsset}
          alt={alt}
          className="dgate-logo-admin-sidebar-img"
          style={{
            aspectRatio: '1024 / 723',
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
            ...style,
          }}
          {...props}
        />
        <style>{`
          .dgate-logo-admin-sidebar {
            height: 50px;
            padding: 6px 10px;
          }
          .dgate-logo-admin-sidebar-img {
            width: ${width ? (typeof width === 'number' ? `${width}px` : width) : '155px'};
          }
          @media (max-width: 640px) {
            .dgate-logo-admin-sidebar {
              height: 44px;
              padding: 5px 8px;
            }
            .dgate-logo-admin-sidebar-img {
              width: ${width ? 'auto' : '135px'};
            }
          }
        `}</style>
      </div>
    );
  }

  // Admin panel login screen variant: larger 200px width, compact 6px 12px padding, 12px radius
  if (variant === 'adminLogin' || variant === 'login') {
    return (
      <div
        className={`dgate-logo-card dgate-logo-admin-login ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
          lineHeight: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...containerStyle,
        }}
      >
        <img
          src={dgateLogoAsset}
          alt={alt}
          className="dgate-logo-admin-login-img"
          style={{
            aspectRatio: '1024 / 723',
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
            ...style,
          }}
          {...props}
        />
        <style>{`
          .dgate-logo-admin-login {
            height: 64px;
            padding: 6px 12px;
          }
          .dgate-logo-admin-login-img {
            width: ${width ? (typeof width === 'number' ? `${width}px` : width) : '200px'};
          }
          @media (max-width: 640px) {
            .dgate-logo-admin-login {
              height: 54px;
              padding: 5px 10px;
            }
            .dgate-logo-admin-login-img {
              width: ${width ? 'auto' : '165px'};
            }
          }
        `}</style>
      </div>
    );
  }

  const isDark = onDark || variant === 'onDark' || variant === 'badge';
  const effectiveHeight = height ?? 44;

  const imageElement = (
    <img
      src={dgateLogoAsset}
      alt={alt}
      className={`dgate-logo-img ${className}`}
      style={{
        height: typeof effectiveHeight === 'number' ? `${effectiveHeight}px` : effectiveHeight,
        width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
        aspectRatio: '1024 / 723',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
      {...props}
    />
  );

  if (isDark) {
    return (
      <div
        className={`dgate-logo-container dgate-logo-on-dark ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          padding: '4px 10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          lineHeight: 0,
          ...containerStyle,
        }}
      >
        {imageElement}
      </div>
    );
  }

  return imageElement;
}
