import React, { useEffect, useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import sanitize from "sanitize-filename";
import { IonText, IonLabel, IonSelect, IonSelectOption, IonInput, IonButton, IonGrid, IonCol, IonRow } from '@ionic/react';

import { copyForceToText } from "./util/copyForceToText";
import { useLocalStorage } from "./util/useLocalStorage";

import ForceEditor from './ForceEditor';
import RackEditor from './RackEditor';

import { factionsData, forceSizesData } from './data';

const forcesPath = "eschatonic-well/forces/";
const forcesExtension = ".esch";

function EditorView() {
    const [factionId, setFactionId] = useLocalStorage("factionId", "all");
    const [forceSize, setForceSize] = useLocalStorage("forceSize", forceSizesData["custom"]);

    const [forceName, setForceName] = useLocalStorage("forceName", "New Force");
    const [forceModelsData, setForceModelsData] = useLocalStorage("forceModelsData", []);
    const [forceCyphersData, setForceCyphersData] = useLocalStorage("forceCyphersData", []);
    const [specialIssueModelsData, setSpecialIssueModelsData] = useLocalStorage("specialIssueModelsData", []);
    const [specialIssueCyphersData, setSpecialIssueCyphersData] = useLocalStorage("specialIssueCyphersData", []);

    const [forcesDirty, setForcesDirty] = useState(true);
    const [loadForceButtons, setLoadForceButtons] = useState([]);

    useEffect(() => {
        createForcesDir().then(() => 
            listForces().then((result) => {
                if(forcesDirty && result) {
                    const newLoadForceButtons = [];
                    result.files.forEach((file, index) => {
                        const forceName = file.name.replace(forcesExtension, "");
                        newLoadForceButtons.push(<IonRow key={index}>
                            <IonCol><IonButton expand="full" onClick={() => loadForce(file.name)}><div>{forceName}</div></IonButton></IonCol>
                            <IonCol size="auto"><IonButton expand="full" onClick={() => deleteForce(file.name)}>DELETE</IonButton></IonCol>
                        </IonRow>);
                        setLoadForceButtons(newLoadForceButtons);
                    });
                    setForcesDirty(false);
                }
            })
        );
    }, [forcesDirty])
    
    function changeFaction(id) {
        setFactionId(id);
        clearForce();
    }

    function changeForceSize(forceSizeId) {
        setForceSize(forceSizesData[forceSizeId]);
    }

    function clearForce() {
        setForceModelsData([]);
        setForceCyphersData([]);
        setSpecialIssueModelsData([]);
        setSpecialIssueCyphersData([]);
    }

    const createForcesDir = async () => {
        try {
            listForces();
            return;
        } catch (e) {
            const result = await Filesystem.mkdir({
                path: forcesPath,
                directory: Directory.Data,
                recursive: true
            });
            
            console.log(result);
            return result;
        }
    }

    const listForces = async () => {
        try {
            const result = await Filesystem.readdir({
                path: forcesPath,
                directory: Directory.Data
            });
            
            console.log(result);
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const saveForce = async (forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData) => {
        const json = {
            "forceName": forceName,
            "factionId": factionId,
            "forceSize": forceSize,
            "forceModelsData": forceModelsData,
            "forceCyphersData": forceCyphersData,
            "specialIssueModelsData": specialIssueModelsData,
            "specialIssueCyphersData": specialIssueCyphersData
        };
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
            setSpecialIssueModelsData(json.specialIssueModelsData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
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

    const factionSelectOptions = [];
    Object.entries(factionsData).forEach(([key, value]) => {
        if(!value.hidden) {
            factionSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });
    factionSelectOptions.push(<IonSelectOption key={"all"} value={""}>ALL</IonSelectOption>);

    const forceSizeOptions = [];
    Object.entries(forceSizesData).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeOptions.push(<IonSelectOption key={key} value={value.id}>{`${value.name} ${value.id !== "custom" ? `(${value.units} / ${value.hero_solos})` : ""}`}</IonSelectOption>);
    });
    return (
        <div className="container">
            {loadForceButtons.length !== 0 && <><IonText color="primary"><h3>Load Force:</h3></IonText><IonGrid>{loadForceButtons}</IonGrid><br/></>}
            <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={factionId} onIonChange={(e) => changeFaction(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
            <IonText color="primary"><h3><IonSelect label="Force Size:" justify="start" value={forceSize.id} onIonChange={(e) => changeForceSize(e.detail.value)}>{forceSizeOptions}</IonSelect></h3></IonText>
            <IonText color="primary"><h2>Force Name: <IonInput type="text" value={forceName} onIonChange={(e) => setForceName(e.target.value)}/></h2></IonText>
            <IonGrid>
                <IonRow>
                    <IonCol><IonButton expand="full" onClick={() => {saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData)}}><div>SAVE</div></IonButton></IonCol>
                    <IonCol><IonButton expand="full" onClick={() => {copyForceToText(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData)}}><div>COPY TO TEXT</div></IonButton></IonCol>
                    <IonCol><IonButton expand="full" onClick={() => {
                        clearForce();
                        setForceName("New Force");
                    }}><div>CLEAR</div></IonButton></IonCol>
                </IonRow>
            </IonGrid>
            <ForceEditor 
                factionId={factionId} 
                forceSize={forceSize} 
                forceName={forceName} 
                forceModelsData={forceModelsData} 
                setForceModelsData={setForceModelsData} 
                specialIssueModelsData={specialIssueModelsData} 
                setSpecialIssueModelsData={setSpecialIssueModelsData}
            ></ForceEditor>
            <RackEditor 
                factionId={factionId}
                forceCyphersData={forceCyphersData}
                setForceCyphersData={setForceCyphersData}
                specialIssueCyphersData={specialIssueCyphersData} 
                setSpecialIssueCyphersData={setSpecialIssueCyphersData}
            ></RackEditor>
        </div>
    );
}

export default EditorView;
