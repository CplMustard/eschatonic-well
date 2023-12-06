import React from 'react';
import { useParams, useHistory } from "react-router-dom";

import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/react';

import CardList from './CardList';

import { cadresData, modelsData } from './data';

function CadreViewer(props) {
    const params = useParams();
    const history = useHistory();

    const cadreId = props.cadreId ? props.cadreId : params.cadreId;
    const models = Object.values(modelsData).filter((model) => model.cadre && (model.cadre === cadreId));

    function openModelCard(id) {
        history.push(`/model/${id}`);
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton></IonBackButton>
                    </IonButtons>
                    <IonTitle>Back Button</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <CardList header={`Cadre: ${cadresData[cadreId].name}`} cards={models} handleCardClicked={openModelCard}></CardList>
            </IonContent>
        </IonPage>
    );
}

export default CadreViewer;