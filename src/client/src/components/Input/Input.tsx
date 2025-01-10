import "./style.scss";

import React, { forwardRef } from "react";

export const Input = forwardRef<
    HTMLInputElement, React.ComponentProps<"input">
>(({ type, ...props }, ref) => {
        return (
            <input ref={ref} type={type} className="input" spellCheck={false} {...props} />
        )
    }
);