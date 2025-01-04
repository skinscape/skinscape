import React from "react";

import {
    DoubleSide,
    Euler,
    FrontSide,
} from "three";
import {Direction, ModelElement, ModelFace} from "../../models/model.ts";
import {MutableSkin} from "../../models/skin.ts";
import {Center} from "@react-three/drei";
import {GridBox} from "./GridBox.tsx";

type ModelDisplayProps = {
    skin: MutableSkin
}

/**
 * Creates a THREE.js model for the given skin
 *
 * The following layers are created:
 * - skin base (1)
 * - skin overlay (2)
 * - gridlines base (3)
 * - gridlines overlay (4)
 */
export const ModelDisplay: React.FC<ModelDisplayProps> = ({
    skin,
}) => {
    const model = skin.model;

    let r1 = 0;
    let r2 = model.elements.length;

    let o1 = 0;
    return (
        <Center rotation={new Euler(0, Math.PI, 0)}>
            {model.elements.map((element) => {
                const whd = element.from.map((val, idx) => Math.abs(element.to[idx] - val));
                const xyz = element.from.map((val, idx) => (val + element.to[idx]) / 2);

                const isOverlay = element.name ? /^overlay:/.test(element.name) : false;
                const name = isOverlay ? element.name?.substring(8) : element.name;

                const uv = getElementUv(element);

                return (
                    <group key={element.name}>
                        <mesh
                            name={name}
                            position={[xyz[0], xyz[1], xyz[2] + o1++ * 0.001]}
                            renderOrder={!isOverlay ? r1++ : r2++}
                            layers={isOverlay ? 2 : 1}
                        >
                            <boxGeometry args={[whd[0], whd[1], whd[2]]}>
                                <float32BufferAttribute
                                    attach="attributes-uv"
                                    count={24} array={uv} itemSize={2}
                                />
                            </boxGeometry>
                            <meshLambertMaterial
                                map={skin.texture}
                                side={isOverlay ? DoubleSide : FrontSide}
                                transparent={true}
                            />
                        </mesh>
                        <GridBox element={element} texture_size={model.texture_size} />
                    </group>
                );
            })}
        </Center>
    )
}

function getElementUv(element: ModelElement): Float32Array {
    const buffer = new Float32Array(48);
    const DIRECTIONS: Array<Direction> = [
        "east", "west", "up", "down", "south", "north"
    ];

    for (let i = 0; i < 6; i++) {
        const direction = DIRECTIONS[i];
        const face: ModelFace = element.faces[direction];

        const u0 = face.uv[0] / 16;
        const v0 = (16 - face.uv[3]) / 16;
        const u1 = face.uv[2] / 16;
        const v1 = (16 - face.uv[1]) / 16;

        if (direction === "up") {
            buffer.set([u1, v0, u0, v0, u1, v1, u0, v1], i * 8);
        } else if (direction === "down") {
            buffer.set([u1, v1, u0, v1, u1, v0, u0, v0], i * 8);
        } else {
            buffer.set([u0, v1, u1, v1, u0, v0, u1, v0], i * 8);
        }
    }

    return buffer;
}