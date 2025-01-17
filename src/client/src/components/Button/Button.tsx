import "./style.scss";

import React, {forwardRef} from "react";

type ButtonProps = {
    variant?: ButtonVariant,
    size?: ButtonSize,
    children: React.ReactNode,
} & React.ComponentProps<"button">;

type ButtonVariant = "primary" | "secondary" | "destructive";

type ButtonSize = "default" | "icon";

export const Button = forwardRef<
    HTMLButtonElement, ButtonProps
>(({ variant, size, children, ...props }, ref) => {
    const v = variant ?? "primary";
    const s = size ?? "default";

    return (
        <button ref={ref} className={`button button-${v} button-size-${s}`} {...props}>
            {children}
        </button>
    );
});