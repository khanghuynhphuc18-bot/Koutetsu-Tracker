import React from 'react';

export const BrokenShieldIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Broken fracture crack line */}
      <path d="M12 3.5l-2.5 5 4.5 3-3.5 4 2 4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
};
