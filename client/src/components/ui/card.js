import React from 'react';

export const Card = ({ children, className }) => (
  <div className={`bg-white shadow-lg rounded-lg ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={`px-4 py-2 border-b ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className }) => (
  <div className={`px-4 py-2 ${className}`}>
    {children}
  </div>
);
