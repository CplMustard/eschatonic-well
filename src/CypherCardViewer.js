import React from "react";
import {useParams} from "react-router-dom";
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/react";

import { cyphersData, cypherTypesData, factionsData } from "./data";

function CypherCardViewer(props) {
    const params = useParams();

    const cypherId = props.cypherId ? props.cypherId : params.cypherId;
    const cypherData = cyphersData[cypherId];

    function Cypher(props) {
        const { name, factions, type, pow, text } = props;
        return (<IonCard>
            <IonCardHeader>
                <IonCardTitle color="primary"><h1>{name}</h1></IonCardTitle>
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