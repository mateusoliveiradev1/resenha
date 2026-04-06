import * as React from "react";
import { cn } from "../utils/cn";
import { Input, type InputProps } from "../primitives/Input";

export interface FormFieldProps extends Omit<InputProps, 'id'> {
    label: string;
    error?: boolean;
    errorMessage?: string;
    id: string; // id is required for a11y linking label to input
    helperText?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, error, errorMessage, helperText, className, id, ...props }, ref) => {
        const hasError = error || !!errorMessage;

        return (
            <div className={cn("space-y-2", className)}>
                <label
                    htmlFor={id}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        hasError ? "text-red-500" : "text-cream-100"
                    )}
                >
                    {label}
                </label>

                <Input
                    id={id}
                    ref={ref}
                    error={hasError}
                    aria-invalid={hasError ? "true" : "false"}
                    aria-describedby={hasError && errorMessage ? `${id}-error` : helperText ? `${id}-description` : undefined}
                    {...props}
                />

                {hasError && errorMessage && (
                    <p id={`${id}-error`} className="text-[0.8rem] font-medium text-red-500">
                        {errorMessage}
                    </p>
                )}

                {!hasError && helperText && (
                    <p id={`${id}-description`} className="text-[0.8rem] text-cream-300">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);
FormField.displayName = "FormField";
