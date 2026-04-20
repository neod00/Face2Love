import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };
  public static getDerivedStateFromError(_: Error): State { return { hasError: true }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('Error:', error, errorInfo); }
  public render() {
    if (this.state.hasError) return <div className="p-8 text-center"><h1>Something went wrong.</h1></div>;
    return this.props.children;
  }
}
