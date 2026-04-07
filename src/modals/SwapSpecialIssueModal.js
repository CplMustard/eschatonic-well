import React from "react";
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton } from "@ionic/react";

import CardList from "../CardList";

function SwapSpecialIssueModal (props) {
    const { rulesetId, isOpen, setIsOpen, forceModels, specialIssueModel, cancelSwap, swapWithSpecialIssue, getUnitDC } = props;

    const specialIssueEntryId = specialIssueModel ? specialIssueModel.id : undefined;
    const specialIssueModelName = specialIssueModel ? specialIssueModel.name : "";

    function handleCardClicked(entry) {
        swapWithSpecialIssue(specialIssueEntryId, entry.id);
        setIsOpen(false);
    }

    function cancel() {
        cancelSwap();
        setIsOpen(false);
    }

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => cancel()}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{`Swap in ${specialIssueModelName} from Special Issue?`}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {forceModels && 
                    <CardList 
                        rulesetId={rulesetId} 
                        id={"PlayReserves"} 
                        header={"Models"} 
                        cards={forceModels} 
                        isPlayMode={true}
                        handleCardClicked={handleCardClicked} 
                        hideHiddenTypes={true}
                        rightInfoText={getUnitDC}
                    ></CardList>
                }
            </IonContent>
        </IonModal>
    );
}

export default SwapSpecialIssueModal;