import React, { useState, useReducer } from "react";
import { IonBadge, IonContent, IonText, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow } from "@ionic/react";

import ArcTracker from "../ArcTracker";

import { getModelsData } from "../DataLoader";

function DeployUnitModal (props) {   
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const [attachmentsToAdd, setAttachmentsToAdd] = useState([]);
    const [currentArc, setCurrentArc] = useState(0);

    const { rulesetId, isOpen, setIsOpen, attachments, unitStatus, arcInWell, cancelDeploy, addAttachmentsToUnit, addArcToUnit } = props;

    const modelsData = getModelsData(rulesetId);

    const modelId = unitStatus ? unitStatus.modelId : undefined;
    const unitName = modelId ? modelsData[modelId].name : "";

    function cancel() {
        setAttachmentsToAdd([]); 
        setCurrentArc(0);
        cancelDeploy(unitStatus.id);
        setIsOpen(false);
    }

    function toggleAttachment(attachmentId) {
        if (attachmentsToAdd.find((modelId) => modelId === attachmentId)) {
            removeAttachment(attachmentId);
        } else {
            addAttachment(attachmentId);
        }
    }

    function addAttachment(attachmentId) {
        let newAttachmentsToAdd = attachmentsToAdd;
        newAttachmentsToAdd.push(attachmentId);

        setAttachmentsToAdd(newAttachmentsToAdd);
        forceUpdate();
    }

    function removeAttachment(attachmentId) {
        const index = attachmentsToAdd.findIndex((modelId) => modelId === attachmentId);
        let newAttachmentsToAdd = [...attachmentsToAdd.slice(0, index), ...attachmentsToAdd.slice(index + 1)];

        setAttachmentsToAdd(newAttachmentsToAdd);
    }

    function getTotalDC(modelId, attachmentsToAdd) {
        const initialDC = modelsData[modelId] ? modelsData[modelId].stats.dc : 0;
        return attachmentsToAdd.reduce((attachmentsDC, attachmentId) => modelsData[attachmentId].stats.dc + attachmentsDC, initialDC);
    }

    function setArc(entryId, arc) {
        addArcToUnit(entryId, arc);
        setCurrentArc(arc);
    }

    const attachmentButtons = [];
    if(attachments) {
        attachments.forEach((attachmentId, index) => {
            const modelData = modelsData[attachmentId];
            const { name, factions, stats } = modelData;
            const factionId = factions.length === 1 ? factions[0] : "wc";
            attachmentButtons.push(<IonRow key={index}>
                <IonCol>
                    <IonButton className={factionId} expand="block" fill={attachmentsToAdd.find((modelId) => modelId === attachmentId) ? "outline" : "default"} onClick={() => toggleAttachment(attachmentId)}>
                        <div className="button-inner">
                            <div>{name}</div>
                        </div>
                        <IonBadge className="button-right-info-text">DC {Number.isInteger(stats.dc) ? stats.dc : "*"}</IonBadge>
                    </IonButton>
                </IonCol>
            </IonRow>);
        });
    }

    const attachmentNames = attachmentsToAdd.map((modelId) => modelsData[modelId].name);

    const isVoidGate = modelId ? modelsData[modelId].type === "void_gate" : false;

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => cancel()}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{isVoidGate ? "Charge Gate With Arc" : "Add Attachments"}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonText><h3 className="label">Deploy {unitName}</h3></IonText>
                {attachmentButtons.length !== 0 && <IonText><h4 className="label">DC: {getTotalDC(modelId, attachmentsToAdd)}</h4></IonText>}
                {attachmentButtons.length !== 0 && <IonText><h3 className="label" style={{marginBottom: 0}}>{`Attachments: ${attachmentNames.sort((a,b) => a.localeCompare(b)).join(", ")}`}</h3></IonText>}
                {attachmentButtons.length !== 0 && <IonGrid>{attachmentButtons}</IonGrid>}
                {isVoidGate && <ArcTracker id={unitStatus.id} arc={currentArc} arcLimit={unitStatus.arcLimit} arcInWell={arcInWell} setArc={setArc} isPlayMode={true} collapsable={false}></ArcTracker>}
            </IonContent>
            <IonFooter>                
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            setAttachmentsToAdd([]); 
                            setCurrentArc(0);
                            addAttachmentsToUnit(unitStatus, attachmentsToAdd);
                            setIsOpen(false);
                        }}>Deploy Unit</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
}

export default DeployUnitModal;