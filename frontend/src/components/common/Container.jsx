import React from 'react';

/**
 * Responsive centered container component.
 */
export default function Container({ children, className = '', fluid = false, style = {} }) {
  const containerStyle = {
    width: '100%',
    maxWidth: fluid ? '100%' : 'var(--container-max)',
    margin: '0 auto',
    paddingLeft: '1.25rem',
    paddingRight: '1.25rem',
    ...style,
  };

  return (
    <div className={`container-wrap ${className}`} style={containerStyle}>
      {children}
    </div>
  );
}
