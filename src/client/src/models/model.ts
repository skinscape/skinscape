import {
    Box3,
    BoxGeometry,
    DataTexture,
    Float32BufferAttribute,
    Group,
    Mesh,
    MeshLambertMaterial
} from "three";
import * as THREE from "three";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

import * as model_steve64 from "../../models/steve64.json";
import * as model_steve128 from "../../models/steve128.json";
import * as model_alex64 from "../../models/alex64.json";
import * as model_alex128 from "../../models/alex128.json";
import * as model_test from "../../models/test.json";

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
        [direction in Direction]?: ModelFace;
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
        return face.uv.map((it) => {
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

        let offsetFactor = 0;
        for (const element of model.elements) {
            const whd = element.from.map(
                (val, idx) => Math.abs(element.to[idx] - val)
            );
            const xyz = element.from.map(
                (val, idx) => (val + element.to[idx]) / 2
            );

            const overlay = /^overlay:/.test(element.name);

            const geometry = new BoxGeometry(whd[0], whd[1], whd[2]);
            const material = new MeshLambertMaterial(
                { map: texture, transparent: true, side: THREE.DoubleSide }
            );

            const buffer = new Float32BufferAttribute(48, 2);
            for (let i = 0; i < 6; i++) { // Map uvs and textures for each face
                const face = element.faces[DIRECTIONS[i]];

                // I don't know why it is like this, but whatever. Different cases for up and down
                if (DIRECTIONS[i] == "up") {
                    buffer.set([
                        face.uv[0] / 16, (16 - face.uv[3]) / 16, // x2, y1
                        face.uv[2] / 16, (16 - face.uv[3]) / 16, // x2, y2
                        face.uv[0] / 16, (16 - face.uv[1]) / 16, // x1, y1
                        face.uv[2] / 16, (16 - face.uv[1]) / 16, // x1, y2
                    ], i * 8);
                } else if (DIRECTIONS[i] == "down") {
                    buffer.set([
                        face.uv[2] / 16, (16 - face.uv[1]) / 16, // x1, y2
                        face.uv[0] / 16, (16 - face.uv[1]) / 16, // x1, y1
                        face.uv[2] / 16, (16 - face.uv[3]) / 16, // x2, y2
                        face.uv[0] / 16, (16 - face.uv[3]) / 16, // x2, y1
                    ], i * 8);
                } else {
                    // 0,0 1,0 1,1 0,1
                    buffer.set([
                        face.uv[0] / 16, (16 - face.uv[1]) / 16, // x1, y1
                        face.uv[2] / 16, (16 - face.uv[1]) / 16, // x1, y2
                        face.uv[0] / 16, (16 - face.uv[3]) / 16, // x2, y1
                        face.uv[2] / 16, (16 - face.uv[3]) / 16, // x2, y2
                    ], i * 8);
                }
            }
            geometry.setAttribute("uv", buffer);

            const mesh = new Mesh(geometry, material);
            mesh.position.set(xyz[0], xyz[1], xyz[2]);
            // mesh.position.addScalar(offsetFactor / 10000);

            if (overlay) {
                mesh.name = element.name.substring(8);
                mesh.layers.set(1);
                mesh.renderOrder = 1;
            }
            else {
                mesh.name = element.name;
            }

            group.add(mesh);

            if (gridlines) {
                console.log(element);
                console.log(whd);

                const width = Math.abs(element.faces.north.uv[0] - element.faces.north.uv[2]) * 4;
                const height = Math.abs(element.faces.east.uv[1] - element.faces.east.uv[3]) * 4;
                const depth = Math.abs(element.faces.up.uv[1] - element.faces.up.uv[3]) * 4;

                console.log(width, height, depth);

                const grid = createGridlines(width, height, depth, overlay ? 3 : 2);
                grid.position.set(xyz[0], xyz[1], xyz[2]);
                grid.scale.set(1.01, 1.01, 1.01);
                group.add(grid);
            }
            offsetFactor++;
        }

        group.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));

        // This is good me thinks...
        const box = new Box3().setFromObject(group);
        const center = box.getCenter(group.position);
        group.position.set(-center.x, -center.y, -center.z);

        return group;
    }

}

// TODO: Make it take an element as input instead and use whd and uv mappings separately to create grids
/**
 * Creates gridline objects with a given `width`, `height`, `depth`, and `layer`.
 */
function createGridlines(width: number, height: number, depth: number, layer: number): Group {
    const group = new Group();

    // Define faces
    const faces = [
        { position: new THREE.Vector3(0, 0, depth / 2),   rotation: new THREE.Euler(0, 0, 0),            width: width, height: height }, // Front
        { position: new THREE.Vector3(0, 0, -depth / 2),  rotation: new THREE.Euler(0, Math.PI, 0),      width: width, height: height }, // Back
        { position: new THREE.Vector3(0, height / 2, 0),  rotation: new THREE.Euler(-Math.PI / 2, 0, 0), width: width, height: depth },  // Top
        { position: new THREE.Vector3(0, -height / 2, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),  width: width, height: depth },  // Bottom
        { position: new THREE.Vector3(width / 2, 0, 0),   rotation: new THREE.Euler(0, Math.PI / 2, 0),  width: depth, height: height }, // Left
        { position: new THREE.Vector3(-width / 2, 0, 0),  rotation: new THREE.Euler(0, -Math.PI / 2, 0), width: depth, height: height }  // Right
    ];

    for (const face of faces) {
        const gridFace = new Group();

        const gridVtxBuf = new Array<number>();
        const outlineVtxBuf = new Array<number>();

        // Make vertices
        const halfWidth = face.width / 2;
        const halfHeight = face.height / 2;
        for (let x = -halfWidth; x <= halfWidth; x += 1) {
            if (x === -halfWidth || x === halfWidth) {
                outlineVtxBuf.push(x, -halfHeight, 0);
                outlineVtxBuf.push(x, halfHeight, 0);
            } else {
                gridVtxBuf.push(x, -halfHeight, 0);
                gridVtxBuf.push(x, halfHeight, 0);
            }
        }
        for (let y = -halfHeight; y <= halfHeight; y += 1) {
            if (y === -halfHeight || y === halfHeight) {
                outlineVtxBuf.push(-halfWidth, y, 0);
                outlineVtxBuf.push(halfWidth, y, 0);
            } else {
                gridVtxBuf.push(-halfWidth, y, 0);
                gridVtxBuf.push(halfWidth, y, 0);
            }
        }

        const gridLineGeometry = new LineSegmentsGeometry().setPositions(gridVtxBuf);
        const outlineLineGeometry = new LineSegmentsGeometry().setPositions(outlineVtxBuf);

        const gridMaterial = new LineMaterial({ color: 0x000000, linewidth: 0.5 });
        gridMaterial.transparent = true;
        const gridLines = new LineSegments2(gridLineGeometry, gridMaterial);

        const outlineMaterial = new LineMaterial({ color: 0xffffff, linewidth: 2 });
        outlineMaterial.transparent = true;
        const outlineLines = new LineSegments2(outlineLineGeometry, outlineMaterial);

        gridLines.layers.set(layer);
        outlineLines.layers.set(layer);

        const planeGeometry = new THREE.PlaneGeometry(face.width, face.height);
        const planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.FrontSide });
        planeMaterial.transparent = true;
        planeMaterial.opacity = 0;
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.z = -0.15;
        plane.renderOrder = -1;

        plane.layers.set(layer);

        gridFace.add(gridLines);
        gridFace.add(outlineLines);
        gridFace.add(plane);

        gridFace.position.copy(face.position);
        gridFace.rotation.copy(face.rotation);
        group.add(gridFace);
    }

    return group;
}

function flatten(elements: Array<ModelElement>): Array<ModelFace> {
    return elements.flatMap((element) => {
        const arr: Array<ModelFace> = [];
        for (let i = 0; i < 6; i++) {
            const face = element.faces[DIRECTIONS[i]];
            arr.push(face);
        }
        return arr;
    });
}