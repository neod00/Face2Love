import React from 'react';

export const Button = ({ children, className, ...props }: any) => (
  <button className={`px-4 py-2 rounded bg-primary text-primary-foreground ${className}`} {...props}>
    {children}
  </button>
);
