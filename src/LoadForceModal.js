import React from "react";
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow, useIonAlert } from "@ionic/react";

const forcesExtension = ".esch";

function LoadForceModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen, forceFiles, loadForce, deleteForce } = props;

    const loadForceConfirm = (forceName, filename) => {
        presentAlert({
            header: `Load Force ${forceName}?`,
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
                        loadForce(filename);
                        setIsOpen(false);
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const deleteForceConfirm = (forceName, filename) => {
        presentAlert({
            header: `Delete Force ${forceName}?`,
            message: "This action will delete this force permanently",
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
                        deleteForce(filename);
                        //Close modal if this force is the last one
                        if(forceFiles.length === 1) {
                            setIsOpen(false);
                        }
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const loadForceButtons = [];
    forceFiles.forEach((file, index) => {
        const forceName = file.fileInfo.name.replace(forcesExtension, "");
        const factionId = file.factionId;
        loadForceButtons.push(<IonRow key={index}>
            <IonCol>
                <IonButton className={factionId} expand="block" onClick={() => loadForceConfirm(forceName, file.fileInfo.name)}>
                    <div>{forceName}</div>
                </IonButton>
            </IonCol>
            <IonCol size="auto">
                <IonButton expand="block" onClick={() => deleteForceConfirm(forceName, file.fileInfo.name)}>
                    DELETE
                </IonButton>
            </IonCol>
        </IonRow>);
    });


    return (
        <IonModal isOpen={isOpen}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => setIsOpen(false)}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>Load Forcelist</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {forceFiles.length !== 0 && <IonGrid>{loadForceButtons}</IonGrid>}
            </IonContent>
        </IonModal>
    );
}

export default LoadForceModal;