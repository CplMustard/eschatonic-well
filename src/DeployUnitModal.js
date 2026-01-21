import React, { useState, useReducer } from "react";
import { IonContent, IonText, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow } from "@ionic/react";

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

    const attachmentButtons = [];
    if(attachments) {
        attachments.forEach((attachmentId, index) => {
            const modelData = modelsData[attachmentId];
            const { name, factions } = modelData;
            const factionId = factions.length === 1 ? factions[0] : "wc";
            attachmentButtons.push(<IonRow key={index}>
                <IonCol>
                    <IonButton className={factionId} expand="block" fill={attachmentsToAdd.find((id) => id === attachmentId) ? "outline" : "default"} onClick={() => toggleAttachment(attachmentId)}>
                        <div>{name}</div>
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
                <IonText><h3>Deploy {unitName}</h3></IonText>
                <IonText><h3>Attachments:</h3> {attachmentNames.sort((a,b) => a.localeCompare(b)).join(", ")}</IonText>
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