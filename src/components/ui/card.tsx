import React from 'react';

export const Card = ({ children, className }: any) => <div className={`bg-card rounded-xl border border-border ${className}`}>{children}</div>;
export const CardHeader = ({ children, className }: any) => <div className={`p-6 ${className}`}>{children}</div>;
export const CardTitle = ({ children, className }: any) => <h3 className={`text-2xl font-semibold ${className}`}>{children}</h3>;
export const CardDescription = ({ children, className }: any) => <p className={`text-muted-foreground ${className}`}>{children}</p>;
export const CardContent = ({ children, className }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
export const CardFooter = ({ children, className }: any) => <div className={`p-6 pt-0 flex items-center ${className}`}>{children}</div>;
