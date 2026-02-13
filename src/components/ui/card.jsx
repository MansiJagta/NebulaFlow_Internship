import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300", className)} {...props} />
));
Card.displayName = "Card";

const GlassCard = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl hover:shadow-[0_0_20px_rgba(var(--nebula-cyan),0.3)] hover:border-white/20 transition-all duration-300",
            className
        )}
        {...props}
    />
));
GlassCard.displayName = "GlassCard";

const CardHeader = React.forwardRef(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
    ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
    ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
    ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
    ),
);
CardFooter.displayName = "CardFooter";

export { Card, GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
