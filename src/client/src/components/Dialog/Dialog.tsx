import "./style.scss";

import React from "react";

type DialogProps = {
    children: React.ReactNode,
};

export const Dialog: React.FC<DialogProps> = ({
    children,
}) => {

    return (
        <div className="dialog-container">
            <div className="dialog">
                {children}
            </div>
        </div>
    )
};