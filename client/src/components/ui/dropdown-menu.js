import React from 'react';

export const DropdownMenu = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

export const DropdownMenuTrigger = ({ children, asChild }) => (
  <div>
    {children}
  </div>
);

export const DropdownMenuContent = ({ children }) => (
  <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
    {children}
  </div>
);

export const DropdownMenuItem = ({ children, onSelect }) => (
  <div
    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
    onClick={onSelect}
  >
    {children}
  </div>
);
