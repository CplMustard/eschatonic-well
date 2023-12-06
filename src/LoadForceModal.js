import React, { useRef, useState } from 'react';
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow } from '@ionic/react';

function LoadForceModal (props) {
    const modal = useRef(null);

    const { loadForceButtons, trigger } = props;

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
                {loadForceButtons.length !== 0 && <IonGrid>{loadForceButtons}</IonGrid>}
            </IonContent>
        </IonModal>
    );
}

export default LoadForceModal;