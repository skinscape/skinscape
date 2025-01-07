import "./style.scss";

import React from "react";

export const Input = React.forwardRef<
    HTMLInputElement, React.ComponentProps<"input">
>(({ type, ...props }, ref) => {
        return (
            <input ref={ref} type={type} className="input" {...props} />
        )
    }
);