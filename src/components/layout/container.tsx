import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-8xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12'
};

export function Container({
  children,
  className,
  size = 'lg',
  padding = 'md'
}: ContainerProps) {
  return (
    <div className={cn(
      'mx-auto w-full',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Specialized containers for different sections
export function HeroContainer({ children, className }: Omit<ContainerProps, 'size' | 'padding'>) {
  return (
    <Container
      size="xl"
      padding="lg"
      className={cn('py-16 sm:py-20 lg:py-24', className)}
    >
      {children}
    </Container>
  );
}

export function ContentContainer({ children, className }: Omit<ContainerProps, 'size' | 'padding'>) {
  return (
    <Container
      size="lg"
      padding="md"
      className={cn('py-12 sm:py-16 lg:py-20', className)}
    >
      {children}
    </Container>
  );
}

export function FormContainer({ children, className }: Omit<ContainerProps, 'size' | 'padding'>) {
  return (
    <Container
      size="md"
      padding="md"
      className={cn('py-8 sm:py-12', className)}
    >
      {children}
    </Container>
  );
}