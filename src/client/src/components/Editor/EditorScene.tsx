import React, {MutableRefObject, useEffect, useMemo, useReducer, useRef, useState} from "react";

import * as THREE from "three";

import {MutableSkin} from "../../models/skin.ts";
import {DirectionalLight} from "three";
import {Canvas, createRoot, events, extend, RootState, useFrame, useThree} from "@react-three/fiber";
// @ts-ignore
import {OrbitControls as OrbitControlsClass} from "three/examples/jsm/controls/OrbitControls";
import {useWindowEvent} from "../../hooks/useWindowEvent";
import {useColorContext, useEditorContext} from "../../stores.ts";
import {useSubscribing} from "../../hooks/useSubscribing";
import {getActiveTool} from "../../models/tool.ts";
import {OrbitControls} from "@react-three/drei";
import {Scene} from "../Scene";

extend(THREE);

type EditorSceneProps = {
    skin: MutableSkin,
}

export const EditorScene: React.FC<EditorSceneProps> = ({
    skin,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const threeRef = useRef<RootState>(null);
    const controlsRef = useRef<OrbitControlsClass>(null); // three doesn't have a ref to this...

    const [initialized, setInitialized] = useState<boolean>(false);
    let mouseDown = false;

    useWindowEvent("keydown", (event: KeyboardEvent) => {
        const {
            overlay, setOverlay,
            gridlines, setGridlines
        } = useEditorContext.getState();

        if (event.key === "g") setGridlines(!gridlines);
        if (event.key === "o") setOverlay(!overlay);
    });

    useSubscribing(useEditorContext, ({ overlay, gridlines }) => {
        if (!threeRef.current) return;
        const { camera, raycaster, scene } = threeRef.current;

        raycaster.layers.set(overlay ? 2 : 1);

        camera.layers.set(1);
        camera.layers.enable(0);
        if (overlay) camera.layers.enable(2);
        if (gridlines) camera.layers.enable(overlay ? 4 : 3);
    }, [initialized]);

    function onCreated(root: RootState) {
        const { camera, scene } = root;
        camera.add(new DirectionalLight(0xffffff, 1.5));
        scene.add(root.camera);

        setInitialized(true);
    }

    function onMouseDown(event: React.MouseEvent) {
        if (event.button !== 0) return;
        if (!threeRef.current) return;
        const { scene, camera, pointer, raycaster } = threeRef.current;

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length === 0) return;

        controlsRef.current.enabled = false;
        mouseDown = true;

        const x = Math.ceil(intersects[0].uv!.x * skin.model.texture_size[0]); // Why ceil? IDK LOL
        const y = Math.floor((1 - intersects[0].uv!.y) * skin.model.texture_size[1]); // Why +2? IDK LOL

        getActiveTool().handler.down(skin, x, y, useColorContext.getState().rgba);
    }

    function onMouseMove(event: React.MouseEvent) {
        if (!threeRef.current) return;
        const { scene, camera, pointer, raycaster } = threeRef.current;

        skin.tempLayer.clear();

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length === 0) return;

        const x = Math.ceil(intersects[0].uv!.x * skin.model.texture_size[0]); // Why ceil? IDK LOL
        const y = Math.floor((1 - intersects[0].uv!.y) * skin.model.texture_size[1]); // Why +2? IDK LOL

        if (mouseDown) {
            getActiveTool().handler.drag(skin, x, y, useColorContext.getState().rgba)
        } else if (event.buttons === 0) { // Don't hover when using controls
            getActiveTool().handler.hover(skin, x, y, useColorContext.getState().rgba)
        }
    }

    function onMouseUp(event: React.MouseEvent) {
        if (event.button !== 0) return;

        controlsRef.current.enabled = true;
        mouseDown = false;

        getActiveTool().handler.up(skin, useColorContext.getState().rgba);
    }

    return (
        <Canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onCreated={onCreated}
        >
            <ThreeRefHook threeRef={threeRef} canvasRef={canvasRef} />
                <OrbitControls
                    rotateSpeed={2}
                    maxDistance={100}
                    minDistance={10}
                    enableDamping={false}
                    ref={controlsRef}
                />

                <ambientLight intensity={1}/>

                <Scene
                    skin={skin}
                />
        </Canvas>
    );
}

type ThreeRefHookProps = {
    threeRef: MutableRefObject<RootState | null>,
    canvasRef: MutableRefObject<HTMLCanvasElement | null>
}

const ThreeRefHook: React.FC<ThreeRefHookProps> = ({ threeRef, canvasRef }) => {
    const three = useThree();

    useEffect(() => {
        threeRef.current = three;
        console.log("THREE.js update");
    }, [three]);

    return <></>;
}