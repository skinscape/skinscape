import {
    Box3,
    BoxGeometry, BufferGeometry,
    DataTexture,
    Float32BufferAttribute, GridHelper,
    Group, LineBasicMaterial, LineSegments,
    Mesh,
    MeshLambertMaterial, OneMinusSrcAlphaFactor, ShaderMaterial, Vector2
} from "three";
import * as THREE from "three";

import * as model_steve64 from "../assets/models/steve64.json";
import * as model_steve128 from "../assets/models/steve128.json";
import * as model_alex64 from "../assets/models/alex64.json";
import * as model_alex128 from "../assets/models/alex128.json";
import * as model_test from "../assets/models/test.json";
import * as model_BLAHBLAH from "../assets/models/BLAHBLAH.json";

// Can't use tuples because of JSON incompatibility.

/**
 * Represents a textured model.
 */
export type Model = {
    // [width, height]
    texture_size: number[];
    elements: ModelElement[];
};

/**
 * Represents a single box in a `Model`.
 */
export type ModelElement = {
    name?: string;
    // [x, y, z]
    from: number[];
    // [x, y, z]
    to: number[];
    faces: {
        [direction in Direction]: ModelFace;
    };
}

/**
 * Represents a `Model` face.
 */
export type ModelFace = {
    // [x1, y1, x2, y2]
    uv: number[];
    texture: string;
}

// Represents a face direction.
export type Direction = "up" | "down" | "north" | "south" | "east" | "west";

// All model face directions, ordered by THREE.js BoxGeometry face order.
const DIRECTIONS = ["east", "west", "up", "down", "south", "north"];

export namespace Models {

    export const steve64: Model = normalizeUVs(model_steve64);
    export const steve128: Model = normalizeUVs(model_steve128);
    export const alex64: Model = normalizeUVs(model_alex64);
    export const alex128: Model = normalizeUVs(model_alex128);
    export const test: Model = normalizeUVs(model_test);
    export const BLAHBLAH: Model = normalizeUVs(model_BLAHBLAH);

    export function normalizeUVs(model: Model): Model {
        flatten(model.elements).forEach((face) => {
            if (face.uv[0] > face.uv[2]) {
                let temp = face.uv[2];
                face.uv[2] = face.uv[0]
                face.uv[0] = temp;
            }
            if (face.uv[1] > face.uv[3]) {
                let temp = face.uv[3];
                face.uv[3] = face.uv[1]
                face.uv[1] = temp;
            }
        });
        return model;
    }

    export function getFaceUV(model: Model, uv2: [number, number]) {
        const uv = [uv2[0] / model.texture_size[0] * 16, uv2[1] / model.texture_size[1] * 16];

        const face = flatten(model.elements).find((face) => {
            return face.uv[0] < uv[0]
                && face.uv[2] >= uv[0]
                && face.uv[1] <= uv[1]
                && face.uv[3] > uv[1];
        });

        let i = 0;
        return face!.uv.map((it) => {
            return it / 16 * model.texture_size[i++ % 2];
        });
    }

    /**
     * Creates a `Group` of `Object3D`s representing the given `Model`.
     *
     * @param model model to create
     * @param texture texture to map to UVs
     * @param gridlines should the object have gridlines
     */
    export function create(model: Model, texture: DataTexture, gridlines: boolean): Group {
        const group = new Group();

        let renderIndex = 0;
        const padding = 0.000; // Padding added to remove clipping at edge of UV borders

        for (const element of model.elements) {
            const whd = element.from.map((val, idx) => Math.abs(element.to[idx] - val));
            const xyz = element.from.map((val, idx) => (val + element.to[idx]) / 2);

            const overlay = element.name ? /^overlay:/.test(element.name) : false;
            if (overlay) continue;

            const geometry = new BoxGeometry(whd[0], whd[1], whd[2]);
            const material = new MeshLambertMaterial({
                map: texture,
                transparent: true,
                side: overlay ? THREE.DoubleSide : THREE.FrontSide,
            });

            texture.needsUpdate = true;

            const gridGeometry = new BoxGeometry(whd[0], whd[1], whd[2]);
            const gridMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uvScale: { value: new Vector2(model.texture_size[0], model.texture_size[1]) },
                    uTexture: { value: texture },
                    lineValue: { value: 0.7 },
                    lineWidth: { value: 0.05 },
                },
                vertexShader: `
                    varying vec2 vUv;                                        
                    
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;             
                                               
                    uniform sampler2D uTexture;
                    
                    uniform vec2 uvScale;
                    uniform float lineValue;
                    uniform float lineWidth;
                    
                    void main() {
                        vec2 scaledUv = vUv * uvScale;
                    
                        float line = min(
                            fract(scaledUv.x + lineWidth / 2.0),
                            fract(scaledUv.y + lineWidth / 2.0)
                        );
                                                
                        if (line < lineWidth) {
                            vec4 color = texture2D(uTexture, vUv);
                            gl_FragColor = vec4(vec3(1.0) - color.rgb, 0.5);
                        } else {
                            gl_FragColor = vec4(0.0);
                        }
                    }
                `,
                transparent: true,
            });

            const buffer = new Float32BufferAttribute(48, 2);

            for (let i = 0; i < 6; i++) {
                // @ts-ignore
                const face: ModelFace = element.faces[DIRECTIONS[i]];

                const u0 = face.uv[0] / 16 + padding;
                const v0 = (16 - face.uv[3]) / 16 + padding;
                const u1 = face.uv[2] / 16 - padding;
                const v1 = (16 - face.uv[1]) / 16 - padding;

                // FUCK YOU!!!!!!!!!! WHY IS IT DIFFERENT PER FACE!!!
                switch (DIRECTIONS[i]) {
                    case "up":
                        buffer.set([u1, v0, u0, v0, u1, v1, u0, v1], i * 8);
                        break;
                    case "down":
                        buffer.set([u1, v1, u0, v1, u1, v0, u0, v0], i * 8);
                        break;
                    default:
                        buffer.set([u0, v1, u1, v1, u0, v0, u1, v0], i * 8);
                        break;
                }
            }

            geometry.setAttribute("uv", buffer);
            gridGeometry.setAttribute("uv", buffer);

            const mesh = new Mesh(geometry, material);
            mesh.position.set(xyz[0], xyz[1], xyz[2]);

            const gridMesh = new Mesh(gridGeometry, gridMaterial);
            gridMesh.position.set(xyz[0], xyz[1], xyz[2]);
            gridMesh.scale.set(1.01, 1.01, 1.01);

            mesh.name = (overlay ? element.name?.substring(8) : element.name) ?? "";

            group.add(mesh);
            group.add(gridMesh);
        }

        group.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));

        // Center the group
        const box = new Box3().setFromObject(group);
        const center = box.getCenter(group.position);
        group.position.set(-center.x, -center.y, -center.z);

        return group;
    }

}

function flatten(elements: Array<ModelElement>): Array<ModelFace> {
    return elements.flatMap((element) => {
        const arr: Array<ModelFace> = [];
        for (let i = 0; i < 6; i++) {
            // @ts-ignore
            const face = element.faces[DIRECTIONS[i]];
            arr.push(face);
        }
        return arr;
    });
}