import React, { useEffect, useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import sanitize from "sanitize-filename";
import { IonPage, IonContent, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonSelect, IonSelectOption, IonInput, IonButton, IonGrid, IonCol, IonRow, useIonAlert, useIonViewWillEnter } from '@ionic/react';

import { copyForceToText } from "./util/copyForceToText";
import { useStorage } from "./util/useStorage";

import ModelCount from './ModelCount.js';
import CypherCount from './CypherCount.js';
import CardListViewer from './CardListViewer';
import LoadForceModal from './LoadForceModal';
import ForceEditor from './ForceEditor';
import RackEditor from './RackEditor';

import { factionsData, forceSizesData } from './data';

const forcesPath = "eschatonic-well/forces/";
const forcesExtension = ".esch";

const editorTabs = {force: 0, rack: 1, cards: 2}

function EditorView() {
    
    const [presentAlert] = useIonAlert();

    const [tabSelected, setTabSelected] = useStorage("tabSelected", editorTabs.force, sessionStorage);
    
    const [cardViewFactionId, setCardViewFactionId] = useStorage("cardViewFactionId", factionsData["all"], localStorage);
    const [factionId, setFactionId] = useStorage("factionId", factionsData["all"], localStorage);
    const [forceSize, setForceSize] = useStorage("forceSize", forceSizesData["custom"], localStorage);

    const [forceName, setForceName] = useStorage("forceName", "New Force", localStorage);
    const [forceModelsData, setForceModelsData] = useStorage("forceModelsData", [], localStorage);
    const [forceCyphersData, setForceCyphersData] = useStorage("forceCyphersData", [], localStorage);
    const [specialIssueModelsData, setSpecialIssueModelsData] = useStorage("specialIssueModelsData", [], localStorage);
    const [specialIssueCyphersData, setSpecialIssueCyphersData] = useStorage("specialIssueCyphersData", [], localStorage);

    const [forcesDirty, setForcesDirty] = useState(true);
    const [forceFiles, setForceFiles] = useState([]);
    const [isLoadForceModalOpen, setIsLoadForceModalOpen] = useState(false);

    //Ensure that model loadouts are kept updated even if they're changed from other pages
    useIonViewWillEnter(() => {
        setForceModelsData(JSON.parse(localStorage.getItem("forceModelsData")));
        setForceCyphersData(JSON.parse(localStorage.getItem("forceCyphersData")));
        setSpecialIssueModelsData(JSON.parse(localStorage.getItem("specialIssueModelsData")));
        setSpecialIssueCyphersData(JSON.parse(localStorage.getItem("specialIssueCyphersData")));
    });

    useEffect(() => {
        createForcesDir().then(() => 
            listForces().then((result) => {
                if(forcesDirty && result) {
                    setForceFiles(result.files);
                    setForcesDirty(false);
                }
            })
        );
    }, [forcesDirty]);

    const changeCardViewFaction = (id) => {
        setCardViewFactionId(id);
    }
    
    const changeFaction = (id) => {
        setFactionId(id);
        clearForce();
    }

    const changeFactionConfirm = (id) => {
        if(factionId !== id) {
            presentAlert({
                header: 'Change Faction?',
                message: 'Changing faction will clear your force',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {},
                    },
                    {
                        text: 'OK',
                        role: 'confirm',
                        handler: () => changeFaction(id),
                    },
                ],
                onDidDismiss: () => {}
            });
        }
    }

    const changeForceSize = (forceSizeId) => {
        setForceSize(forceSizesData[forceSizeId]);
    }

    const clearForce = () => {
        setForceModelsData([]);
        setForceCyphersData([]);
        setSpecialIssueModelsData([]);
        setSpecialIssueCyphersData([]);
    }

    const clearForceConfirm = () => {
        presentAlert({
            header: 'Clear Force?',
            message: 'This action will clear your force',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {},
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        setForceName("New Force");
                        clearForce();
                    },
                },
            ],
            onDidDismiss: () => {}
        });
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
            
            return result;
        }
    }

    const listForces = async () => {
        try {
            const result = await Filesystem.readdir({
                path: forcesPath,
                directory: Directory.Data
            });
            
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
            
            setForcesDirty(true);
            return result;
        } catch (e) {
            console.log(e);
        }
    }

    const saveForceConfirm = async (forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData) => {
        let overwriteWarning = false;
        const sanitizedForceName = sanitize(forceName);
        await listForces().then((result) => {
            if(result && result.files) {
                overwriteWarning = result.files.find((file) => file.name.replace(forcesExtension, "") === sanitizedForceName);
            }
        });
        presentAlert({
            header: 'Save Force?',
            message: overwriteWarning ? `Overwrite the force saved as ${sanitizedForceName}?` : `Save current force as ${sanitizedForceName}?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {},
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {saveForce(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData);},
                },
            ],
            onDidDismiss: () => {}
        });
    }

    const loadForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
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
            setForcesDirty(true);
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
    factionSelectOptions.push(<IonSelectOption key={"all"} value={"all"}>ALL</IonSelectOption>);

    const forceSizeOptions = [];
    Object.entries(forceSizesData).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeOptions.push(<IonSelectOption key={key} value={value.id}>{`${value.name} ${value.id !== "custom" ? `(${value.units} / ${value.hero_solos})` : ""}`}</IonSelectOption>);
    });
    return (
        <IonPage>
            <IonContent>
                <LoadForceModal isOpen={isLoadForceModalOpen} setIsOpen={setIsLoadForceModalOpen} forceFiles={forceFiles} loadForce={loadForce} deleteForce={deleteForce}></LoadForceModal>
                {(tabSelected === editorTabs.force || tabSelected === editorTabs.rack) 
                ? <>
                    <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={factionId} onIonChange={(e) => changeFactionConfirm(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3><IonSelect label="Force Size:" justify="start" value={forceSize.id} onIonChange={(e) => changeForceSize(e.detail.value)}>{forceSizeOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h2>Force Name: <IonInput type="text" value={forceName} onIonChange={(e) => setForceName(sanitize(e.target.value))}/></h2></IonText>
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" onClick={() => {saveForceConfirm(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData)}}><div>SAVE</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" disabled={forceFiles.length === 0} onClick={() => {setIsLoadForceModalOpen(true)}}>LOAD</IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {copyForceToText(forceName, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData)}}><div>COPY TO TEXT</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {clearForceConfirm()}}><div>CLEAR ALL</div></IonButton></IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size={"auto"}>
                                <ModelCount models={forceModelsData} maxUnits={forceSize.units} freeHeroSolos={forceSize.hero_solos}/>
                            </IonCol>
                            <IonCol size={"auto"}>
                                <CypherCount cyphers={forceCyphersData}/>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </>
                : <>
                    <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={cardViewFactionId} onIonChange={(e) => changeCardViewFaction(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                </>}
                {tabSelected === editorTabs.force && <ForceEditor 
                    factionId={factionId}
                    forceName={forceName} 
                    forceModelsData={forceModelsData} 
                    setForceModelsData={setForceModelsData} 
                    specialIssueModelsData={specialIssueModelsData} 
                    setSpecialIssueModelsData={setSpecialIssueModelsData}
                ></ForceEditor>}
                
                {tabSelected === editorTabs.rack && <RackEditor 
                    factionId={factionId}
                    forceCyphersData={forceCyphersData}
                    setForceCyphersData={setForceCyphersData}
                    specialIssueCyphersData={specialIssueCyphersData} 
                    setSpecialIssueCyphersData={setSpecialIssueCyphersData}
                ></RackEditor>}

                {tabSelected === editorTabs.cards && <CardListViewer 
                    factionId={cardViewFactionId}
                ></CardListViewer>}
            </IonContent>
            <IonFooter>
                <IonToolbar>
                    <IonSegment value={tabSelected} onIonChange={(e) => setTabSelected(e.detail.value)}>
                        <IonSegmentButton value={editorTabs.force}>
                            <IonLabel>Force</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.rack}>
                            <IonLabel>Rack</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.cards}>
                            <IonLabel>Cards</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
}

export default EditorView;
