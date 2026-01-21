import React from "react";
import { useParams, useHistory } from "react-router-dom";

import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from "@ionic/react";

import CardList from "./CardList";

import { getCadresData, getModelsData } from "./DataLoader";

function CadreViewer(props) {
    const params = useParams();
    const history = useHistory();

    const rulesetId = props.rulesetId ? props.rulesetId : location.state && location.state.rulesetId;

    const cadresData = getCadresData(rulesetId);

    const cadreId = props.cadreId ? props.cadreId : params.cadreId;
    const models = Object.values(getModelsData()).filter((model) => model.cadre && (model.cadre === cadreId));

    function openModelCard(id) {
        history.push(`/model/${id}`, { rulesetId: rulesetId });
    }

    return (
        <IonPage className={cadresData[cadreId].faction}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton></IonBackButton>
                    </IonButtons>
                    <IonTitle>Back Button</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <CardList rulesetId={rulesetId} header={`Cadre: ${cadresData[cadreId].name}`} cards={models} handleCardClicked={openModelCard}></CardList>
            </IonContent>
        </IonPage>
    );
}

export default CadreViewer;