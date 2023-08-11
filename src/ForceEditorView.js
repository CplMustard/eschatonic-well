import React, { useEffect, useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import sanitize from "sanitize-filename";

import { copyForceToText } from "./util/copyForceToText";
import { useLocalStorage } from "./util/useLocalStorage";

import ForceEditor from './ForceEditor';

import { factionsData, forceSizesData } from './data'

const forcesPath = "eschatonic-well/forces/"
const forcesExtension = ".esch"

function ForceEditorView() {
    const [factionId, setFactionId] = useLocalStorage("factionId", "all");
    const [forceSize, setForceSize] = useLocalStorage("forceSize", {});

    const [forceName, setForceName] = useLocalStorage("forceName", "New Force");
    const [forceModelsData, setForceModelsData] = useLocalStorage("forceModelsData", []);
    const [forceCyphersData, setForceCyphersData] = useLocalStorage("forceCyphersData", []);

    const [forcesDirty, setForcesDirty] = useState(true);
    const [loadForceButtons, setLoadForceButtons] = useState([]);


    useEffect(() => {
        listForces().then((result) => {
            if(forcesDirty) {
                const newLoadForceButtons = [];
                result.files.forEach((file, index) => {
                    const forceName = file.name.replace(forcesExtension, "");
                    newLoadForceButtons.push(<div key={index}><button onClick={() => loadForce(file.name)}>{forceName}</button><button onClick={() => deleteForce(file.name)}>DELETE</button></div>);
                    setLoadForceButtons(newLoadForceButtons);
                });
                setForcesDirty(false);
            }
        });
    }, [forcesDirty])
    
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

    const listForces = async () => {
        const result = await Filesystem.readdir({
            path: forcesPath,
            directory: Directory.Data
        });
        
        console.log(result);
        return result;
    }

    const saveForce = async (forceName, factionId, forceSize, forceModelsData, forceCyphersData) => {
        const json = {"forceName": forceName, "factionId": factionId, "forceSize": forceSize, "forceModelsData": forceModelsData, "forceCyphersData": forceCyphersData};
        const filename = sanitize(forceName);
        try {
            const result = await Filesystem.writeFile({
                path: `${forcesPath}${filename}${forcesExtension}`,
                data: JSON.stringify(json),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
                recursive: true
            });
            
            console.log(result);
            setForcesDirty(true);
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const loadForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            console.log(json);
            setForceName(json.forceName);
            setFactionId(json.factionId);
            setForceSize(json.forceSize);
            setForceModelsData(json.forceModelsData);
            setForceCyphersData(json.forceCyphersData);
        } catch (e) {
            console.log(e);
        }
    }

    const deleteForce = async (filename) => {
        try {
            const result = await Filesystem.deleteFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
            });
            console.log(result);
            setForcesDirty(true);
            // For some reason we need to clear out the buttons if it's the last force being deleted
            if((await listForces()).files.length === 0) {
                setLoadForceButtons([]);
            }
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const factionButtons = [];
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionButtons.push(<button key={key} onClick={() => changeFaction(value.id)}>{value.name}</button>);
        }
    });
    factionButtons.push(<button key={"custom"} onClick={() => changeFaction("")}>ALL</button>);

    const forceSizeButtons = [];
    Object.entries(forceSizesData).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeButtons.push(<button key={key} onClick={() => changeForceSize(value)}>{`${value.name} (${value.units} / ${value.hero_solos})`}</button>);
    });
    forceSizeButtons.push(<button key={"custom"} onClick={() => changeForceSize({})}>CUSTOM</button>);
    return (
        <div className="container">
            Forces:{loadForceButtons}<br/>
            {factionButtons}<br/>
            {forceSizeButtons}<br/>
            <br/>
            <label>Force Name: <input type="text" value={sanitize(forceName)} defaultValue={sanitize(forceName)} onChange={(e) => setForceName(sanitize(e.target.value))}/></label>
            <button onClick={() => {saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData)}}>SAVE</button>
            <button onClick={() => {copyForceToText(forceName, factionId, forceSize, forceModelsData, forceCyphersData)}}>COPY TO TEXT</button>
            <button onClick={() => {clearForce()}}>CLEAR</button>
            <ForceEditor factionId={factionId} forceSize={forceSize} forceName={forceName} forceModelsData={forceModelsData} setForceModelsData={setForceModelsData} forceCyphersData={forceCyphersData} setForceCyphersData={setForceCyphersData}></ForceEditor>
        </div>
    );
}

export default ForceEditorView;
