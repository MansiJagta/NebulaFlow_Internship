import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                cyan: "border-transparent bg-nebula-cyan/20 text-nebula-cyan hover:bg-nebula-cyan/30",
                purple: "border-transparent bg-nebula-purple/20 text-nebula-purple hover:bg-nebula-purple/30",
                pink: "border-transparent bg-nebula-pink/20 text-nebula-pink hover:bg-nebula-pink/30",
                green: "border-transparent bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30",
                red: "border-transparent bg-rose-500/20 text-rose-500 hover:bg-rose-500/30",
                yellow: "border-transparent bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
