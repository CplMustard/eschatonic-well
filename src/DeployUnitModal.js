import React, { useState, useReducer } from "react";
import { IonBadge, IonContent, IonText, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow } from "@ionic/react";

import { getModelsData } from "./DataLoader";

function DeployUnitModal (props) {   
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const [attachmentsToAdd, setAttachmentsToAdd] = useState([]);

    const { rulesetId, isOpen, setIsOpen, attachments, unitStatus, cancelDeploy, addAttachmentsToUnit } = props;

    const modelsData = getModelsData(rulesetId);

    const modelId = unitStatus ? unitStatus.modelId : undefined;
    const unitName = modelId ? modelsData[modelId].name : "";

    function cancel() {
        setAttachmentsToAdd([]); 
        cancelDeploy(unitStatus.id);
        setIsOpen(false);
    }

    function toggleAttachment(attachmentId) {
        if (attachmentsToAdd.find((id) => id === attachmentId)) {
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
        const index = attachmentsToAdd.findIndex((id) => id === attachmentId);
        let newAttachmentsToAdd = [...attachmentsToAdd.slice(0, index), ...attachmentsToAdd.slice(index + 1)];

        setAttachmentsToAdd(newAttachmentsToAdd);
    }

    function getTotalDC(modelId, attachmentsToAdd) {
        return attachmentsToAdd.reduce((attachmentsDC, attachmentId) => modelsData[attachmentId].stats.dc + attachmentsDC, modelsData[modelId].stats.dc);
    }

    const attachmentButtons = [];
    if(attachments) {
        attachments.forEach((attachmentId, index) => {
            const modelData = modelsData[attachmentId];
            const { name, factions, stats } = modelData;
            const factionId = factions.length === 1 ? factions[0] : "wc";
            attachmentButtons.push(<IonRow key={index}>
                <IonCol>
                    <IonButton className={factionId} expand="block" fill={attachmentsToAdd.find((id) => id === attachmentId) ? "outline" : "default"} onClick={() => toggleAttachment(attachmentId)}>
                        <div className="button-inner">
                            <div>{name}</div>
                        </div>
                        <IonBadge className="button-right-info-text">DC {Number.isInteger(stats.dc) ? stats.dc : "*"}</IonBadge>
                    </IonButton>
                </IonCol>
            </IonRow>);
        });
    }

    const attachmentNames = attachmentsToAdd.map((id) => modelsData[id].name);

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => cancel()}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>Add Attachments</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonText><h3 className="label">Deploy {unitName}</h3></IonText>
                <IonText><h4 className="label">DC: {getTotalDC(modelId, attachmentsToAdd)}</h4></IonText>
                <IonText><h3 className="label" style={{marginBottom: 0}}>{`Attachments: ${attachmentNames.sort((a,b) => a.localeCompare(b)).join(", ")}`}</h3></IonText>
                {attachmentButtons.length !== 0 && <IonGrid>{attachmentButtons}</IonGrid>}
            </IonContent>
            <IonFooter>                
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            setAttachmentsToAdd([]); 
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