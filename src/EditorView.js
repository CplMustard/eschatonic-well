import React, { createRef, useEffect, useState } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import sanitize from "sanitize-filename";
import { useSessionStorageState, useLocalStorageState } from "ahooks";
import { IonPage, IonContent, IonHeader, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonSelect, IonSelectOption, IonInput, IonButton, IonGrid, IonCol, IonRow, useIonAlert, useIonToast } from "@ionic/react";

import { copyForceToText } from "./util/copyForceToText";

import ModelCount from "./ModelCount.js";
import CypherCount from "./CypherCount.js";
import CardListViewer from "./CardListViewer";
import LoadForceModal from "./LoadForceModal";
import ForceEditor from "./ForceEditor";
import RackEditor from "./RackEditor";
import PlayModeViewer from "./PlayModeViewer";

import { getFactionsData, getForceSizesData, setRuleset, rulesets } from "./data";

const forcesPath = "eschatonic-well/forces/";
const forcesExtension = ".esch";

const editorTabs = {force: 0, rack: 1, cards: 2, play: 3};
export const forceTabs = {force: 0, special_issue: 1, units: 2 };
export const rackTabs = {rack: 0, special_issue: 1, cyphers: 2 };
export const playTabs = {deployed: 0, reserves: 1, rack: 2 };

function EditorView() {
    
    const [presentAlert] = useIonAlert();
    const [present] = useIonToast();

    const [tabSelected, setTabSelected] = useSessionStorageState("tabSelected", {defaultValue: editorTabs.force});
    const [forceTabSelected, setForceTabSelected] = useSessionStorageState("forceTabSelected", {defaultValue: forceTabs.force});
    const [rackTabSelected, setRackTabSelected] = useSessionStorageState("rackTabSelected", {defaultValue: rackTabs.rack});
    const [playTabSelected, setPlayTabSelected] = useSessionStorageState("playTabSelected", {defaultValue: playTabs.deployed});
    
    const [cardViewFactionId, setCardViewFactionId] = useLocalStorageState("cardViewFactionId", {defaultValue: "all"});
    const [rulesetId, setRulesetId] = useLocalStorageState("rulesetId", {defaultValue: "pp"});
    const [factionId, setFactionId] = useLocalStorageState("factionId", {defaultValue: "all"});
    const [forceSize, setForceSize] = useLocalStorageState("forceSize", {defaultValue: getForceSizesData()["custom"]});

    const [forceName, setForceName] = useSessionStorageState("forceName", {defaultValue: "New Force"});
    const [forceModelsData, setForceModelsData] = useSessionStorageState("forceModelsData", {defaultValue: [], listenStorageChange: true});
    const [forceCyphersData, setForceCyphersData] = useSessionStorageState("forceCyphersData", {defaultValue: [], listenStorageChange: true});
    const [specialIssueModelsData, setSpecialIssueModelsData] = useSessionStorageState("specialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [specialIssueCyphersData, setSpecialIssueCyphersData] = useSessionStorageState("specialIssueCyphersData", {defaultValue: [], listenStorageChange: true});

    const [playForceName, setPlayForceName] = useSessionStorageState("playForceName", {defaultValue: undefined});
    const [playRulesetId, setPlayRulesetId] = useLocalStorageState("playRulesetId", {defaultValue: undefined});
    const [playFactionId, setPlayFactionId] = useLocalStorageState("playFactionId", {defaultValue: undefined});
    const [playForceSize, setPlayForceSize] = useLocalStorageState("playForceSize", {defaultValue: undefined});
    const [playForceModelsData, setPlayForceModelsData] = useSessionStorageState("playForceModelsData", {defaultValue: []});
    const [playForceCyphersData, setPlayForceCyphersData] = useSessionStorageState("playForceCyphersData", {defaultValue: []});
    const [playSpecialIssueModelsData, setPlaySpecialIssueModelsData] = useSessionStorageState("playSpecialIssueModelsData", {defaultValue: []});
    const [playSpecialIssueCyphersData, setPlaySpecialIssueCyphersData] = useSessionStorageState("playSpecialIssueCyphersData", {defaultValue: []});

    const [forcesDirty, setForcesDirty] = useState(true);
    const [forceFiles, setForceFiles] = useState([]);
    const [isLoadForceModalOpen, setIsLoadForceModalOpen] = useState(false);
    const [isLoadPlayForceModalOpen, setIsLoadPlayForceModalOpen] = useState(false);

    useEffect(() => {
        (async function () {
            await createForcesDir();
            const result = await listForces();
            if(forcesDirty && result) {
                const forces = [];
                for await (const file of result.files) {
                    const factionId = await getFactionIdFromForce(file.name);
                    forces.push({fileInfo: file, factionId: factionId});
                }
                setForceFiles(forces);
                setForcesDirty(false);
            }
        })();
    }, [forcesDirty]);

    useEffect(() => {
        if(tabSelected === editorTabs.play) {
            console.log("loading play ruleset " + playRulesetId);
            setRuleset(playRulesetId);
        } else {
            console.log("loading normal ruleset " + rulesetId);
            setRuleset(rulesetId);
        }
    });

    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
        });
    };

    const contentRef = createRef();
  
    function scrollToTop() {
        contentRef.current?.scrollToTop();
    }

    const changeCardViewFaction = (id) => {
        setCardViewFactionId(id);
    };

    const changeRuleset = (id) => {
        presentToast(`Ruleset changed to ${rulesets[id].name}`);
        setRulesetId(id);
        setRuleset(id);
    };

    const changeRulesetConfirm = (id) => {
        if(factionId !== id) {
            presentAlert({
                header: "Change Ruleset?",
                buttons: [
                    {
                        text: "Cancel",
                        role: "cancel",
                        handler: () => {},
                    },
                    {
                        text: "OK",
                        role: "confirm",
                        handler: () => changeRuleset(id),
                    },
                ],
                onDidDismiss: () => {}
            });
        }
    };
    
    const changeFaction = (id) => {
        presentToast(`Faction changed to ${getFactionsData()[id].name}, force cleared`);
        setFactionId(id);
        clearForce();
    };

    const changeFactionConfirm = (id) => {
        if(factionId !== id) {
            presentAlert({
                header: "Change Faction?",
                message: "Changing faction will clear your force",
                buttons: [
                    {
                        text: "Cancel",
                        role: "cancel",
                        handler: () => {},
                    },
                    {
                        text: "OK",
                        role: "confirm",
                        handler: () => changeFaction(id),
                    },
                ],
                onDidDismiss: () => {}
            });
        }
    };

    const changeForceSize = (forceSizeId) => {
        presentToast(`Force size changed to ${getForceSizesData()[forceSizeId].name}`);
        setForceSize(getForceSizesData()[forceSizeId]);
    };

    const clearForce = () => {
        presentToast("Force cleared");
        setForceModelsData([]);
        setForceCyphersData([]);
        setSpecialIssueModelsData([]);
        setSpecialIssueCyphersData([]);
    };

    const clearForceConfirm = () => {
        presentAlert({
            header: "Clear Force?",
            message: "This action will clear your force",
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                    handler: () => {},
                },
                {
                    text: "OK",
                    role: "confirm",
                    handler: () => {
                        setForceName("New Force");
                        clearForce();
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

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
    };

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
    };

    const getFactionIdFromForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            return json.factionId;
        } catch (e) {
            console.log(e);
        }
    };

    const saveForce = async (forceName, rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData) => {
        const json = {
            "forceName": forceName,
            "rulesetId": rulesetId,
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
            presentToast(`Force saved as ${forceName} successfully`);
            return result;
        } catch (e) {
            console.log(e);
        }
    };

    const saveForceConfirm = async (forceName, rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData) => {
        let showOverwriteWarning = false;
        const sanitizedForceName = sanitize(forceName);
        const result = await listForces();
        if(result && result.files) {
            showOverwriteWarning = result.files.find((file) => file.name.replace(forcesExtension, "") === sanitizedForceName);
        }
        presentAlert({
            header: "Save Force?",
            message: showOverwriteWarning ? `Overwrite the force saved as ${sanitizedForceName}?` : `Save current force as ${sanitizedForceName}?`,
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                    handler: () => {},
                },
                {
                    text: "OK",
                    role: "confirm",
                    handler: () => {saveForce(forceName, rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData);},
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const loadForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            setForceName(json.forceName);
            //Forces saved in earlier versions won't have a ruleset, so assume pp
            setRulesetId(json.rulesetId ? json.rulesetId : "pp");
            setRuleset(rulesetId);
            setFactionId(json.factionId);
            setForceSize(json.forceSize);
            setForceModelsData(json.forceModelsData);
            setForceCyphersData(json.forceCyphersData);
            setSpecialIssueModelsData(json.specialIssueModelsData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Force ${json.forceName} loaded successfully`);
        } catch (e) {
            console.log(e);
        }
    };

    const loadPlayForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            console.log(json);
            setPlayForceName(json.forceName);
            //Forces saved in earlier versions won't have a ruleset, so assume pp
            setPlayRulesetId(json.rulesetId ? json.rulesetId : "pp");
            setRuleset(rulesetId);
            setPlayFactionId(json.factionId);
            setPlayForceSize(json.forceSize);
            setPlayForceModelsData(json.forceModelsData);
            setPlayForceCyphersData(json.forceCyphersData);
            setPlaySpecialIssueModelsData(json.specialIssueModelsData);
            setPlaySpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Force ${json.forceName} loaded successfully`);
        } catch (e) {
            console.log(e);
        }
    };

    const deleteForce = async (filename) => {
        try {
            const result = await Filesystem.deleteFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
            });
            setForcesDirty(true);
            
            presentToast(`Force ${filename.replace(forcesExtension, "")} deleted successfully`);
            return result;
        } catch (e) {
            console.log(e);
        }
    };

    const factionSelectOptions = [];
    Object.entries(getFactionsData()).forEach(([key, value]) => {
        if(!value.hidden) {
            factionSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });
    factionSelectOptions.push(<IonSelectOption key={"all"} value={"all"}>ALL</IonSelectOption>);

    const forceSizeOptions = [];
    Object.entries(getForceSizesData()).sort((a, b) => a[1].units-b[1].units).forEach(([key, value]) => {
        forceSizeOptions.push(<IonSelectOption key={key} value={value.id}>{`${value.name} ${value.id !== "custom" ? `(${value.units} / ${value.hero_solos})` : ""}`}</IonSelectOption>);
    });

    const rulesetSelectOptions = [];
    Object.entries(rulesets).forEach(([key, value]) => {
        if(!value.hidden) {
            rulesetSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });

    return (
        <IonPage className={(tabSelected === editorTabs.cards ? cardViewFactionId : tabSelected === editorTabs.play ? playFactionId : factionId)}>
            <IonHeader>
                <IonToolbar>
                    <IonSegment mode="md" value={tabSelected} onIonChange={(e) => {
                        scrollToTop();
                        setTabSelected(e.detail.value);
                    }}>
                        <IonSegmentButton value={editorTabs.force}>
                            <IonLabel>Force</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.rack}>
                            <IonLabel>Rack</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.cards}>
                            <IonLabel>Cards</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value={editorTabs.play}>
                            <IonLabel>Play</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>
            <IonContent ref={contentRef}>
                <LoadForceModal isOpen={isLoadForceModalOpen} setIsOpen={setIsLoadForceModalOpen} forceFiles={forceFiles} loadForce={loadForce} deleteForce={deleteForce}></LoadForceModal>
                <LoadForceModal isOpen={isLoadPlayForceModalOpen} setIsOpen={setIsLoadPlayForceModalOpen} forceFiles={forceFiles} loadForce={loadPlayForce}></LoadForceModal>
                {(tabSelected === editorTabs.force || tabSelected === editorTabs.rack) && <>
                    <IonText color="primary"><h3><IonSelect label="Ruleset:" justify="start" value={rulesetId} onIonChange={(e) => changeRulesetConfirm(e.detail.value)}>{rulesetSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={factionId} onIonChange={(e) => changeFactionConfirm(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3><IonSelect label="Force Size:" justify="start" value={forceSize.id} onIonChange={(e) => changeForceSize(e.detail.value)}>{forceSizeOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h2>Force Name: <IonInput type="text" fill="solid" value={forceName} onIonChange={(e) => setForceName(sanitize(e.target.value))}/></h2></IonText>
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" onClick={() => {saveForceConfirm(forceName, rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData);}}><div>SAVE</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" disabled={forceFiles.length === 0} onClick={() => {setIsLoadForceModalOpen(true);}}>LOAD</IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {
                                copyForceToText(forceName, rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData);
                                presentToast("Force copied to clipboard");
                            }}><div>COPY TO TEXT</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {clearForceConfirm();}}><div>CLEAR ALL</div></IonButton></IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size={"auto"}>
                                <ModelCount models={forceModelsData} specialIssue={specialIssueModelsData} maxUnits={forceSize.units} freeHeroSolos={forceSize.hero_solos}/>
                            </IonCol>
                            <IonCol size={"auto"}>
                                <CypherCount cyphers={forceCyphersData} specialIssue={specialIssueCyphersData} />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </>}
                {(tabSelected === editorTabs.cards) && <>
                    <IonText color="primary"><h3><IonSelect label="Ruleset:" justify="start" value={rulesetId} onIonChange={(e) => changeRulesetConfirm(e.detail.value)}>{rulesetSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={cardViewFactionId} onIonChange={(e) => changeCardViewFaction(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                </>}
                {(tabSelected === editorTabs.play) && <>
                    {playRulesetId && <IonText color="primary"><h3>Faction: {rulesets[playRulesetId].name}</h3></IonText>}
                    {playFactionId && <IonText color="primary"><h3>Faction: {getFactionsData()[playFactionId].name}</h3></IonText>}
                    {playForceSize && <IonText color="primary"><h3>Force Size: {playForceSize.name}</h3></IonText>}
                    {playForceName && <IonText color="primary"><h2>Force Name: {playForceName}</h2></IonText>}
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" disabled={forceFiles.length === 0} onClick={() => {setIsLoadPlayForceModalOpen(true);}}>LOAD</IonButton></IonCol>
                        </IonRow>
                    </IonGrid>
                </>}

                {tabSelected === editorTabs.force && <ForceEditor 
                    tabSelected={forceTabSelected}
                    factionId={factionId}
                    forceName={forceName} 
                    forceModelsData={forceModelsData} 
                    setForceModelsData={setForceModelsData} 
                    specialIssueModelsData={specialIssueModelsData} 
                    setSpecialIssueModelsData={setSpecialIssueModelsData}
                ></ForceEditor>}
                
                {tabSelected === editorTabs.rack && <RackEditor 
                    tabSelected={rackTabSelected}
                    factionId={factionId}
                    forceCyphersData={forceCyphersData}
                    setForceCyphersData={setForceCyphersData}
                    specialIssueCyphersData={specialIssueCyphersData} 
                    setSpecialIssueCyphersData={setSpecialIssueCyphersData}
                ></RackEditor>}

                {tabSelected === editorTabs.cards && <CardListViewer 
                    factionId={cardViewFactionId}
                ></CardListViewer>}

                {tabSelected === editorTabs.play && <PlayModeViewer
                    tabSelected={playTabSelected}
                    forceModelsData={playForceModelsData} 
                    setForceModelsData={setPlayForceModelsData} 
                    specialIssueModelsData={playSpecialIssueModelsData} 
                    setSpecialIssueModelsData={setPlaySpecialIssueModelsData}
                    forceCyphersData={playForceCyphersData}
                    setForceCyphersData={setPlayForceCyphersData}
                    specialIssueCyphersData={playSpecialIssueCyphersData} 
                    setSpecialIssueCyphersData={setPlaySpecialIssueCyphersData}
                ></PlayModeViewer>}
            </IonContent>
            <IonFooter>
                <IonToolbar>
                    {tabSelected === editorTabs.force && 
                        <IonSegment mode="ios" value={forceTabSelected} onIonChange={(e) => setForceTabSelected(e.detail.value)}>
                            <IonSegmentButton value={forceTabs.force} fill="outline">
                                <IonLabel>Forcelist</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value={forceTabs.special_issue}>
                                <IonLabel>Special Issue</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value={forceTabs.units}>
                                <IonLabel>Units</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    }
                    {tabSelected === editorTabs.rack && 
                        <IonSegment mode="ios" value={rackTabSelected} onIonChange={(e) => setRackTabSelected(e.detail.value)}>
                            <IonSegmentButton value={rackTabs.rack} fill="outline">
                                <IonLabel>Rack</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value={rackTabs.special_issue}>
                                <IonLabel>Special Issue</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value={rackTabs.cyphers}>
                                <IonLabel>Cyphers</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    }
                    {tabSelected === editorTabs.play && 
                        <IonSegment mode="ios" value={playTabSelected} onIonChange={(e) => setPlayTabSelected(e.detail.value)}>
                            <IonSegmentButton value={playTabs.deployed} fill="outline">
                                <IonLabel>Deployed</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value={playTabs.reserves}>
                                <IonLabel>Reserves</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value={playTabs.rack}>
                                <IonLabel>Rack</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    }
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
}

export default EditorView;
