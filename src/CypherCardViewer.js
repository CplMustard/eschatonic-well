import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLocalStorageState } from "ahooks";
import { IonPage, IonButton, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/react";

import ViewChangesModal from "./ViewChangesModal";

import { getCyphersData, getCypherTypesData, getFactionsData, setRuleset } from "./data";

function CypherCardViewer(props) {
    const params = useParams();

    const [rulesetId] = useLocalStorageState("rulesetId", {defaultValue: "pp", listenStorageChange: true});
    const [playRulesetId] = useLocalStorageState("playRulesetId", {defaultValue: "pp", listenStorageChange: true});

    const [isViewChangesModalOpen, setIsViewChangesModalOpen] = useState(false);

    const isPlayMode = location.state && location.state.isPlayMode;

    useEffect(() => {
        if(isPlayMode) {
            setRuleset(playRulesetId);
        } else {
            setRuleset(rulesetId);
        }
    }, [isPlayMode]);

    const cypherId = props.cypherId ? props.cypherId : params.cypherId;
    const cypherData = getCyphersData()[cypherId];

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
                    <IonText color="primary"><h1>{factions && getFactionsData()[factions].name}</h1></IonText>
                    <IonText color="primary"><h1>{type && getCypherTypesData()[type].name}</h1></IonText>
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
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton></IonBackButton>
                    </IonButtons>
                    <IonTitle>Back Button</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Cypher name={cypherData.name} factions={cypherData.factions} type={cypherData.type} pow={cypherData.pow} text={cypherData.text}/>
            </IonContent>
        </IonPage>
    );
}

export default CypherCardViewer;