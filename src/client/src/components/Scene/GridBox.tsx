import React from "react";
import {Direction, ModelElement} from "../../models/model.ts";

import {Euler, Vector3} from "three";

import {
    Line,
} from "@react-three/drei";

export const GridBox: React.FC<{
    element: ModelElement, texture_size: number[]
}> = ({ element, texture_size }) => {
    const [width, height, depth] = element.from.map((val, idx) => Math.abs(element.to[idx] - val));
    const xyz = element.from.map((val, idx) => (val + element.to[idx]) / 2);

    const isOverlay = element.name ? /^overlay:/.test(element.name) : false;

    const offset = 0.01;
    const faces = [
        { position: new Vector3(0, height / 2 + offset, 0),  rotation: new Euler(-Math.PI / 2, 0, 0), width: width, height: depth },  // Top
        { position: new Vector3(0, -height / 2 - offset, 0), rotation: new Euler(Math.PI / 2, 0, 0),  width: width, height: depth },  // Bottom
        { position: new Vector3(0, 0, -depth / 2 - offset),  rotation: new Euler(0, Math.PI, 0),      width: width, height: height }, // Back
        { position: new Vector3(0, 0, depth / 2 + offset),   rotation: new Euler(0, 0, 0),            width: width, height: height }, // Front
        { position: new Vector3(-width / 2 - offset, 0, 0),  rotation: new Euler(0, -Math.PI / 2, 0), width: depth, height: height }, // Right
        { position: new Vector3(width / 2 + offset, 0, 0),   rotation: new Euler(0, Math.PI / 2, 0),  width: depth, height: height }, // Left
    ];

    const DIRECTIONS: Array<Direction> = ["up", "down", "north", "south", "east", "west"];

    return (
        <group>
            {DIRECTIONS.map((direction, i) => {
                const buffer1 = new Array<Vector3[]>();
                const buffer2 = new Array<Vector3[]>();

                const face = element.faces[direction];
                const data = faces[i];

                const u = Math.abs(face.uv[0] - face.uv[2]) * texture_size[0] / 16;
                const v = Math.abs(face.uv[1] - face.uv[3]) * texture_size[1] / 16;

                const halfWidth = data.width / 2;
                const halfHeight = data.height / 2;
                const widthStep = data.width / u;
                const heightStep = data.height / v;

                const tolerance = 0.01;
                for (let x = -halfWidth; x <= halfWidth + tolerance; x += widthStep) {
                    (Math.abs(x) + tolerance >= halfWidth ? buffer2 : buffer1)
                        .push([new Vector3(x, -halfHeight, 0), new Vector3(x, halfHeight, 0)]);
                }
                for (let y = -halfHeight; y <= halfHeight + tolerance; y += heightStep) {
                    (Math.abs(y) + tolerance >= halfHeight ? buffer2 : buffer1)
                        .push([new Vector3(-halfWidth, y, 0), new Vector3(halfWidth, y, 0)]);
                }

                return (
                    <group
                        key={direction}
                        position={data.position.add(new Vector3(...xyz))}
                        rotation={data.rotation}
                    >
                        {buffer1.map((points, i) => {
                            return <Line
                                key={i}
                                points={points}
                                color={"#ffffff"}
                                lineWidth={0.5}
                                renderOrder={10001}
                                transparent={true}
                                layers={isOverlay ? 4 : 3}
                            />
                        })}
                        {buffer2.map((points, i) => {
                            return <Line
                                key={i}
                                points={points}
                                color={"#ffffff"}
                                lineWidth={1}
                                renderOrder={10001}
                                transparent={true}
                                layers={isOverlay ? 4 : 3}
                            />
                        })}
                        <mesh renderOrder={10000} position={[0, 0, -0.01]} layers={isOverlay ? 4 : 3}>
                            <planeGeometry args={[data.width, data.height]} />
                            <meshBasicMaterial transparent={true} opacity={0} />
                        </mesh>
                    </group>
                )
            })}
        </group>
    );
};