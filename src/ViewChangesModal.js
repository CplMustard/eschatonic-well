import React from "react";
import { IonContent, IonText, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton } from "@ionic/react";

function ViewChangesModal (props) {   
    const { changeEntries, isOpen, setIsOpen } = props;

    function close() {
        setIsOpen(false);
    }

    const changeEntryElements = [];
    if(changeEntries) {
        changeEntries.forEach((changeEntry) => {
            const {source, changes} = changeEntry;
            const changeListEntries = [];
            changes.forEach((change, index) => {
                changeListEntries.push(<div key={index}>{change}</div>);
            });
            changeEntryElements.push(<div key={source}>
                <IonText><h3>{source}</h3></IonText>
                <IonText>{changeListEntries}</IonText>
            </div>);
        });
    }

    return (
        <IonModal isOpen={isOpen} backdropDismiss={true} onWillDismiss={() => close()}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => close()}>Close</IonButton>
                    </IonButtons>
                    <IonTitle>Model Changes</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="changes-modal">
                    {changeEntryElements}
                </div>
            </IonContent>
        </IonModal>
    );
}

export default ViewChangesModal;