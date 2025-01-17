import "./style.scss";

import React, {forwardRef} from "react";

type IconProps = {
    image: string,
} & React.ComponentProps<"div">;

export const Icon = forwardRef<
    HTMLDivElement, IconProps
>(({ image, ...props }, ref) => {
    const style = {
        maskImage: `url(${image})`
    } as React.CSSProperties;

    return (
        <div ref={ref} className="icon" style={style} {...props}></div>
    );
});