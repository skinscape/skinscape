import "./style.scss";

import React from "react";
import {Range} from "./Range.tsx";
import {Slider} from "./Slider.tsx";
import {Alpha} from "./Alpha.tsx";
import {Button} from "./Button.tsx";

export const ColorPicker: React.FC = () => {
    return (
        <React.Fragment>
            <div id="color-cursor-overlay"></div>

            <div className="color-picker">
                <div className="color-picker-inner border-small">
                    <Range />
                    <Slider />
                    <Alpha />
                </div>
                <Button />
            </div>
        </React.Fragment>
    );
}