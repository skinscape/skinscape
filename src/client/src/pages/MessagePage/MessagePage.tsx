import "./style.css";

import React from "react";

type MessagePageProps = {
    children: JSX.Element[],
}

export const MessagePage: React.FC<MessagePageProps> = ({
    children
}) => {

    return (
        <div className="message-page">
            <a href="https://skinscape.app">
                <span className="logo text">S</span>
                <span className="logo text">K</span>
                <span className="logo text">I</span>
                <span className="logo text">N</span>
                <span className="logo text">S</span>
                <span className="logo text">C</span>
                <span className="logo text">A</span>
                <span className="logo text">P</span>
                <span className="logo text">E</span>
            </a>
            <div className="message-page-container">
                {children}
            </div>
        </div>
    )
}