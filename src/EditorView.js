import React, { createRef, useEffect, useState } from "react";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import sanitize from "sanitize-filename";
import { useSessionStorageState, useLocalStorageState } from "ahooks";
import { IonPage, IonContent, IonHeader, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonSelect, IonSelectOption, IonButton, IonButtons, IonBackButton, IonIcon, IonGrid, IonCol, IonRow, useIonAlert, useIonToast } from "@ionic/react";
import { warning } from "ionicons/icons";

var semver = require("semver");

import { forcesPath, racksPath, forcesExtension, racksExtension, forceFormatVersion, rackFormatVersion, listFiles, getFileHeaderData } from "./util/fileUtil";
import { copyForceToText } from "./util/copyForceToText";

import ModelCount from "./ModelCount.js";
import CypherCount from "./CypherCount.js";
import SaveLoadModal from "./modals/SaveLoadModal.js";
import ForceEditor from "./ForceEditor";
import RackEditor from "./RackEditor";

import { getFactionsData, getForceSizesData, getModelsData, rulesets } from "./DataLoader";

const editorTabs = {force: 0, rack: 1};
export const forceTabs = {force: 0, special_issue: 1, units: 2 };
export const rackTabs = {rack: 0, special_issue: 1, cyphers: 2 };

function EditorView() {
    const [presentAlert] = useIonAlert();
    const [present] = useIonToast();

    const [tabSelected, setTabSelected] = useSessionStorageState("tabSelected", {defaultValue: editorTabs.force});
    const [forceTabSelected, setForceTabSelected] = useSessionStorageState("forceTabSelected", {defaultValue: forceTabs.force});
    const [rackTabSelected, setRackTabSelected] = useSessionStorageState("rackTabSelected", {defaultValue: rackTabs.rack});
    
    const [rulesetId, setRulesetId] = useLocalStorageState("rulesetId", {defaultValue: "pp"});
    const [factionId, setFactionId] = useLocalStorageState("factionId", {defaultValue: "all"});
    const [forceSizeId, setForceSizeId] = useLocalStorageState("forceSize", {defaultValue: "custom"});

    const [forceName, setForceName] = useSessionStorageState("forceName", {defaultValue: "New Force"});
    const [forceModelsData, setForceModelsData] = useSessionStorageState("forceModelsData", {defaultValue: [], listenStorageChange: true});
    const [forceCyphersData, setForceCyphersData] = useSessionStorageState("forceCyphersData", {defaultValue: [], listenStorageChange: true});
    const [specialIssueModelsData, setSpecialIssueModelsData] = useSessionStorageState("specialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [specialIssueCyphersData, setSpecialIssueCyphersData] = useSessionStorageState("specialIssueCyphersData", {defaultValue: [], listenStorageChange: true});

    const [promptSave, setPromptSave] = useSessionStorageState("promptSave", {defaultValue: false});
    const [warningText, setWarningText] = useSessionStorageState("warningText", {defaultValue: ""});

    const [filesDirty, setFilesDirty] = useState(true);
    const [forceFiles, setForceFiles] = useState([]);
    const [rackFiles, setRackFiles] = useState([]);
    const [isSaveLoadForceModalOpen, setIsSaveLoadForceModalOpen] = useState(false);
    const [isSaveLoadRackModalOpen, setIsSaveLoadRackModalOpen] = useState(false);

    useEffect(() => {
        (async function () {
            const forcesResult = await listFiles(forcesPath);
            const racksResult = await listFiles(racksPath);
            if(filesDirty && (forcesResult && racksResult)) {
                const forces = [];
                const racks = [];
                for await (const file of forcesResult.files) {
                    const { formatVersion, factionId, rulesetId } = await getFileHeaderData(forcesPath, file.name);
                    forces.push({fileInfo: file, formatVersion: formatVersion, factionId: factionId, rulesetId: rulesetId});
                }
                for await (const file of racksResult.files) {
                    const { formatVersion, factionId, rulesetId } = await getFileHeaderData(racksPath, file.name);
                    racks.push({fileInfo: file, formatVersion: formatVersion, factionId: factionId, rulesetId: rulesetId});
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

    const changeRuleset = (newRulesetId) => {
        presentToast(`Ruleset changed to ${rulesets[newRulesetId].name}`);
        setRulesetId(newRulesetId);
    };

    const changeRulesetConfirm = (newRulesetId) => {
        if(rulesetId !== newRulesetId) {
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
                        handler: () => changeRuleset(newRulesetId),
                    },
                ],
                onDidDismiss: () => {}
            });
        }
    };
    
    const changeFaction = (newFactionId) => {
        presentToast(`Faction changed to ${factionsData[newFactionId].name}, force cleared`);
        setFactionId(newFactionId);
        clearForce();
    };

    const changeFactionConfirm = (newFactionId) => {
        if(factionId !== newFactionId) {
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
                        handler: () => changeFaction(newFactionId),
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
            setForceName(forceName);
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
            let newForceModelsData = json.forceModelsData;
            // This is a necessary stopgap to ensure that older-style lists will have cadre data filled in correctly
            newForceModelsData = insertCadreData(newForceModelsData);
            setForceModelsData(newForceModelsData);
            setForceCyphersData(json.forceCyphersData);
            let newSpecialIssueModelsData = json.specialIssueModelsData;
            // This is a necessary stopgap to ensure that older-style lists will have cadre data filled in correctly
            newSpecialIssueModelsData = insertCadreData(newSpecialIssueModelsData);
            setSpecialIssueModelsData(newSpecialIssueModelsData);
            setSpecialIssueCyphersData(json.specialIssueCyphersData);
            
            presentToast(`Force ${json.forceName} loaded successfully`);
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
        <IonPage className={factionId}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>
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
                    </IonSegment>
                </IonToolbar>

                {(promptSave || warningText) && <>
                    <IonText color="warning"><h3 className="warning-header"><IonIcon icon={warning} size={"large"} style={{position: "relative", top: "0.5rem"}}></IonIcon>{warningText}</h3></IonText>
                </>}
            </IonHeader>
            <IonContent ref={contentRef}>
                <SaveLoadModal isOpen={isSaveLoadForceModalOpen} setIsOpen={setIsSaveLoadForceModalOpen} title={"Save/Load Force"} fileTypeName={"force"} fileExtension={forcesExtension} filesPath={forcesPath} files={forceFiles} defaultFileName={forceName} fileData={forceData} loadFile={loadForce} deleteFile={deleteForce} listFiles={listFiles} saveFile={saveForce}></SaveLoadModal>
                <SaveLoadModal isOpen={isSaveLoadRackModalOpen} setIsOpen={setIsSaveLoadRackModalOpen} title={"Save/Load Rack"} fileTypeName={"rack"} fileExtension={racksExtension} filesPath={forcesPath} files={rackFiles} defaultFileName={"New Rack"} fileData={rackData} filterFiles={filterRacks} loadFile={loadRack} deleteFile={deleteRack} listFiles={listFiles} saveFile={saveRack}></SaveLoadModal>

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
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
}

export default EditorView;
