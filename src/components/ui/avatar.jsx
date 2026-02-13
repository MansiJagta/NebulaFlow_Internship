import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
        {...props}
    />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const AvatarWithStatus = React.forwardRef(({ className, status = "online", ...props }, ref) => {
    const statusColors = {
        online: "bg-green-500",
        offline: "bg-gray-500",
        busy: "bg-red-500",
        away: "bg-amber-500",
    };

    return (
        <div className="relative inline-block">
            <Avatar ref={ref} className={className} {...props} />
            <span
                className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ring-1 ring-background",
                    statusColors[status]
                )}
            >
                <span className={cn("absolute inset-0 rounded-full opacity-75 animate-ping", statusColors[status])}></span>
            </span>
        </div>
    );
});
AvatarWithStatus.displayName = "AvatarWithStatus";

export { Avatar, AvatarImage, AvatarFallback, AvatarWithStatus };
