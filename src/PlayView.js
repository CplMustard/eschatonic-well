import React, { createRef, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { useSessionStorageState, useLocalStorageState } from "ahooks";
import { IonPage, IonContent, IonHeader, IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonLabel, IonText, IonButton, IonButtons, IonBackButton, IonGrid, IonCol, IonRow, useIonAlert, useIonToast } from "@ionic/react";
import { warning } from "ionicons/icons";

var semver = require("semver");

import { forcesPath, forcesExtension, forceFormatVersion, listFiles, getFileHeaderData } from "./util/fileUtil";

import SaveLoadModal from "./modals/SaveLoadModal.js";
import PlayModeTracker from "./PlayModeTracker.js";
import PlayModeViewer from "./PlayModeViewer.js";

import { getFactionsData, getForceSizesData, rulesets } from "./DataLoader";

export const playTabs = {deployed: 0, reserves: 1, rack: 2 };

function PlayView() {
    const history = useHistory();

    const [presentAlert] = useIonAlert();
    const [present] = useIonToast();

    const [playTabSelected, setPlayTabSelected] = useSessionStorageState("playTabSelected", {defaultValue: playTabs.deployed});

    const [playForceName, setPlayForceName] = useSessionStorageState("playForceName", {defaultValue: undefined});
    const [playRulesetId, setPlayRulesetId] = useLocalStorageState("playRulesetId", {defaultValue: "pp"});
    const [playFactionId, setPlayFactionId] = useLocalStorageState("playFactionId", {defaultValue: undefined});
    const [playForceSizeId, setPlayForceSizeId] = useLocalStorageState("playForceSizeId", {defaultValue: "custom"});
    const [, setPlayForceModelsData] = useSessionStorageState("playForceModelsData", {defaultValue: []});
    const [, setPlayForceCyphersData] = useSessionStorageState("playForceCyphersData", {defaultValue: []});
    const [, setPlaySpecialIssueModelsData] = useSessionStorageState("playSpecialIssueModelsData", {defaultValue: []});
    const [, setPlaySpecialIssueCyphersData] = useSessionStorageState("playSpecialIssueCyphersData", {defaultValue: []});

    const [forceFiles, setForceFiles] = useState([]);
    const [isLoadPlayForceModalOpen, setIsLoadPlayForceModalOpen] = useState(false);

    useEffect(() => {
        (async function () {
            const forcesResult = await listFiles(forcesPath);
            if(forcesResult) {
                const forces = [];
                for await (const file of forcesResult.files) {
                    const { formatVersion, factionId, rulesetId } = await getFileHeaderData(forcesPath, file.name);
                    forces.push({fileInfo: file, formatVersion: formatVersion, factionId: factionId, rulesetId: rulesetId});
                }
                setForceFiles(forces);
            }
        })();
    });

    const factionsData = getFactionsData(playRulesetId);
    const forceSizesData = getForceSizesData(playRulesetId);

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

    const clearForce = () => {
        presentToast("Force cleared");
        setPlayForceName(undefined);
        setPlayRulesetId("pp");
        setPlayFactionId(undefined);
        setPlayForceSizeId("custom");
        setPlayForceModelsData([]);
        setPlayForceCyphersData([]);
        setPlaySpecialIssueModelsData([]);
        setPlaySpecialIssueCyphersData([]);
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
                        clearForce();
                    },
                },
            ],
            onDidDismiss: () => {}
        });
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

    return (
        <IonPage className={playFactionId}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>
                    <PlayModeTracker rulesetId={playRulesetId}></PlayModeTracker>
                </IonToolbar>
            </IonHeader>
            <IonContent ref={contentRef}>
                <SaveLoadModal isOpen={isLoadPlayForceModalOpen} setIsOpen={setIsLoadPlayForceModalOpen} disableSave={true} title={"Load Force"} fileTypeName={"force"} fileExtension={forcesExtension} files={forceFiles} loadFile={loadPlayForce}></SaveLoadModal>
                <>
                    {playRulesetId && <IonText color="primary"><h3 className="label">Ruleset: {rulesets[playRulesetId].name}</h3></IonText>}
                    {playFactionId && <IonText color="primary"><h3 className="label">Faction: {factionsData[playFactionId].name}</h3></IonText>}
                    {playForceSizeId && <IonText color="primary"><h3 className="label">Force Size: {forceSizesData[playForceSizeId].name}</h3></IonText>}
                    {playForceName && <IonText color="primary"><h2 className="label">Force Name: {playForceName}</h2></IonText>}
                    <IonGrid>
                        <IonRow>
                            <IonCol><IonButton expand="block" onClick={() => {forceFiles.length === 0 ? history.push("/editor") : setIsLoadPlayForceModalOpen(true);}}>{forceFiles.length === 0 ? "GO TO FORCE BUILDER": "LOAD"}</IonButton></IonCol>
                            <IonCol><IonButton expand="block" onClick={() => {clearForceConfirm();}}><div>CLEAR ALL</div></IonButton></IonCol>
                        </IonRow>
                    </IonGrid>
                </>

                <PlayModeViewer
                    tabSelected={playTabSelected}
                    rulesetId={playRulesetId}
                ></PlayModeViewer>
            </IonContent>
            <IonFooter>
                <IonToolbar>
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
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
}

export default PlayView;
