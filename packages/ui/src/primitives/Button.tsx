import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

export const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-blue-600 text-cream-100 shadow hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]",
                destructive: "bg-red-500 text-cream-100 shadow-sm hover:bg-red-600",
                outline: "border border-navy-800 bg-transparent hover:bg-navy-800 text-cream-100",
                secondary: "bg-navy-800 text-cream-100 shadow-sm hover:bg-navy-700 border border-navy-700",
                ghost: "hover:bg-navy-800 hover:text-cream-100 text-cream-300",
                link: "text-blue-500 underline-offset-4 hover:underline",
            },
            size: {
                sm: "h-8 px-3 text-xs",
                md: "h-10 px-4 py-2",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, ...props }, ref) => {
        const resolvedClassName = cn(buttonVariants({ variant, size, className }));

        if (asChild && React.isValidElement(children)) {
            const child = React.Children.only(children) as React.ReactElement<any>;

            return React.cloneElement(child, {
                ...props,
                className: cn(resolvedClassName, child.props.className),
            });
        }

        return (
            <button
                className={resolvedClassName}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
