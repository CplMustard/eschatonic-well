import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { IonPage, IonButton, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/react";

import ViewChangesModal from "./ViewChangesModal";
import VersionNumber from "./VersionNumber";

import { getCyphersData, getCypherTypesData, getFactionsData } from "./DataLoader";

function CypherCardViewer(props) {
    const params = useParams();

    const [isViewChangesModalOpen, setIsViewChangesModalOpen] = useState(false);

    const rulesetId = props.rulesetId ? props.rulesetId : location.state && location.state.rulesetId;

    const cyphersData = getCyphersData(rulesetId);
    const cypherTypesData = getCypherTypesData(rulesetId);
    const factionsData = getFactionsData(rulesetId);

    const cypherId = props.cypherId ? props.cypherId : params.cypherId;
    const cypherData = cyphersData[cypherId];

    const collectedChanges = [];
    if(cypherData.changes) {
        collectedChanges.push({ source: cypherData.name, changes: cypherData.changes });
    }

    function Cypher(props) {
        const { name, factions, type, pow, text } = props;
        return (<IonCard>
            <IonCardHeader>
                <IonCardTitle color="primary"><h1>{name}</h1></IonCardTitle>
                {collectedChanges.length !== 0 && <IonButton onClick={() => {setIsViewChangesModalOpen(true);}}>CHANGES</IonButton>}
                <IonCardSubtitle>
                    <IonText color="primary"><h1>{factions && factionsData[factions].name}</h1></IonText>
                    <IonText color="primary"><h1>{type && cypherTypesData[type].name}</h1></IonText>
                    {pow && <IonText color="primary"><h2>POW: {pow}</h2></IonText>}
                </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
                <IonText>{text}</IonText>
            </IonCardContent>
        </IonCard>);
    }

    return (
        <IonPage className={cypherData.factions.length === 1 ? cypherData.factions[0] : ""}>
            <ViewChangesModal isOpen={isViewChangesModalOpen} setIsOpen={setIsViewChangesModalOpen} changeEntries={collectedChanges}></ViewChangesModal>       
            <IonHeader>
                <VersionNumber/>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton></IonBackButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Cypher name={cypherData.name} factions={cypherData.factions} type={cypherData.type} pow={cypherData.pow} text={cypherData.text}/>
            </IonContent>
        </IonPage>
    );
}

export default CypherCardViewer;