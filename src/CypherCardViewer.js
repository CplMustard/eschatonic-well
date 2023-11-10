import React, { useState, useEffect } from 'react';
import {useParams} from "react-router-dom";
import { IonText, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';

import { cyphersData, cypherTypesData, factionsData } from './data'

function CypherCardViewer(props) {
    const params = useParams();

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cypherData, setCypherData] = useState({});

    const cypherId = props.cypherId ? props.cypherId : params.cypherId;

    useEffect(() => {
        setIsLoaded(true);
        setCypherData(cyphersData[cypherId]);
    }, [cypherId]);

    function Cypher(props) {
        const { name, factions, type, pow, text } = props;
        return <IonCard>
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
        </IonCard>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        return (
            <div>
                <Cypher name={cypherData.name} factions={cypherData.factions} type={cypherData.type} pow={cypherData.pow} text={cypherData.text}/>
            </div>
        );
    }
}

export default CypherCardViewer;