import { Component, ErrorInfo, ReactNode } from 'react';

interface AnimationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AnimationErrorBoundaryState {
  hasError: boolean;
  disableAnimations: boolean;
}

/**
 * Special error boundary for graceful degradation of animations
 * If animations cause errors, they will be disabled and content shown without them
 */
export class AnimationErrorBoundary extends Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  constructor(props: AnimationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      disableAnimations: false,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<AnimationErrorBoundaryState> {
    return {
      hasError: true,
      disableAnimations: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log animation errors
    console.warn('Animation error caught, disabling animations:', error, errorInfo);

    // Store preference to disable animations
    try {
      localStorage.setItem('disableAnimations', 'true');
    } catch (e) {
      console.warn('Could not save animation preference:', e);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Return fallback or children without animation wrapper
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Try to render children in a non-animated context
      return <div data-animations-disabled="true">{this.props.children}</div>;
    }

    return this.props.children;
  }
}
