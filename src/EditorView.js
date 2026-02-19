import React, { createRef, useEffect, useState } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import sanitize from "sanitize-filename";
import { useSessionStorageState, useLocalStorageState } from "ahooks";
import { IonPage, IonContent, IonHeader, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonSelect, IonSelectOption, IonButton, IonIcon, IonGrid, IonCol, IonRow, useIonAlert, useIonToast } from "@ionic/react";
import { warning } from "ionicons/icons";

var semver = require("semver");

import { copyForceToText } from "./util/copyForceToText";

import ModelCount from "./ModelCount.js";
import CypherCount from "./CypherCount.js";
import CardListViewer from "./CardListViewer";
import SaveLoadModal from "./SaveLoadModal.js";
import ForceEditor from "./ForceEditor";
import RackEditor from "./RackEditor";
import PlayModeTracker from "./PlayModeTracker";
import PlayModeViewer from "./PlayModeViewer";
import VersionNumber from "./VersionNumber";

import { getFactionsData, getForceSizesData, getModelsData, rulesets } from "./DataLoader";

const forcesPath = "eschatonic-well/forces/";
const racksPath = "eschatonic-well/racks/";
export const forcesExtension = ".esch";
export const racksExtension = ".rack";

export const forceFormatVersion = "0.1.0";
export const rackFormatVersion = "0.1.0";

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

    const [promptSave, setPromptSave] = useSessionStorageState("promptSave", {defaultValue: false});
    const [warningText, setWarningText] = useSessionStorageState("warningText", {defaultValue: ""});

    const [filesDirty, setFilesDirty] = useState(true);
    const [forceFiles, setForceFiles] = useState([]);
    const [rackFiles, setRackFiles] = useState([]);
    const [isSaveLoadForceModalOpen, setIsSaveLoadForceModalOpen] = useState(false);
    const [isSaveLoadRackModalOpen, setIsSaveLoadRackModalOpen] = useState(false);
    const [isLoadPlayForceModalOpen, setIsLoadPlayForceModalOpen] = useState(false);

    useEffect(() => {
        (async function () {
            const forcesResult = await listFiles(forcesPath);
            const racksResult = await listFiles(racksPath);
            if(filesDirty && (forcesResult && racksResult)) {
                const forces = [];
                const racks = [];
                for await (const file of forcesResult.files) {
                    const formatVersion = await getFormatVersionFromFile(forcesPath, file.name);
                    const factionId = await getFactionIdFromFile(forcesPath, file.name);
                    forces.push({fileInfo: file, formatVersion: formatVersion, factionId: factionId});
                }
                for await (const file of racksResult.files) {
                    const formatVersion = await getFormatVersionFromFile(racksPath, file.name);
                    const factionId = await getFactionIdFromFile(racksPath, file.name);
                    racks.push({fileInfo: file, formatVersion: formatVersion, factionId: factionId});
                }
                setForceFiles(forces);
                setRackFiles(racks);
                setFilesDirty(false);
            }
        })();
    }, [filesDirty]);

    const factionsData = getFactionsData(rulesetId);
    const forceSizesData = getForceSizesData(rulesetId);
    const modelsData = getModelsData(rulesetId);

    const presentToast = (message, isWarning) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
            icon: isWarning ? warning : undefined,
            color: isWarning ? "warning" : undefined
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
        setPromptSave(false);
        setWarningText("");
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
            const result = await Filesystem.mkdir({
                path: path,
                directory: Directory.Documents,
                recursive: true
            });
            
            return result;
        }  catch (e) {
            console.error(e);
        }
    };

    const listFiles = async (path) => {
        try {
            const result = await Filesystem.readdir({
                path: path,
                directory: Directory.Documents
            });
            
            return result;
        } catch (e) {
            try {
                await createDir(path);            
                const result = await Filesystem.readdir({
                    path: path,
                    directory: Directory.Documents
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const getFormatVersionFromFile = async (path, filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${path}${filename}`,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            return json.formatVersion;
        } catch (e) {
            console.error(e);
        }
    };

    const getFactionIdFromFile = async (path, filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${path}${filename}`,
                directory: Directory.Documents,
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
            "formatVersion": forceFormatVersion,
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
                directory: Directory.Documents,
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

    const insertCadreData = (forceModelsData) => {
        let newForceModelsData = forceModelsData.map((forceModel) => {
            if(!forceModel.cadre) {
                forceModel.cadre = modelsData[forceModel.modelId].cadre;
            }
            return forceModel;
        });
        return newForceModelsData;
    };

    const loadForce = async (filename) => {
        try {
            const result = await Filesystem.readFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            if(!json.formatVersion || semver.ltr(json.formatVersion, forceFormatVersion)) {
                console.log(json.formatVersion);
                setPromptSave(true);
                setWarningText(`Force ${json.forceName} format out of date, please save force`);
            } else {
                setPromptSave(false);
                setWarningText(false);
            }
            setForceName(json.forceName);
            // Forces saved in earlier versions won't have a ruleset, so assume pp
            setRulesetId(json.rulesetId ? json.rulesetId : "pp");
            setFactionId(json.factionId);
            setForceSizeId(json.forceSize.id);
            // This is a necessary stopgap to ensure that older-style lists will have cadre data filled in correctly
            setForceModelsData(insertCadreData(json.forceModelsData));
            setForceCyphersData(json.forceCyphersData);
            // This is a necessary stopgap to ensure that older-style lists will have cadre data filled in correctly
            setSpecialIssueModelsData(insertCadreData(json.specialIssueModelsData));
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
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            if(!json.formatVersion || semver.ltr(json.formatVersion, forceFormatVersion)) {
                console.log(json.formatVersion);
                presentToast(`Could not load force ${json.forceName}. File format out of date!`, true);
                throw new Error(`Force ${filename} file format out of date!`);
            }
            setPlayForceName(json.forceName);
            setPlayRulesetId(json.rulesetId);
            setPlayFactionId(json.factionId);
            setPlayForceSizeId(json.forceSize.id);
            setPlayForceModelsData(json.forceModelsData);
            setPlayForceCyphersData(json.forceCyphersData);
            setPlaySpecialIssueModelsData(json.specialIssueModelsData);
            setPlaySpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Force ${json.forceName} loaded successfully`);
            setPlayTabSelected(playTabs.reserves);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteForce = async (filename) => {
        try {
            const result = await Filesystem.deleteFile({
                path: `${forcesPath}${filename}`,
                directory: Directory.Documents,
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
            "formatVersion": rackFormatVersion,
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
                directory: Directory.Documents,
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
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });
            
            const json = JSON.parse(result.data);
            if(!json.formatVersion || semver.ltr(json.formatVersion, rackFormatVersion)) {
                console.log(json.formatVersion);
                setPromptSave(true);
                setWarningText(`Rack ${json.rackName} format out of date, please save rack`);
            }
            //Forces saved in earlier versions won't have a ruleset, so assume pp
            setRulesetId(json.rulesetId ? json.rulesetId : "pp");
            setForceCyphersData(json.forceCyphersData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Rack ${json.rackName} loaded successfully`);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteRack = async (filename) => {
        try {
            const result = await Filesystem.deleteFile({
                path: `${racksPath}${filename}`,
                directory: Directory.Documents,
            });
            setFilesDirty(racksPath, true);
            
            presentToast(`Rack ${filename.replace(racksExtension, "")} deleted successfully`);
            return result;
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
                {(tabSelected === editorTabs.play) && <>
                    <PlayModeTracker rulesetId={playRulesetId} factionId={playFactionId}></PlayModeTracker>
                </>}
                {(promptSave || warningText) && <>
                    <IonText color="warning"><h3 className="warning-header"><IonIcon icon={warning} size={"large"} style={{position: "relative", top: "0.5rem"}}></IonIcon>{warningText}</h3></IonText>
                </>}
            </IonHeader>
            <IonContent ref={contentRef}>
                <SaveLoadModal isOpen={isSaveLoadForceModalOpen} setIsOpen={setIsSaveLoadForceModalOpen} title={"Save/Load Force"} fileTypeName={"force"} fileExtension={forcesExtension} filesPath={forcesPath} files={forceFiles} defaultFileName={forceName} fileData={forceData} loadFile={loadForce} deleteFile={deleteForce} listFiles={listFiles} saveFile={saveForce}></SaveLoadModal>
                <SaveLoadModal isOpen={isSaveLoadRackModalOpen} setIsOpen={setIsSaveLoadRackModalOpen} title={"Save/Load Rack"} fileTypeName={"rack"} fileExtension={racksExtension} filesPath={forcesPath} files={rackFiles} defaultFileName={"New Rack"} fileData={rackData} filterFiles={filterRacks} loadFile={loadRack} deleteFile={deleteRack} listFiles={listFiles} saveFile={saveRack}></SaveLoadModal>
                <SaveLoadModal isOpen={isLoadPlayForceModalOpen} setIsOpen={setIsLoadPlayForceModalOpen} disableSave={true} title={"Load Force"} fileTypeName={"force"} fileExtension={forcesExtension} files={forceFiles} loadFile={loadPlayForce}></SaveLoadModal>

                {(tabSelected === editorTabs.force || tabSelected === editorTabs.rack) && <>
                    <IonText color="primary"><h3 className="label"><IonSelect label="Ruleset:" justify="start" value={rulesetId} onIonChange={(e) => changeRulesetConfirm(e.detail.value)}>{rulesetSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3 className="label"><IonSelect label="Faction:" justify="start" value={factionId} onIonChange={(e) => changeFactionConfirm(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3 className="label"><IonSelect label="Force Size:" justify="start" value={forceSizeId} onIonChange={(e) => changeForceSize(e.detail.value)}>{forceSizeOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h2 className="label">Force Name: {forceName}</h2></IonText>
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" onClick={() => {setIsSaveLoadForceModalOpen(true);}}><div>SAVE/LOAD FORCE AND RACK</div></IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {setIsSaveLoadRackModalOpen(true);}}><div>SAVE/LOAD RACK ONLY</div></IonButton></IonCol>
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
                    <IonText color="primary"><h3 className="label"><IonSelect label="Ruleset:" justify="start" value={rulesetId} onIonChange={(e) => changeRulesetConfirm(e.detail.value)}>{rulesetSelectOptions}</IonSelect></h3></IonText>
                    <IonText color="primary"><h3 className="label"><IonSelect label="Faction:" justify="start" value={cardViewFactionId} onIonChange={(e) => changeCardViewFaction(e.detail.value)}>{factionSelectOptions}</IonSelect></h3></IonText>
                </>}
                {(tabSelected === editorTabs.play) && <>
                    {playRulesetId && <IonText color="primary"><h3 className="label">Ruleset: {rulesets[playRulesetId].name}</h3></IonText>}
                    {playFactionId && <IonText color="primary"><h3 className="label">Faction: {factionsData[playFactionId].name}</h3></IonText>}
                    {playForceSizeId && <IonText color="primary"><h3 className="label">Force Size: {forceSizesData[playForceSizeId].name}</h3></IonText>}
                    {playForceName && <IonText color="primary"><h2 className="label">Force Name: {playForceName}</h2></IonText>}
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
