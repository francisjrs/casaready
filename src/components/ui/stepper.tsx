'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  completed?: boolean;
  current?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const { locale } = useLanguage();

  return (
    <nav className={cn('w-full', className)} aria-label="Progress">
      {/* Mobile View - Compact */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {steps[currentStep]?.title[locale]}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {steps[currentStep]?.description[locale]}
          </p>
        </div>
      </div>

      {/* Desktop View - Full Stepper */}
      <div className="hidden md:block">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <li
                key={step.id}
                className={cn(
                  'flex items-center',
                  index !== steps.length - 1 && 'flex-1'
                )}
              >
                {/* Step Circle */}
                <div className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200',
                      {
                        'bg-brand-600 border-brand-600 text-white': isCompleted || isCurrent,
                        'bg-background border-muted-foreground text-muted-foreground': isUpcoming
                      }
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="ml-4 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors',
                        {
                          'text-brand-600': isCompleted || isCurrent,
                          'text-muted-foreground': isUpcoming
                        }
                      )}
                    >
                      {step.title[locale]}
                    </p>
                    <p
                      className={cn(
                        'text-sm transition-colors',
                        {
                          'text-muted-foreground': isCompleted || isCurrent,
                          'text-muted-foreground/60': isUpcoming
                        }
                      )}
                    >
                      {step.description[locale]}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 transition-colors duration-200',
                      {
                        'bg-brand-600': index < currentStep,
                        'bg-muted': index >= currentStep
                      }
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Progress Percentage */}
        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
      </div>
    </nav>
  );
}

// Compact stepper for smaller spaces
interface CompactStepperProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

export function CompactStepper({ totalSteps, currentStep, className }: CompactStepperProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${Math.round(progress)}% complete`}
        />
      </div>
    </div>
  );
}

// Step indicator dots for minimal UI
interface StepDotsProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
  onStepClick?: (step: number) => void;
}

export function StepDots({ totalSteps, currentStep, className, onStepClick }: StepDotsProps) {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <button
            key={index}
            onClick={() => onStepClick?.(index)}
            disabled={!onStepClick}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-200',
              {
                'bg-brand-600': isCompleted || isCurrent,
                'bg-muted': !isCompleted && !isCurrent,
                'scale-125': isCurrent,
                'cursor-pointer hover:scale-110': onStepClick,
                'cursor-default': !onStepClick
              }
            )}
            aria-label={`Step ${index + 1}${isCurrent ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
          />
        );
      })}
    </div>
  );
}