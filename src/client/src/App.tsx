import "./App.css";

import test from "./assets/data/test.json";
import test2 from "./assets/data/test2.json";

import {fromEnkaArtifact} from "./utils/data.ts";
import {ArtifactSet} from "./components/ArtifactSet";
import {SettingsContextProvider} from "./context/SettingsProvider/SettingsProvider.tsx";
import {getCvColor, getRvColor} from "./utils/helpers.ts";
import {getAttributeOptions, HuTao} from "./utils/characters.ts";

function App() {
    const myArtifacts = test2.avatarInfoList.flatMap(avatar => {
        return avatar.equipList
            .filter(equipList => equipList.weapon == undefined)
            .map(equipList => fromEnkaArtifact(equipList));
    });

    const artiList = [];
    for (let i = 0; i < myArtifacts.length / 5; i++) {
        const set = [];
        for (let j = 0; j < 5; j++) {
            const piece = myArtifacts[i * 5 + j];
            if (piece) set.push(piece);
        }
        artiList.push(set);
    }

    const colorList = [];
    const colorList2 = [];

    for (let i = 0; i < 1001; i++) {
        colorList2.push(getRvColor(i / 10) ?? [0, 0, 0]);
    }

    for (let i = 0; i < 1001; i++) {
        colorList.push(getCvColor(54.4 / (1000 / i)) ?? [0, 0, 0]);
    }

    return (
        <SettingsContextProvider>
            {artiList.map((set, i) => {
                return (<ArtifactSet key={i} artifacts={set}></ArtifactSet>)
            })}
            <div className="colortest">
                {colorList2.map(color => {
                    const style = {
                        width: "1px",
                        height: "50px",
                        background: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                    };

                    return (
                        <div style={style}></div>
                    )
                })}
            </div>
            <div className="colortest">
                {colorList.map(color => {
                    const style = {
                        width: "1px",
                        height: "50px",
                        background: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                    };

                    return (
                        <div style={style}></div>
                    )
                })}
            </div>
        </SettingsContextProvider>
    );
}

export default App
