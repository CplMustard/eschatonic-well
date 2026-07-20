import React, { useState } from "react";
import { useLocation, useParams, useHistory } from "react-router-dom";

import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton } from "@ionic/react";

import CardList from "./CardList";
import SettingsButton from "./SettingsButton.js";
import SettingsModal from "./modals/SettingsModal.js";

import { getCadresData, getModelsData } from "./DataLoader";

function CadreViewer(props) {
    const params = useParams();
    const history = useHistory();
    const location = useLocation();

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const rulesetId = props.rulesetId ? props.rulesetId : location.state && location.state.rulesetId;

    const cadresData = getCadresData(rulesetId);

    const cadreId = props.cadreId ? props.cadreId : params.cadreId;
    const models = Object.values(getModelsData()).filter((model) => model.cadre && (model.cadre === cadreId));

    function openModelCard(card) {
        const modelId = card.id;
        history.push(`/model/${modelId}`, { rulesetId: rulesetId });
    }

    return (
        <IonPage className={cadresData[cadreId].faction}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>
                    <SettingsButton setIsOpen={setIsSettingsModalOpen}/>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <SettingsModal isOpen={isSettingsModalOpen} setIsOpen={setIsSettingsModalOpen}></SettingsModal>
                <CardList rulesetId={rulesetId} header={`Cadre: ${cadresData[cadreId].name}`} cards={models} handleCardClicked={openModelCard}></CardList>
            </IonContent>
        </IonPage>
    );
}

export default CadreViewer;