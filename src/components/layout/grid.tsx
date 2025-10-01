import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 6 | 12;
  };
}

const colsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12'
};

const responsiveColsClasses = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12'
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12'
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12'
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12'
  }
};

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12'
};

export function Grid({
  children,
  className,
  cols = 1,
  gap = 'md',
  responsive
}: GridProps) {
  const responsiveClasses = responsive ? Object.entries(responsive).map(([breakpoint, colCount]) => {
    const bp = breakpoint as keyof typeof responsiveColsClasses;
    return responsiveColsClasses[bp][colCount];
  }).join(' ') : '';

  return (
    <div className={cn(
      'grid',
      colsClasses[cols],
      gapClasses[gap],
      responsiveClasses,
      className
    )}>
      {children}
    </div>
  );
}

// Pre-configured grid layouts for common patterns
export function FeatureGrid({ children, className }: Omit<GridProps, 'cols' | 'responsive'>) {
  return (
    <Grid
      cols={1}
      responsive={{ sm: 2, lg: 3 }}
      gap="lg"
      className={className}
    >
      {children}
    </Grid>
  );
}

export function TestimonialGrid({ children, className }: Omit<GridProps, 'cols' | 'responsive'>) {
  return (
    <Grid
      cols={1}
      responsive={{ md: 2, lg: 3 }}
      gap="md"
      className={className}
    >
      {children}
    </Grid>
  );
}

export function ServiceGrid({ children, className }: Omit<GridProps, 'cols' | 'responsive'>) {
  return (
    <Grid
      cols={1}
      responsive={{ sm: 2, xl: 4 }}
      gap="lg"
      className={className}
    >
      {children}
    </Grid>
  );
}

export function TwoColumnGrid({ children, className }: Omit<GridProps, 'cols' | 'responsive'>) {
  return (
    <Grid
      cols={1}
      responsive={{ lg: 2 }}
      gap="xl"
      className={className}
    >
      {children}
    </Grid>
  );
}