import "./style.css";

import React from "react";

import {useToolContext} from "../../stores.ts";

const tools: {
    id: string,
    icon: string,
}[] = [
    { id: "pencil",     icon: "icons/pencil.svg" },
    { id: "eraser",     icon: "icons/eraser.svg" },
    { id: "eyedropper", icon: "icons/eyedropper.svg" },
    { id: "fill",       icon: "icons/paint_bucket.svg" },
];

export const Toolbar: React.FC = () => {
    const { activeTool, setActiveTool } = useToolContext();

    return (
        <div className="toolbar">
            {tools.map((tool) => {
                const style = {
                    maskImage: `url(${tool.icon})`
                } as React.CSSProperties;

                return (
                    <div
                        key={tool.id}
                        className={activeTool === tool.id ? "toolbar-button active" : "toolbar-button"}
                        onClick={() => setActiveTool(tool.id)}
                    >
                        <div className="toolbar-button-image" style={style} />
                    </div>
                );
            })}
        </div>
    )
}