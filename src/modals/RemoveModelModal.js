import React from "react";
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonBadge, IonGrid, IonCol, IonRow } from "@ionic/react";

import HardPointList from "../HardPointList";

function RemoveModelModal (props) {   
    const { rulesetId, isOpen, setIsOpen, matchingModelsData, modelName, removeModelCard, removeSpecialIssue } = props;

    function cancel() {
        setIsOpen(false);
    }

    function removeEntry(entry) {
        if(entry.isSpecialIssue) {
            removeSpecialIssue(entry.id);
        } else {
            removeModelCard(entry.id);
        }
        setIsOpen(false);
    }

    function specialIssueText(entry) {
        return entry.isSpecialIssue ? "Special Issue" : "";
    }

    const matchingModelsButtons = [];
    if(matchingModelsData) {
        matchingModelsData.forEach((entry, index) => {
            const { name, factions } = entry;
            const factionId = factions.length === 1 ? factions[0] : "wc";
            matchingModelsButtons.push(<IonRow key={index}>
                <IonCol>
                    <IonButton className={factionId} expand="block" onClick={() => removeEntry(entry)}>
                        <div className="button-inner">
                            <div>{name}</div>
                        </div>
                        <IonBadge className="button-right-info-text">{specialIssueText(entry)}</IonBadge>
                    </IonButton>
                    <HardPointList 
                        rulesetId={rulesetId}
                        hard_points={entry.hard_points}
                        hardPointOptions={entry.hardPointOptions}
                        weaponPoints={entry.weapon_points}
                        readonly={true}
                    />
                </IonCol>
            </IonRow>);
        });
    }

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => cancel()}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{`Select which ${modelName} to remove`}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonGrid>{matchingModelsButtons}</IonGrid>
            </IonContent>
        </IonModal>
    );
}

export default RemoveModelModal;