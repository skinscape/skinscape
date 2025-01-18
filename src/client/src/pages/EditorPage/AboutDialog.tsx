import React from "react";

import { VERSION } from "../../utils/env.ts";
import { Dialog } from "../../components/Dialog";
import { Center } from "../../components/Center";

export const AboutDialog: React.FC = () => {
    return (
        <Dialog title="About">
            <p>Created and maintained by Alexander Capitos</p>
            <Center><i>Free to use, forever</i></Center>
            <br />
            <Center>
                <div style={{padding: "10px 20px", boxShadow: "0 0 0 2px var(--border-light)"}}>
                    <a href="https://github.com/skinscape/skinscape">Repository</a>
                    <div style={{ display: "inline-block", width: "20px"}}></div>
                    <a href="https://acapitos.com/">My Website</a>
                </div>
            </Center>
            <br/>
            <hr/>
            <p>Copyright (C) 2022-2025 <i>Alexander Capitos</i></p>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <i>https://skinscape.app/</i><i>Version {VERSION}</i>
            </div>
        </Dialog>
    );
};