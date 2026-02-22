import React, { useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStorageState } from "ahooks";
import { IonText, IonIcon, useIonToast } from "@ionic/react";
import { download, push } from "ionicons/icons";

import CardList from "./CardList";
import DeployUnitModal from "./DeployUnitModal";
import { playTabs } from "./EditorView.js";

import { getModelsData } from "./DataLoader";

function PlayModeViewer(props) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const history = useHistory();
    const [present] = useIonToast();
    
    const [unitsStatus, setUnitsStatus] = useSessionStorageState("unitsStatus", {defaultValue: [], listenStorageChange: true});

    const [isDeployUnitModalOpen, setIsDeployUnitModalOpen] = useState(false);
    const [currentUnitAttachments, setCurrentUnitAttachments] = useState([]);
    const [currentUnitStatus, setCurrentUnitStatus] = useState({});

    const { rulesetId } = props;

    const modelsData = getModelsData(rulesetId);
    
    const presentToast = (message) => {
        present({
            message: message,
            duration: 1500,
            position: "top",
        });
    };

    const tabSelected = props.tabSelected;
    const models = props.forceModelsData;
    const cyphers = props.forceCyphersData;
    const specialIssueModels = props.specialIssueModelsData;
    const specialIssueCyphers = props.specialIssueCyphersData;

    function openModelCard(entry) {
        const modelId = entry.modelId;
        const entryId = entry.entryId;
        history.push(`/model/${modelId}`, { rulesetId: rulesetId, entryId: entryId, isPlayMode: true, isSpecialIssue: specialIssueModels.filter((entry) => entry.entryId === entryId).length !== 0 });
    }

    function openCypherCard(entry) {
        const cypherId = entry.cypherId;
        history.push(`/cypher/${cypherId}`, { rulesetId: rulesetId, isPlayMode: true });
    }

    function createUnitStatus(entryId) {
        const modelId = models.find((entry) => entry.entryId === entryId).modelId;
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

        const unitStatus = {entryId: entryId, modelId: modelId, activated: false, arc: 0, arcLimit: arcLimit, unitModels: unitModels, attachments: []};

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

        const isSpecialIssue = specialIssueModels.filter((entry) => entry.entryId === unitStatus.entryId).length !== 0;
        const modelName = isSpecialIssue ? specialIssueModels.find((entry) => entry.entryId === unitStatus.entryId).name : modelData.name;
        presentToast(`Deployed ${modelName} to the table.`);
        setUnitsStatus(newUnitsStatus);
    }

    function cancelDeploy(entryId) {
        const index = unitsStatus.findIndex((entry) => entry.entryId === entryId);
        let newUnitsStatus = [...unitsStatus.slice(0, index), ...unitsStatus.slice(index + 1)];
        setUnitsStatus(newUnitsStatus);

        forceUpdate();
    }

    function deployModel(entryId) {
        let newUnitsStatus = unitsStatus;
        const unitStatus = createUnitStatus(entryId);
        newUnitsStatus.push(unitStatus);

        const modelId = models.find((entry) => entry.entryId === entryId).modelId;
        const modelData = modelsData[modelId];

        if(modelData.attachments) {
            setCurrentUnitAttachments(modelData.attachments);
            setCurrentUnitStatus(unitStatus);
            setIsDeployUnitModalOpen(true);
        } else {   
            const isSpecialIssue = specialIssueModels.filter((entry) => entry.entryId === entryId).length !== 0;
            const modelName = isSpecialIssue ? specialIssueModels.find((entry) => entry.entryId === entryId).name : modelData.name;

            presentToast(`Deployed ${modelName} to the table.`);
            setUnitsStatus(newUnitsStatus);
        }
    }

    function recallModel(entryId) {
        const index = unitsStatus.findIndex((entry) => entry.entryId === entryId);

        const isSpecialIssue = specialIssueModels.filter((entry) => entry.entryId === entryId).length !== 0;
        const modelName = isSpecialIssue ? specialIssueModels.find((entry) => entry.entryId === entryId).name : models.find((entry) => entry.entryId === entryId).name;

        let newUnitsStatus = [...unitsStatus.slice(0, index), ...unitsStatus.slice(index + 1)];

        presentToast(`Recalled ${modelName} from the table.`);
        setUnitsStatus(newUnitsStatus);
        forceUpdate();
    }

    function getUnitDC(entry) {
        const modelId = entry.modelId;
        return Number.isInteger(modelsData[modelId].stats.dc) ? `DC ${modelsData[modelId].stats.dc}` : undefined;
    }

    function setArc(id, arc) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.entryId === id);
        if(arc <= unitsStatus[index].arcLimit) {
            unitsStatus[index].arc = arc;
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleActivation(id) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.entryId === id);
        unitsStatus[index].activated = !unitsStatus[index].activated;
        setUnitsStatus(newUnitsStatus);
    }

    function toggleContinuousEffect(id, modelIndex, attachmentId, effectId) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.entryId === id);
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

        const index = newUnitsStatus.findIndex((entry) => entry.entryId === id);
        const unitModels = attachmentId ? unitsStatus[index].attachments.find((entry) => entry.modelId === attachmentId).unitModels: unitsStatus[index].unitModels;
        const unitModel = unitModels[modelIndex];
        const boxes = unitModel.boxes;
        boxes[boxIndex] = !boxes[boxIndex];
        setUnitsStatus(newUnitsStatus);
    }

    const deployedModels = models.filter((model) => unitsStatus.find((entry) => entry.entryId === model.entryId));

    const totalArc = 7;
    const arcInWell = unitsStatus.reduce((currentArc, unitStatus) => currentArc - (unitStatus.arc ? unitStatus.arc : 0), totalArc);

    return (
        <div className="container">
            <DeployUnitModal rulesetId={rulesetId} isOpen={isDeployUnitModalOpen} setIsOpen={setIsDeployUnitModalOpen} attachments={currentUnitAttachments} unitStatus={currentUnitStatus} cancelDeploy={cancelDeploy} addAttachmentsToUnit={addAttachmentsToUnit}></DeployUnitModal>
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
                        {handleClicked: (entry) => recallModel(entry.entryId), text: <IonIcon slot="icon-only" icon={push}></IonIcon> }, 
                    ]}
                >
                </CardList>
            </>}
            {(tabSelected === playTabs.reserves) && <>
                <CardList 
                    rulesetId={rulesetId} 
                    id={"PlayReserves"} 
                    header={"Models"} 
                    cards={models} 
                    isPlayMode={true}
                    handleCardClicked={openModelCard} 
                    hideHiddenTypes={true}
                    rightInfoText={getUnitDC}
                    cardActions={[
                        {handleClicked: (entry) => deployModel(entry.entryId), text: <IonIcon slot="icon-only" icon={download}></IonIcon>, isDisabled: (entry) => unitsStatus.find((unitStatus) => unitStatus.entryId === entry.entryId) }, 
                    ]}
                >
                </CardList>
                <CardList rulesetId={rulesetId} id={"PlaySpecialIssueModels"} header={"Special Issue"} cards={specialIssueModels} handleCardClicked={openModelCard}></CardList>
            </>}
            {(tabSelected === playTabs.rack) && <>
                <CardList rulesetId={rulesetId} id={"PlayCyphers"} header={"Cyphers"} cards={cyphers} isPlayMode={true} handleCardClicked={openCypherCard}></CardList>
                <CardList rulesetId={rulesetId} id={"PlaySpecialIssueCyphers"} header={"Special Issue"} cards={specialIssueCyphers} isPlayMode={true} handleCardClicked={openCypherCard}></CardList>
            </>}
        </div>
    );
}

export default PlayModeViewer;
