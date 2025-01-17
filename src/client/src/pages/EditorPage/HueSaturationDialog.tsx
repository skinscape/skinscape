import React, { useState } from "react";

import { Dialog } from "../../components/Dialog";
import { colord, HsvaColor } from "colord";
import { ColorHueSlider } from "../../components/ColorHueSlider";
import { ColorValueSlider } from "../../components/ColorValueSlider";
import { Button } from "../../components/Button";
import { useActiveEditor } from "../../hooks/useActiveEditor";
import { ColorSaturationSlider } from "../../components/ColorSaturationSlider";

export const HueSaturationDialog: React.FC = () => {
    const { editor } = useActiveEditor();
    const [hsva, setHsva] = useState<HsvaColor>({ h: 0, s: 50, v: 50, a: 1 });

    function setHsvaAndUpdate(hsva: HsvaColor) {
        if (!editor.activeSkin) return;
        setHsva(hsva);

        const skin = editor.activeSkin;
        const layer = skin.getTempLayerByName("effect");
        layer.clear();

        for (let pos = 0; pos < skin.data.length; pos += 4) {
            const color = skin.getPixelByPos(pos);
            const newColor = colord(color).rotate(hsva.h).lighten((hsva.v - 50) / 100).desaturate((hsva.s - 50) / 100).toRgb();
            layer.setPixelByPos(pos, newColor, false);
        }
    }

    return (
        <Dialog title="Adjust Hue/Saturation">
            <div style={{ width: "100%", height: "20px" }}>
                <ColorHueSlider hsva={hsva} setHsva={setHsvaAndUpdate}/>
            </div>
            <div style={{ width: "100%", height: "20px" }}>
                <ColorSaturationSlider hsva={hsva} setHsva={setHsvaAndUpdate}/>
            </div>
            <div style={{ width: "100%", height: "20px" }}>
                <ColorValueSlider hsva={hsva} setHsva={setHsvaAndUpdate}/>
            </div>
            <Button>Confirm</Button>
        </Dialog>
    );
}