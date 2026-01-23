import React, { createRef, useEffect, useState } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import sanitize from "sanitize-filename";
import { useSessionStorageState, useLocalStorageState } from "ahooks";
import { IonPage, IonContent, IonHeader, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonSelect, IonSelectOption, IonButton, IonGrid, IonCol, IonRow, useIonAlert, useIonToast } from "@ionic/react";

import { copyForceToText } from "./util/copyForceToText";

import ModelCount from "./ModelCount.js";
import CypherCount from "./CypherCount.js";
import CardListViewer from "./CardListViewer";
import LoadModal from "./LoadModal";
import SaveModal from "./SaveModal";
import ForceEditor from "./ForceEditor";
import RackEditor from "./RackEditor";
import PlayModeViewer from "./PlayModeViewer";
import VersionNumber from "./VersionNumber";

import { getFactionsData, getForceSizesData, rulesets } from "./DataLoader";

const forcesPath = "eschatonic-well/forces/";
const racksPath = "eschatonic-well/racks/";
const forcesExtension = ".esch";
const racksExtension = ".rack";

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
    const [forceSizeId, setForceSizeId] = useLocalStorageState("forceSize", {defaultValue: "custom"});

    const [forceName, setForceName] = useSessionStorageState("forceName", {defaultValue: "New Force"});
    const [forceModelsData, setForceModelsData] = useSessionStorageState("forceModelsData", {defaultValue: [], listenStorageChange: true});
    const [forceCyphersData, setForceCyphersData] = useSessionStorageState("forceCyphersData", {defaultValue: [], listenStorageChange: true});
    const [specialIssueModelsData, setSpecialIssueModelsData] = useSessionStorageState("specialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [specialIssueCyphersData, setSpecialIssueCyphersData] = useSessionStorageState("specialIssueCyphersData", {defaultValue: [], listenStorageChange: true});

    const [playForceName, setPlayForceName] = useSessionStorageState("playForceName", {defaultValue: undefined});
    const [playRulesetId, setPlayRulesetId] = useLocalStorageState("playRulesetId", {defaultValue: "pp"});
    const [playFactionId, setPlayFactionId] = useLocalStorageState("playFactionId", {defaultValue: undefined});
    const [playForceSizeId, setPlayForceSizeId] = useLocalStorageState("playForceSizeId", {defaultValue: "custom"});
    const [playForceModelsData, setPlayForceModelsData] = useSessionStorageState("playForceModelsData", {defaultValue: []});
    const [playForceCyphersData, setPlayForceCyphersData] = useSessionStorageState("playForceCyphersData", {defaultValue: []});
    const [playSpecialIssueModelsData, setPlaySpecialIssueModelsData] = useSessionStorageState("playSpecialIssueModelsData", {defaultValue: []});
    const [playSpecialIssueCyphersData, setPlaySpecialIssueCyphersData] = useSessionStorageState("playSpecialIssueCyphersData", {defaultValue: []});

    const [filesDirty, setFilesDirty] = useState(true);
    const [forceFiles, setForceFiles] = useState([]);
    const [rackFiles, setRackFiles] = useState([]);
    const [isLoadForceModalOpen, setIsLoadForceModalOpen] = useState(false);
    const [isLoadRackModalOpen, setIsLoadRackModalOpen] = useState(false);
    const [isLoadPlayForceModalOpen, setIsLoadPlayForceModalOpen] = useState(false);
    
    const [isSaveForceModalOpen, setIsSaveForceModalOpen] = useState(false);
    const [isSaveRackModalOpen, setIsSaveRackModalOpen] = useState(false);

    useEffect(() => {
        (async function () {
            await createDir(forcesPath);
            await createDir(racksPath);
            const forcesResult = await listFiles(forcesPath);
            const racksResult = await listFiles(racksPath);
            if(filesDirty && (forcesResult && racksResult)) {
                const forces = [];
                const racks = [];
                for await (const file of forcesResult.files) {
                    const factionId = await getFactionIdFromFile(forcesPath, file.name);
                    forces.push({fileInfo: file, factionId: factionId});
                }
                for await (const file of racksResult.files) {
                    const factionId = await getFactionIdFromFile(racksPath, file.name);
                    racks.push({fileInfo: file, factionId: factionId});
                }
                setForceFiles(forces);
                setRackFiles(racks);
                setFilesDirty(false);
            }
        })();
    }, [filesDirty]);

    const factionsData = getFactionsData(rulesetId);
    const forceSizesData = getForceSizesData(rulesetId);

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
        presentToast(`Faction changed to ${factionsData[id].name}, force cleared`);
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
        presentToast(`Force size changed to ${forceSizesData[forceSizeId].name}`);
        setForceSizeId(forceSizeId);
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

    const createDir = async (path) => {
        try {
            listFiles(path);
            return;
        } catch (e) {
            const result = await Filesystem.mkdir({
                path: path,
                directory: Directory.Data,
                recursive: true
            });
            
            return result;
        }
    };

    const listFiles = async (path) => {
        try {
            const result = await Filesystem.readdir({
                path: path,
                directory: Directory.Data
            });
            
            return result;
        } catch (e) {
            console.error(e);
        }
    };

    const getFactionIdFromFile = async (path, filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${path}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            return json.factionId;
        } catch (e) {
            console.error(e);
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
            
            setFilesDirty(true);
            presentToast(`Force saved as ${forceName} successfully`);
            return result;
        } catch (e) {
            console.error(e);
        }
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
            setFactionId(json.factionId);
            setForceSizeId(json.forceSize.id);
            setForceModelsData(json.forceModelsData);
            setForceCyphersData(json.forceCyphersData);
            setSpecialIssueModelsData(json.specialIssueModelsData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Force ${json.forceName} loaded successfully`);
        } catch (e) {
            console.error(e);
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
            setPlayForceName(json.forceName);
            //Forces saved in earlier versions won't have a ruleset, so assume pp
            setPlayRulesetId(json.rulesetId ? json.rulesetId : "pp");
            setPlayFactionId(json.factionId);
            setPlayForceSizeId(json.forceSize.id);
            setPlayForceModelsData(json.forceModelsData);
            setPlayForceCyphersData(json.forceCyphersData);
            setPlaySpecialIssueModelsData(json.specialIssueModelsData);
            setPlaySpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Force ${json.forceName} loaded successfully`);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteForce = async (filename) => {
        try {
            const result = await Filesystem.deleteFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Data,
            });
            setFilesDirty(forcesPath, true);
            
            presentToast(`Force ${filename.replace(forcesExtension, "")} deleted successfully`);
            return result;
        } catch (e) {
            console.error(e);
        }
    };

    const getRackFactionId = (forceCyphersData, specialIssueCyphersData) => {
        const allCyphers = forceCyphersData.concat(specialIssueCyphersData);
        const factionCyphers = allCyphers.filter((cypher) => cypher.factions.some((faction) => faction !== "all"));
        console.log(factionCyphers);
        const collectedFactionIds = new Set();
        factionCyphers.forEach((cypher) => {
            cypher.factions.forEach((faction) => {
                collectedFactionIds.add(faction);
            });
        });
        // Assuming there are no multi-faction cyphers, which currently don't exist
        const factionId = collectedFactionIds.size === 1 ? collectedFactionIds.keys().next().value : collectedFactionIds.size < 1 ? "all" : "multi";
        return factionId;
    };

    const filterRacks = (file) => {
        return file.factionId === "multi" && factionId == "all" || file.factionId === factionId || file.factionId === "all";
    };

    const saveRack = async (rackName, rulesetId, forceCyphersData, specialIssueCyphersData) => {
        const factionId = getRackFactionId(forceCyphersData, specialIssueCyphersData);
        const json = {
            "rackName": rackName,
            "rulesetId": rulesetId,
            "factionId": factionId,
            "forceCyphersData": forceCyphersData,
            "specialIssueModelsData": specialIssueModelsData,
            "specialIssueCyphersData": specialIssueCyphersData
        };
        const filename = sanitize(rackName);
        try {
            const result = await Filesystem.writeFile({
                path: `${racksPath}${filename}${racksExtension}`,
                data: JSON.stringify(json),
                directory: Directory.Data,
                encoding: Encoding.UTF8,
                recursive: true
            });
            
            setFilesDirty(true);
            presentToast(`Rack saved as ${rackName} successfully`);
            return result;
        } catch (e) {
            console.error(e);
        }
    };

    const loadRack = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${racksPath}${filename}`,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            //Forces saved in earlier versions won't have a ruleset, so assume pp
            setRulesetId(json.rulesetId ? json.rulesetId : "pp");
            setForceCyphersData(json.forceCyphersData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Rack ${json.rackName} loaded successfully`);
        } catch (e) {
            console.error(e);
        }
    };

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

    const rulesetSelectOptions = [];
    Object.entries(rulesets).forEach(([key, value]) => {
        if(!value.hidden) {
            rulesetSelectOptions.push(<IonSelectOption key={key} value={value.id}>{value.name}</IonSelectOption>);
        }
    });

    const forceSize = forceSizesData[forceSizeId];

    const forceData = [rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData];
    const rackData = [rulesetId, forceCyphersData, specialIssueCyphersData];

    return (
        <IonPage className={(tabSelected === editorTabs.cards ? cardViewFactionId : tabSelected === editorTabs.play ? playFactionId : factionId)}>
            <IonHeader>
                <VersionNumber/>
                <IonToolbar>
                    <IonSegment mode="md" value={tabSelected} onIonChange={(e) => {
                        scrollToTop();
                        setTabSelected(e.detail.value );
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
                <LoadModal isOpen={isLoadForceModalOpen} setIsOpen={setIsLoadForceModalOpen} title={"Load Force"} fileTypeName={"force"} fileExtension={forcesExtension} files={forceFiles} loadFile={loadForce} deleteFile={deleteForce}></LoadModal>
                <LoadModal isOpen={isLoadRackModalOpen} setIsOpen={setIsLoadRackModalOpen} title={"Load Rack"} fileTypeName={"rack"} fileExtension={racksExtension} files={rackFiles} filterFiles={filterRacks} loadFile={loadRack}></LoadModal>
                <LoadModal isOpen={isLoadPlayForceModalOpen} setIsOpen={setIsLoadPlayForceModalOpen} title={"Load Force"} fileTypeName={"force"} fileExtension={forcesExtension} files={forceFiles} loadFile={loadPlayForce}></LoadModal>

                <SaveModal isOpen={isSaveForceModalOpen} setIsOpen={setIsSaveForceModalOpen} title={"Save Force"} fileTypeName={"force"} fileExtension={forcesExtension} filesPath={forcesPath} defaultFileName={forceName} fileData={forceData} listFiles={listFiles} saveFile={saveForce}></SaveModal>
                <SaveModal isOpen={isSaveRackModalOpen} setIsOpen={setIsSaveRackModalOpen} title={"Save Rack"} fileTypeName={"rack"} fileExtension={racksExtension} filesPath={racksPath} defaultFileName={"New Rack"} fileData={rackData} listFiles={listFiles} saveFile={saveRack}></SaveModal>

                {(tabSelected === editorTabs.force || tabSelected === editorTabs.rack) && <>
                    <IonText color="primary"><h3><IonSelect label="Ruleset:" justify="start" value={rulesetId} onIonChange={(e) => changeRulesetConfirm(e.detail.value)}>{rulesetSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3><IonSelect label="Faction:" justify="start" value={factionId} onIonChange={(e) => changeFactionConfirm(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3><IonSelect label="Force Size:" justify="start" value={forceSizeId} onIonChange={(e) => changeForceSize(e.detail.value)}>{forceSizeOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h2>Force Name: {forceName}</h2></IonText>
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" onClick={() => {setIsSaveForceModalOpen(true);}}><div>SAVE FORCE AND RACK</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" disabled={forceFiles.length === 0} onClick={() => {setIsLoadForceModalOpen(true);}}>LOAD FORCE AND RACK</IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {setIsSaveRackModalOpen(true);}}><div>SAVE RACK ONLY</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" disabled={forceFiles.length === 0} onClick={() => {setIsLoadRackModalOpen(true);}}>LOAD RACK ONLY</IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {
                                copyForceToText(forceName, rulesetId, factionId, forceSize, forceModelsData, forceCyphersData, specialIssueModelsData, specialIssueCyphersData);
                                presentToast("Force copied to clipboard");
                            }}><div>COPY TO TEXT</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {clearForceConfirm();}}><div>CLEAR ALL</div></IonButton></IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size={"auto"}>
                                <ModelCount rulesetId={rulesetId} models={forceModelsData} specialIssue={specialIssueModelsData} maxUnits={forceSize.units} freeHeroSolos={forceSize.hero_solos}/>
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
                    {playRulesetId && <IonText color="primary"><h3>Ruleset: {rulesets[playRulesetId].name}</h3></IonText>}
                    {playFactionId && <IonText color="primary"><h3>Faction: {factionsData[playFactionId].name}</h3></IonText>}
                    {playForceSizeId && <IonText color="primary"><h3>Force Size: {forceSizesData[playForceSizeId].name}</h3></IonText>}
                    {playForceName && <IonText color="primary"><h2>Force Name: {playForceName}</h2></IonText>}
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" disabled={forceFiles.length === 0} onClick={() => {setIsLoadPlayForceModalOpen(true);}}>LOAD</IonButton></IonCol>
                        </IonRow>
                    </IonGrid>
                </>}

                {tabSelected === editorTabs.force && <ForceEditor 
                    tabSelected={forceTabSelected}
                    rulesetId={rulesetId}
                    factionId={factionId}
                    forceName={forceName} 
                    forceModelsData={forceModelsData} 
                    setForceModelsData={setForceModelsData} 
                    specialIssueModelsData={specialIssueModelsData} 
                    setSpecialIssueModelsData={setSpecialIssueModelsData}
                ></ForceEditor>}
                
                {tabSelected === editorTabs.rack && <RackEditor 
                    tabSelected={rackTabSelected}
                    rulesetId={rulesetId}
                    factionId={factionId}
                    forceCyphersData={forceCyphersData}
                    setForceCyphersData={setForceCyphersData}
                    specialIssueCyphersData={specialIssueCyphersData} 
                    setSpecialIssueCyphersData={setSpecialIssueCyphersData}
                ></RackEditor>}

                {tabSelected === editorTabs.cards && <CardListViewer 
                    rulesetId={rulesetId}
                    factionId={cardViewFactionId}
                ></CardListViewer>}

                {tabSelected === editorTabs.play && <PlayModeViewer
                    tabSelected={playTabSelected}
                    rulesetId={playRulesetId}
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
