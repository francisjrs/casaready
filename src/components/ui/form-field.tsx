'use client';

import React from 'react';
import { UseFormRegister, FieldError, FieldValues, Path } from 'react-hook-form';
import { Label, ErrorText, HelpText } from '@/components/ui/text';
import { FieldError as EnhancedFieldError } from '@/components/ui/enhanced-error-display';
import { cn } from '@/lib/utils';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  register: UseFormRegister<T>;
  error?: FieldError | undefined;
  children?: React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  helpText,
  required = false,
  disabled = false,
  className,
  register,
  error,
  children
}: FormFieldProps<T>) {
  const fieldId = `field-${name}`;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        tKey=""
        fallback={label}
        required={required}
        className="block text-sm font-medium text-foreground"
      />

      {children || (
        <input
          id={fieldId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name, { valueAsNumber: type === 'number' })}
          className={cn(
            'input w-full px-4 py-3 sm:px-3 sm:py-2 transition-all duration-200',
            'border-2 rounded-xl',
            'focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white',
            'hover:border-brand-300',
            error && 'border-destructive focus:ring-destructive focus:border-destructive border-2 bg-red-50/50',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
          )}
          aria-describedby={cn(
            helpText && helpId,
            error && errorId
          )}
          aria-invalid={error ? 'true' : 'false'}
        />
      )}

      {helpText && (
        <HelpText
          id={helpId}
          tKey=""
          fallback={helpText}
          className="text-xs"
        />
      )}

      {error && (
        <EnhancedFieldError
          error={error.message}
          fieldName={name}
        />
      )}
    </div>
  );
}

interface SelectFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'type' | 'children'> {
  options: { value: string; label: string }[];
  defaultOption?: string;
  error?: FieldError | undefined;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  placeholder,
  helpText,
  required = false,
  disabled = false,
  className,
  register,
  error,
  options,
  defaultOption
}: SelectFieldProps<T>) {
  const fieldId = `field-${name}`;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        tKey=""
        fallback={label}
        required={required}
        className="block text-sm font-medium text-foreground"
      />

      <select
        id={fieldId}
        disabled={disabled}
        {...register(name)}
        className={cn(
          'input w-full cursor-pointer px-4 py-3 sm:px-3 sm:py-2 transition-all duration-200',
          'border-2 rounded-xl',
          'focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white',
          'hover:border-brand-300',
          error && 'border-destructive focus:ring-destructive focus:border-destructive border-2 bg-red-50/50',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
        )}
        aria-describedby={cn(
          helpText && helpId,
          error && errorId
        )}
        aria-invalid={error ? 'true' : 'false'}
      >
        {defaultOption && (
          <option value="">{defaultOption}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {helpText && (
        <HelpText
          id={helpId}
          tKey=""
          fallback={helpText}
          className="text-xs"
        />
      )}

      {error && (
        <EnhancedFieldError
          error={error.message}
          fieldName={name}
        />
      )}
    </div>
  );
}

interface CheckboxFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'type' | 'children'> {
  description?: string;
  error?: FieldError | undefined;
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  description,
  helpText,
  disabled = false,
  className,
  register,
  error
}: CheckboxFieldProps<T>) {
  const fieldId = `field-${name}`;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-3">
        <input
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          {...register(name)}
          className={cn(
            'w-5 h-5 mt-1 text-brand-600 border-2 border-gray-300 rounded transition-all duration-200',
            'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
            'hover:border-brand-400',
            'checked:bg-brand-600 checked:border-brand-600',
            error && 'border-destructive focus:ring-destructive',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
          aria-describedby={cn(
            helpText && helpId,
            error && errorId,
            description && `${fieldId}-description`
          )}
          aria-invalid={error ? 'true' : 'false'}
        />

        <div className="flex-1">
          <Label
            htmlFor={fieldId}
            tKey=""
            fallback={label}
            className="text-sm font-medium text-foreground cursor-pointer"
          />

          {description && (
            <p
              id={`${fieldId}-description`}
              className="text-sm text-muted-foreground mt-1"
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {helpText && (
        <HelpText
          id={helpId}
          tKey=""
          fallback={helpText}
          className="text-xs ml-7"
        />
      )}

      {error && (
        <ErrorText
          id={errorId}
          tKey=""
          fallback={error.message}
          className="text-xs ml-7"
        />
      )}
    </div>
  );
}

interface TextareaFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'type' | 'children'> {
  rows?: number;
  maxLength?: number;
  error?: FieldError | undefined;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  helpText,
  required = false,
  disabled = false,
  className,
  register,
  error,
  rows = 4,
  maxLength
}: TextareaFieldProps<T>) {
  const fieldId = `field-${name}`;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        tKey=""
        fallback={label}
        required={required}
        className="block text-sm font-medium text-foreground"
      />

      <textarea
        id={fieldId}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        className={cn(
          'input w-full resize-vertical px-4 py-3 sm:px-3 sm:py-2 transition-all duration-200',
          'border-2 rounded-xl',
          'focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white',
          'hover:border-brand-300',
          error && 'border-destructive focus:ring-destructive focus:border-destructive border-2 bg-red-50/50',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
        )}
        aria-describedby={cn(
          helpText && helpId,
          error && errorId
        )}
        aria-invalid={error ? 'true' : 'false'}
      />

      {helpText && (
        <HelpText
          id={helpId}
          tKey=""
          fallback={helpText}
          className="text-xs"
        />
      )}

      {error && (
        <EnhancedFieldError
          error={error.message}
          fieldName={name}
        />
      )}
    </div>
  );
}