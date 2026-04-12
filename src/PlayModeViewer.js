import React, { useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStorageState } from "ahooks";
import { IonText, IonIcon, useIonToast } from "@ionic/react";
import { download, push, logIn, logOut } from "ionicons/icons";

import CardList from "./CardList";
import DeployUnitModal from "./modals/DeployUnitModal.js";
import SwapSpecialIssueModal from "./modals/SwapSpecialIssueModal.js";
import { playTabs } from "./EditorView.js";

import { addAttachments, deleteAttachments, addCadreChampion, deleteCadreChampion } from "./util/forceUtil.js";

import { getCadresData, getModelsData, getWeaponsData } from "./DataLoader";

function PlayModeViewer(props) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const history = useHistory();
    const [present] = useIonToast();
    
    const [unitsStatus, setUnitsStatus] = useSessionStorageState("unitsStatus", {defaultValue: [], listenStorageChange: true});
    const [playForceModelsData, setPlayForceModelsData] = useSessionStorageState("playForceModelsData", {defaultValue: [], listenStorageChange: true});
    const [playForceCyphersData, ] = useSessionStorageState("playForceCyphersData", {defaultValue: [], listenStorageChange: true});
    const [playSpecialIssueModelsData, setPlaySpecialIssueModelsData] = useSessionStorageState("playSpecialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [playSpecialIssueCyphersData, ] = useSessionStorageState("playSpecialIssueCyphersData", {defaultValue: [], listenStorageChange: true});

    const [isDeployUnitModalOpen, setIsDeployUnitModalOpen] = useState(false);
    const [isSwapSpecialIssueModalOpen, setIsSwapSpecialIssueModalOpen] = useState(false);
    const [currentUnitAttachments, setCurrentUnitAttachments] = useState([]);
    const [currentUnitStatus, setCurrentUnitStatus] = useState({});
    const [currentSpecialIssueModelToSwap, setCurrentSpecialIssueModelToSwap] = useState({});

    const { rulesetId } = props;

    const modelsData = getModelsData(rulesetId);
    const weaponsData = getWeaponsData(rulesetId);
    const cadresData = getCadresData(rulesetId);

    const context = {
        rulesetId: rulesetId,
        cadresData: cadresData,
        modelsData: modelsData,
        weaponsData: weaponsData
    };

    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
        });
    };

    const tabSelected = props.tabSelected;

    function openModelCard(entry) {
        const modelId = entry.modelId;
        const entryId = entry.id;
        history.push(`/model/${modelId}`, { rulesetId: rulesetId, entryId: entryId, isPlayMode: true, isSpecialIssue: playSpecialIssueModelsData.filter((entry) => entry.id === entryId).length !== 0 });
    }

    function openCypherCard(entry) {
        const cypherId = entry.id;
        history.push(`/cypher/${cypherId}`, { rulesetId: rulesetId, isPlayMode: true });
    }

    function createUnitStatus(entryId) {
        const modelId = playForceModelsData.find((entry) => entry.id === entryId).modelId;
        const modelData = modelsData[modelId];
        const unitModels = [];

        if (modelData.stats.squad_size) {
            for (let i=0; i < modelData.stats.squad_size; i++) {
                unitModels.push({boxes: Number(modelData.stats.boxes) ? Array(modelData.stats.boxes).fill(false) : [], continuousEffects: []});
            }
        } else {
            unitModels.push({boxes: Number(modelData.stats.boxes) ? Array(modelData.stats.boxes).fill(false) : [], continuousEffects: []});
        }

        const arcLimit = modelData.type === "void_gate" ? 5 : modelData.type === "warjack" ? 3 : modelData.special_rules.includes("awakened_spirit") || modelData.type === "mantlet" ? 0 : 1;

        const unitStatus = {id: entryId, modelId: modelId, activated: false, arc: 0, arcLimit: arcLimit, unitModels: unitModels, attachments: []};

        return unitStatus;
    }

    function addAttachmentsToUnit(unitStatus, attachmentIds) {
        let newUnitsStatus = unitsStatus;

        const attachments = [];
        attachmentIds.forEach((attachmentId) => {
            const attachmentModelData = modelsData[attachmentId];
            const attachmentUnitModels = [];
            if (attachmentModelData.stats.squad_size) {
                for (let i=0; i < attachmentModelData.stats.squad_size; i++) {
                    attachmentUnitModels.push({boxes: Array(attachmentModelData.stats.boxes).fill(false), continuousEffects: []});
                }
            } else {
                attachmentUnitModels.push({boxes: Array(attachmentModelData.stats.boxes).fill(false), continuousEffects: []});
            }
            attachments.push({modelId: attachmentId, unitModels: attachmentUnitModels});
        });

        unitStatus.attachments = attachments;

        const modelData = modelsData[unitStatus.modelId];

        const isSpecialIssue = playSpecialIssueModelsData.filter((entry) => entry.id === unitStatus.id).length !== 0;
        const modelName = isSpecialIssue ? playSpecialIssueModelsData.find((entry) => entry.id === unitStatus.id).name : modelData.name;
        presentToast(`Deployed ${modelName} to the table.`);
        setUnitsStatus(newUnitsStatus);
    }

    function addArcToUnit(entryId, arc) {
        const index = unitsStatus.findIndex((entry) => entry.id === entryId);
        let newUnitsStatus = unitsStatus;

        const unitStatus = newUnitsStatus[index];
        unitStatus.arc = arc;
        setUnitsStatus(newUnitsStatus);
    }

    function cancelDeploy(entryId) {
        const index = unitsStatus.findIndex((entry) => entry.id === entryId);
        let newUnitsStatus = [...unitsStatus.slice(0, index), ...unitsStatus.slice(index + 1)];
        setUnitsStatus(newUnitsStatus);

        forceUpdate();
    }

    function deployModel(entryId) {
        let newUnitsStatus = unitsStatus;
        const unitStatus = createUnitStatus(entryId);
        newUnitsStatus.push(unitStatus);

        const modelId = playForceModelsData.find((entry) => entry.id === entryId).modelId;
        const modelData = modelsData[modelId];

        if((modelData.attachments && modelData.type === "squad") || (modelData.type === "void_gate")) {
            setCurrentUnitAttachments(modelData.attachments);
            setCurrentUnitStatus(unitStatus);
            setIsDeployUnitModalOpen(true);
        } else {
            const isSpecialIssue = playSpecialIssueModelsData.filter((entry) => entry.id === entryId).length !== 0;
            const modelName = isSpecialIssue ? playSpecialIssueModelsData.find((entry) => entry.id === entryId).name : modelData.name;

            presentToast(`Deployed ${modelName} to the table.`);
            setUnitsStatus(newUnitsStatus);
        }
    }

    function recallModel(entryId) {
        const index = unitsStatus.findIndex((entry) => entry.id === entryId);

        const isSpecialIssue = playSpecialIssueModelsData.filter((entry) => entry.id === entryId).length !== 0;
        const modelName = isSpecialIssue ? playSpecialIssueModelsData.find((entry) => entry.id === entryId).name : playForceModelsData.find((entry) => entry.id === entryId).name;

        let newUnitsStatus = [...unitsStatus.slice(0, index), ...unitsStatus.slice(index + 1)];

        presentToast(`Recalled ${modelName} from the table.`);
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    function openSpecialIssueSwapModal(entry) {
        setCurrentSpecialIssueModelToSwap(entry);
        setIsSwapSpecialIssueModalOpen(true);
    }

    function swapWithSpecialIssue(specialIssueEntryId, forceEntryId) {
        const specialIssueIndex = playSpecialIssueModelsData.findIndex((forceModel) => forceModel.id === specialIssueEntryId);
        const forceIndex = playForceModelsData.findIndex((forceModel) => forceModel.id === forceEntryId);
        let newForceData = playForceModelsData;
        let newSpecialIssueModelsData = playSpecialIssueModelsData;
        let addedModelNames = [];
        let deletedModelNames = [];

        let specialIssueEntry = playSpecialIssueModelsData[specialIssueIndex];
        const specialIssueModelId = specialIssueEntry.modelId;
        const specialIssueModelData = modelsData[specialIssueModelId];

        let forceEntry = playForceModelsData[forceIndex];
        const forceModelId = forceEntry.modelId;
        const forceModelData = modelsData[forceModelId];

        const swappedWithIdA = !forceEntry.swappedWithId ? forceEntryId : undefined;
        const swappedWithIdB = !specialIssueEntry.swappedWithId ? specialIssueEntryId : undefined;
        forceEntry.swappedWithId = swappedWithIdB;
        specialIssueEntry.swappedWithId = swappedWithIdA;
    
        newForceData = newForceData.concat(specialIssueEntry);
        newSpecialIssueModelsData = newSpecialIssueModelsData.concat(forceEntry);

        newSpecialIssueModelsData = [...newSpecialIssueModelsData.slice(0, specialIssueIndex), ...newSpecialIssueModelsData.slice(specialIssueIndex + 1)];
        newForceData = [...newForceData.slice(0, forceIndex), ...newForceData.slice(forceIndex + 1)];

        // if the card we're swapping in has attachments or cadre we need to add the champion/attachments after
        if (specialIssueModelData.attachments) {
            newForceData = addAttachments(context, newForceData, specialIssueModelData, addedModelNames);
        }

        if (specialIssueModelData.cadre) {
            newForceData = addCadreChampion(context, newForceData, specialIssueModelData.cadre, addedModelNames);
        }

        // if the card we're swapping out has attachments or cadre we need to remove the champion/attachments after
        if (forceModelData.attachments) {
            newForceData = deleteAttachments(context, newForceData, forceModelData, deletedModelNames);
        }

        if (forceModelData.cadre) {
            newForceData = deleteCadreChampion(context, newForceData, forceModelData.cadre, deletedModelNames);
        }
        
        presentToast(`Swapped ${specialIssueModelData.name} to forcelist${addedModelNames.length !== 0 ? `, ${addedModelNames.join(", ")} added to forcelist` : ""}${deletedModelNames.length !== 0 ? `, ${deletedModelNames.join(", ")} removed from forcelist` : ""}`);

        setPlaySpecialIssueModelsData(newSpecialIssueModelsData);
        setPlayForceModelsData(newForceData);
    }

    function cancelSwap() {
        setCurrentSpecialIssueModelToSwap(undefined);
    }

    function getUnitDC(entry) {
        const modelId = entry.modelId;
        return Number.isInteger(modelsData[modelId].stats.dc) ? `DC ${modelsData[modelId].stats.dc}` : undefined;
    }

    function setArc(id, arc) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        if(arc <= unitsStatus[index].arcLimit) {
            unitsStatus[index].arc = arc;
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleActivation(id) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        unitsStatus[index].activated = !unitsStatus[index].activated;
        setUnitsStatus(newUnitsStatus);
    }

    function toggleContinuousEffect(id, modelIndex, attachmentId, effectId) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        const unitModels = attachmentId ? unitsStatus[index].attachments.find((entry) => entry.modelId === attachmentId).unitModels: unitsStatus[index].unitModels;
        const unitModel = unitModels[modelIndex];
        const continuousEffects = unitModel.continuousEffects;
        if(continuousEffects) {
            if(continuousEffects.includes(effectId)) {
                const effectIndex = continuousEffects.findIndex((id) => id === effectId);
                unitModel.continuousEffects = [...continuousEffects.slice(0, effectIndex), ...continuousEffects.slice(effectIndex + 1)];
            } else {
                continuousEffects.push(effectId);
            }
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleDamageBox(id, modelIndex, attachmentId, boxIndex) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        const unitModels = attachmentId ? unitsStatus[index].attachments.find((entry) => entry.modelId === attachmentId).unitModels: unitsStatus[index].unitModels;
        const unitModel = unitModels[modelIndex];
        const boxes = unitModel.boxes;
        boxes[boxIndex] = !boxes[boxIndex];
        setUnitsStatus(newUnitsStatus);
    }

    const deployedModels = playForceModelsData.filter((model) => unitsStatus.find((entry) => entry.id === model.id));

    const totalArc = 7;
    const arcInWell = unitsStatus.reduce((currentArc, unitStatus) => currentArc - (unitStatus.arc ? unitStatus.arc : 0), totalArc);

    return (
        <div className="container">
            <DeployUnitModal 
                rulesetId={rulesetId} 
                isOpen={isDeployUnitModalOpen} 
                setIsOpen={setIsDeployUnitModalOpen} 
                attachments={currentUnitAttachments} 
                unitStatus={currentUnitStatus} 
                arcInWell={arcInWell}
                cancelDeploy={cancelDeploy} 
                addAttachmentsToUnit={addAttachmentsToUnit}
                addArcToUnit={addArcToUnit}
            ></DeployUnitModal>
            <SwapSpecialIssueModal 
                rulesetId={rulesetId} 
                isOpen={isSwapSpecialIssueModalOpen} 
                setIsOpen={setIsSwapSpecialIssueModalOpen} 
                forceModels={playForceModelsData} 
                specialIssueModel={currentSpecialIssueModelToSwap}
                cancelSwap={cancelSwap} 
                swapWithSpecialIssue={swapWithSpecialIssue}
                getUnitDC={getUnitDC}
            ></SwapSpecialIssueModal>
            {(tabSelected === playTabs.deployed) && <>
                <IonText color="primary"><h2 className={"label"}>Tap Reserves and deploy a unit with <IonIcon slot="icon-only" icon={download}></IonIcon> to track their status here. Recall units with <IonIcon slot="icon-only" icon={push}></IonIcon></h2></IonText>
                <CardList
                    rulesetId={rulesetId} 
                    id={"PlayDeployed"}
                    header={"Deployed"}
                    cards={deployedModels} 
                    unitsStatus={unitsStatus}
                    isPlayMode={true}
                    handleCardClicked={openModelCard} 
                    hideHiddenTypes={false}
                    setArc={setArc}
                    toggleActivation={toggleActivation}
                    toggleContinuousEffect={toggleContinuousEffect}
                    toggleDamageBox={toggleDamageBox}
                    arcInWell={arcInWell}
                    cardActions={[
                        {handleClicked: (entry) => recallModel(entry.id), text: <IonIcon slot="icon-only" icon={push}></IonIcon> }, 
                    ]}
                >
                </CardList>
            </>}
            {(tabSelected === playTabs.reserves) && <>
                <CardList 
                    rulesetId={rulesetId} 
                    id={"PlayReserves"} 
                    header={"Models"} 
                    cards={playForceModelsData} 
                    isPlayMode={true}
                    handleCardClicked={openModelCard} 
                    hideHiddenTypes={true}
                    rightInfoText={getUnitDC}
                    cardActions={[
                        {handleClicked: (entry) => deployModel(entry.id), text: <IonIcon slot="icon-only" icon={download}></IonIcon>, isDisabled: (entry) => unitsStatus.find((unitStatus) => unitStatus.id === entry.id) }, 
                        {handleClicked: (entry) => swapWithSpecialIssue(entry.swappedWithId, entry.id), text: <IonIcon slot="icon-only" icon={logOut}></IonIcon>, isDisabled: (entry) => !entry.swappedWithId }, 
                    ]}
                >
                </CardList>
                <CardList 
                    rulesetId={rulesetId} 
                    id={"PlaySpecialIssueModels"} 
                    header={"Special Issue"} 
                    cards={playSpecialIssueModelsData} 
                    handleCardClicked={openModelCard}
                    rightInfoText={getUnitDC}
                    cardActions={[
                        {handleClicked: (entry) => entry.swappedWithId ? swapWithSpecialIssue(entry.id, entry.swappedWithId) : openSpecialIssueSwapModal(entry), text: <IonIcon slot="icon-only" icon={logIn}></IonIcon> }, 
                    ]}
                >
                </CardList>
            </>}
            {(tabSelected === playTabs.rack) && <>
                <CardList rulesetId={rulesetId} id={"PlayCyphers"} header={"Cyphers"} cards={playForceCyphersData} isPlayMode={true} handleCardClicked={openCypherCard}></CardList>
                <CardList rulesetId={rulesetId} id={"PlaySpecialIssueCyphers"} header={"Special Issue"} cards={playSpecialIssueCyphersData} isPlayMode={true} handleCardClicked={openCypherCard}></CardList>
            </>}
        </div>
    );
}

export default PlayModeViewer;
