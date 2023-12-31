import React, { useRef } from 'react';
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow, useIonAlert } from '@ionic/react';

const forcesExtension = ".esch";

function LoadForceModal (props) {
    const modal = useRef(null);
    
    const [presentAlert] = useIonAlert();

    const { forceFiles, loadForce, deleteForce, trigger } = props;

    const loadForceConfirm = (forceName, filename) => {
        presentAlert({
            header: `Load Force ${forceName}?`,
            message: 'This action will clear your force',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {},
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        loadForce(filename);
                        modal.current?.dismiss("", 'confirm');
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    }

    const deleteForceConfirm = (forceName, filename) => {
        presentAlert({
            header: `Delete Force ${forceName}?`,
            message: 'This action will delete this force permanently',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {},
                },
                {
                    text: 'OK',
                    role: 'confirm',
                    handler: () => {
                        deleteForce(filename);
                        //Close modal if this force is the last one
                        if(forceFiles.length === 1) {
                            modal.current?.dismiss("", 'confirm');
                        }
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    }

    const loadForceButtons = [];
    forceFiles.forEach((file, index) => {
        const forceName = file.name.replace(forcesExtension, "");
        loadForceButtons.push(<IonRow key={index}>
            <IonCol>
                <IonButton expand="block" onClick={() => loadForceConfirm(forceName, file.name)}>
                    <div>{forceName}</div>
                </IonButton>
            </IonCol>
            <IonCol size="auto">
                <IonButton expand="block" onClick={() => deleteForceConfirm(forceName, file.name)}>
                    DELETE
                </IonButton>
            </IonCol>
        </IonRow>);
    });


    return (
        <IonModal ref={modal} trigger={trigger}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
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