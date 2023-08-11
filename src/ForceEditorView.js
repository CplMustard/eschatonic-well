import React from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { copyForceToText } from "./util/copyForceToText";
import { useLocalStorage } from "./util/useLocalStorage";

import ForceEditor from './ForceEditor';

import { factionsData, forceSizesData } from './data'

function ForceEditorView() {
    const [factionId, setFactionId] = useLocalStorage("factionId", "all");
    const [forceSize, setForceSize] = useLocalStorage("forceSize", {});

    const [forceName, setForceName] = useLocalStorage("forceName", "New Force");
    const [forceModelsData, setForceModelsData] = useLocalStorage("forceModelsData", []);
    const [forceCyphersData, setForceCyphersData] = useLocalStorage("forceCyphersData", []);
    
    function changeFaction(id) {
        setFactionId(id);
        clearForce();
    }

    function changeForceSize(forceSize) {
        setForceSize(forceSize);
    }

    function clearForce() {
        setForceModelsData([]);
        setForceCyphersData([]);
    }

    const saveForce = async (forceName, factionId, forceSize, forceModelsData, forceCyphersData) => {
        const json = {"forceName": forceName, "factionId": factionId, "forceSize": forceSize, "forceModelsData": forceModelsData, "forceCyphersData": forceCyphersData};

        try {
            const result = await Filesystem.writeFile({
                path: `eschatonic-well/forces/${forceName}.esch`,
                data: JSON.stringify(json),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
                recursive: true
            });
            
            console.log(result);
            return result;
        } catch (e) {
            console.log(e);
        }

    }

    function loadForce(fileName) {
        const json = JSON.stringify(forceModelsData.concat(forceCyphersData));
        console.log(forceName + ": \n");
        console.log(json);
    }

    const factionButtons = []
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionButtons.push(<button key={key} onClick={() => changeFaction(value.id)}>{value.name}</button>);
        }
    });
    factionButtons.push(<button key={"custom"} onClick={() => changeFaction("")}>ALL</button>);
    const forceSizeButtons = []
    Object.entries(forceSizesData).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeButtons.push(<button key={key} onClick={() => changeForceSize(value)}>{`${value.name} (${value.units} / ${value.hero_solos})`}</button>);
    });
    forceSizeButtons.push(<button key={"custom"} onClick={() => changeForceSize({})}>CUSTOM</button>);
    return (
        <div className="container">
            {factionButtons}<br/>
            {forceSizeButtons}<br/>
            <br/>
            <label>Force Name: <input type="text" defaultValue={forceName} onChange={(e) => setForceName(e.target.value)}/></label>
            <button onClick={() => {saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData)}}>SAVE</button>
            <button onClick={() => {copyForceToText(forceName, factionId, forceSize, forceModelsData, forceCyphersData)}}>COPY TO TEXT</button>
            <button onClick={() => {clearForce()}}>CLEAR</button>
            <ForceEditor factionId={factionId} forceSize={forceSize} forceName={forceName} forceModelsData={forceModelsData} setForceModelsData={setForceModelsData} forceCyphersData={forceCyphersData} setForceCyphersData={setForceCyphersData}></ForceEditor>
        </div>
    );
}

export default ForceEditorView;
