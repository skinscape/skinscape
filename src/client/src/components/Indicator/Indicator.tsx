import "./style.scss";

import React from "react";

type IndicatorProps = {
    pos: { x: number, y: number },
}

export const Indicator: React.FC<IndicatorProps> = ({
    pos,
}) => {
    const style = {
        left: `${pos.x - 2}px`,
        top: `${pos.y - 2}px`,
    } as React.CSSProperties;

    return (
        <div className="indicator" style={style} />
    );
}